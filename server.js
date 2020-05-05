if (process.env.NODE_ENV == 'production') {
    require('dotenv').config();
}
const express  = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const url = require('url');
const jwt = require('jsonwebtoken');
const config = {secretOrKey:"-=&s%j6m@4m-kAt$PFwaC4Vt2WXE@-8_xe", jwt:'V?EqJ*geF?cYm^%5A=GkzwP&M#!PhEb4UN'};


const port     = process.env.PORT || 3000;
const urlFront = process.env.FRONT || 'http://localhost:4200/';


const User = require('./route/user');


const UserModel = require('./model/user');

// pour gérer la connexion
const PassportLocal = require('./route/passport-auth/local');


// connect to DB
mongoose.connect('mongodb://localhost/auchan-project');
var db = mongoose.connection;

var app = express();


// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(cors());


// Express Session
app.use(session({
    secret: 'mu8rE*YY~J|bS36k72K>9{xjX*nGh$32MµT@8€3r',
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge : 24 * 60 * 60 * 1000 }
}));
app.use(session({
    secret: 'mu8rE*YY~J|bS36k72K>9{xjX*nGh$32MµT@8€3r',
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge : 24 * 60 * 60 * 1000}
}));


// Passport init
app.use(passport.initialize());
app.use(passport.session());



//Route

//login User
app.post('/login', passport.authenticate('local'), PassportLocal.auth);

// register User
app.post('/register', User.register);

// logout user
app.get('/logout', function(req, res){
    req.logout();
    res.redirect(urlFront);
});

// get current user
app.get('/user', passport.authenticate('jwt', { session: false }), User.current);



/*
 *
 *  ROUTE FOR passport login
 *
 */



passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey   : config.secretOrKey
    },
    function (jwtPayload, done) {
        UserModel.getUserById(jwtPayload.data._id, function(err, user) {
            if(user) {
                return done(null, user)
            } else {
                return done(null, false)
            }
        }, err => {return done(null, false)})
    }
));


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    UserModel.getUserById(id, function(err, user) {
        done(err, user);
    });
});


app.listen(port, () => console.log('App listening on port '+port));