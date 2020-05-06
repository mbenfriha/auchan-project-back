var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
    username: {
        type: String
    },
    password: {
        type: String
    },
    email: {
        type: String,
        index:true,
        /*validate: {
            validator: function(v, cb) {
                User.find({email: v, _id: { $ne: this._id }}, function(err, docs){
                    cb(docs.length == 0);
                });
            },
            message: 'Cet email a déjà été pris'
        }*/
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
    }
});


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
    let upd = updateUser.body;
    User.findOne(updateUser.user._id, function(err, user) {
        if(upd.newEmail) {
            console.log(upd.newEmail);
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
        } else {

            user.save(function(err) {
                callback(user, err);
            });
        }

    });
}

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        if(err) throw err;
        callback(null, isMatch);
    });
};

module.exports.getAll = function(callback){
    User.find().sort({createdAt: 'desc'}).exec(callback);

};


module.exports.active = function(id, callback) {
    User.findById(id, function(err, user) {
        user.active = !user.active;
        user.save(function (err) {
            callback(err, user);
        });
    })
}