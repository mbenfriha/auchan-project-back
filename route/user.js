var User = require('../model/user');
var nodemailer = require('nodemailer');


var smtpInfo = {
    host: '',
    port: 587,
    user: '',
    password: '',
}




module.exports.register = function(req, res) {    
    var password = req.body.password;
    var password2 = req.body.password2;

    console.log(req.body);
    var newUser = new User({
    
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        role: req.body.selected,
        cours:req.body.selectedItems,
        niveaux: req.bodyselectedItems1,
        horaires: req.body.dateHeure,
        documents: req.body.documents,
        nbreDenfants: req.body.nbreDenfants
    });
    
    if (password == password2){
  
                User.createUser(newUser, function(user, err) {
                    if (err) {
                        var error;
                        if (err.name == 'ValidationError') {
                            for (field in err.errors) {
                            }
                            res.status(500).send({message: err.message}).end();
                        } else {
                            res.status(500).send(err).end();
                        }
                    } else {
                        res.send(user).end()
                    }
                });
            

    } else{
        res.status(500).send({message: "Passwords don't match"}).end()
    }
};

module.exports.current = function(req, res) {
    User.getUserById(req.user._id, function(err, user) {
        if(user){
            res.send(user).end();
        } else {
            res.status(404).send({message: "Cette utilisateur n'existe pas"}).end()
        }

    }, (err) => res.status(404).send(err).end())
};

module.exports.all = function(req, res) {
    if(req.user.role == "admin") {


        User.getAll(function(err, user) {
            if(user){
                res.send(user).end();
            } else {
                res.status(404).send({message: "Cette utilisateur n'existe pas"}).end()
            }

 

        }, (err) => res.status(404).send(err).end())
    } else {
        res.status(401).send({message: "Vous n'êtes pas admin"}).end()
    }
};

module.exports.allStudent = function(req, res) {
    if(req.user.role == "parent") {


        User.getAllStudent(function(err, user) {
            if(user){
                res.send(user).end();
            } else {
                res.status(404).send({message: "Cette utilisateur n'existe pas"}).end()
            }

 

        }, (err) => res.status(404).send(err).end())
    } else {
        res.status(401).send({message: "Vous n'êtes pas admin"}).end()
    }
};

module.exports.recherche = function(req, res){
    User.getAllStudentByCours(req.params.typeCours, function(err,user){
        if(user){
            res.send(user).end();
        } else {
            res.status(404).send({message: "Aucun étudiant trouvé"}).end()
        }
    });
}

module.exports.update = function(req, res){
    User.updateUser(req, function(user, err) {
        if(err) {
            res.status(500).send(err).end();
        } else {
            delete user.password;
            res.send(user).end();
        }
    })
}

module.exports.mailSend = function(req, res){
    var transporter = nodemailer.createTransport({
        host: smtpInfo.host,
        port: smtpInfo.port,
        auth: {
            user: smtpInfo.user,
            pass: smtpInfo.password
        }

      });
      
      var mailOptions = {
        from: "benfriha.mohamed@gmail.com", // a changé par : req.body.emailParent
        to: req.body.emailStudent,
        subject: "Un parent vous a contacté - Auchan",
        text: "Bonjour cher étudiant. Un parent a besoin de votre aide pour les devoirs de ses enfants. Vous pouvez le contacter directement par mail: " + req.body.emailParent +
            "\n"+
            "Ou vous pouvez directement réponde à ce mail"+
        "Bien à vous"
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            res.status(500).send({message: error}).end();
        } else {
            User.contactAdd({student: req.body.emailStudent, parent: req.body.emailParent}, function(err, res) {
                res.send({message: 'Email sent: ' + info.response}).end();
            })
        }
      });
}

module.exports.setActive = function(req, res) {
    User.active(req.params.id, function (err, user) {
        res.send(user).end();
    }, err => {
        res.status(500).send({message: "Une erreur est survenue"}).end()
    })
}

module.exports.getCount = function(req, res) {

    if(req.user.role == "admin") {

        User.count(function (err, count) {
            res.send(count).end();
        }, err => {
            res.status(500).send({message: "Une erreur est survenue"}).end()
        })
    }else {
        res.status(401).send({message: "Vous n'êtes pas admin"}).end()
    }
}
