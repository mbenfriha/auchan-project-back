var User = require('../model/user');




module.exports.register = function(req, res) {
    var password = req.body.password;
    var password2 = req.body.password2;

    if (password == password2){
        var newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });

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
    res.send(user).end();
};
