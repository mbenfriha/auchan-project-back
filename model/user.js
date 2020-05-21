var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var TypeCoursSchema = mongoose.Schema({
    _id:{
        type: Number
    },
    nomCours : {
        type: String
    }
})

var NiveauSchema = mongoose.Schema({
    classe:{
        type: Number
    },
    nomClasse:{
        type: String
    }
})

// Contact Schema
var ContactSchema = mongoose.Schema({
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    }
})

// User Schema
var UserSchema = mongoose.Schema({
    password: {
        type: String,
        required: true,
    },
    documents: {
        type:[DocumentSchema]
    },
    email: {
        type: String,
        index:true,
        required: true,
        validate: {
            isAsync: true,
            validator: function(v, cb) {
                User.find({email: v, _id: { $ne: this._id }}, function(err, docs){
                    cb(docs.length == 0);
                });
            },
            message: 'Cet email a déjà été pris'
        }
    },
    horaires : {
        type: [String],
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String ,
        default: "parent",
    },
    active : {
        type: Boolean,
        default: false
    },
    nbreDenfants: {
        type: Number,
        //required: true
    },
    cours: {
        type: [TypeCoursSchema]
    },
    niveaux: {
        type: [NiveauSchema]
    }



});

var DocumentSchema = mongoose.Schema({
    name : {
        type : String
    },
    base64:{
        type: String
    },
    
})


var Contact = module.exports = mongoose.model('Contact', ContactSchema);


var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
    
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save(function(err) {
                callback(newUser, err);
            });
        });
    });
}
module.exports.updateUser = function(updateUser, callback) {
    console.log(updateUser.user);
    let upd = updateUser.body;
    User.findOne(updateUser.user._id, function(err, user) {
        if(upd.newEmail) {
            user.email = upd.newEmail;
        }
        if(upd.password) {
            console.log(upd.password);
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(upd.password, salt, function(err, hash) {
                    user.password = hash;
                    user.save(function(err) {
                        callback(user, err);
                    });
                });
            });
        }
        if(upd.cours) {
            user.cours = upd.cours;
            user.save(function(err) {
                callback(user, err);
            });
        }
        else {

            user.save(function(err) {
                callback(user, err);
            });
        }

    });
}

module.exports.delUser = function(delUser, callback) {

    User.findById(delUser.user._id, function(err, delUser){
        delUser.active = false;
        delUser.save(function(err){
            callback(err,delUser);
        });
    })
}

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        if(err) {throw err};
        callback(null, isMatch);
    });
};

module.exports.getAll = function(callback){
    User.find().sort({createdAt: 'desc'}).exec(callback);

};

module.exports.getAllStudentByCours = function(name,callback){
    if(name) {
        User.find({'cours.nomCours': name, 'role': 'etudiant'}).sort({createdAt: 'desc'}).exec(callback);
    } else {
        console.log('etudiant sans cours');
        User.find({role: "etudiant"}).sort({createdAt: 'desc'}).exec(callback);

    }

};

module.exports.getAllStudent = function(callback){
    User.find({role: "etudiant"}).select('-password').sort({createdAt: 'desc'}).exec(callback);

};

module.exports.active = function(id, callback) {
    User.findById(id, function(err, user) {
        user.active = !user.active;
        user.save(function (err) {
            callback(err, user);
        });
    })
}

module.exports.count = function(callback) {
    User.countDocuments({role: "etudiant"},function(err, countStudent){
        User.countDocuments({role: "parent"}, function (errB, countParent){
            Contact.countDocuments({}, function(errC, countContact) {
                callback(err, {student: countStudent, parent: countParent, contact: countContact})
            });
        })
    });
}

module.exports.contactAdd = function(mail, callback) {
    var contact = new Contact({
        from: mail.parent,
        to: mail.student
    })

    contact.save(function(err) {
        callback(contact, err)
    })
}