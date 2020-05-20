var User = require('../model/user');
var nodemailer = require('nodemailer');




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
                            res.status(500).send(err.message).end();
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
    if(req.user.role == "parent") {


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
    
    //if(rechercheCours && rechercheJours && rechercheHeures)
}

module.exports.mailSend = function(emailStudent, emailParent){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'your_email',
          pass: 'your_mot_de_passe'
        }
      });
      
      var mailOptions = {
        from: 'your_email',
        to: emailStudent,
        subject: "Aider un parent",
        text: "Bonjour cher étudiant. Un parent à besoin de votre aide pour les devoirs de ses enfants. Vous pouvez le contacter directement par mail: " + emailParent +
        "Bien à vous"
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}
