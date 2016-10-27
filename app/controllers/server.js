var path = require('path');
var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan'); // used to see requests
var bodyParser = require('body-parser'); // get body-parser
var router = express.Router();
var app = express();
var port = 1111;
var jwt = require('jsonwebtoken');

var tokenKey = "iminadonaimirai";

//ModelImports
var User = require(path.join(__dirname, '/../models/User.js'));


mongoose.connect("mongodb://localhost:27017/scc_dev");

app.use(express.static(path.join(__dirname, '../../vendors')));
app.use(express.static(path.join(__dirname, '../../build')));
app.use(express.static(path.join(__dirname, '/../views')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure our app to handle CORS requests 18
app.use(function(req, res, next) {res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \ Authorization');
    next();
});


router.param('at',function(request, response, next, name){
    console.log(name);
    if(name)
        next();
});

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '../../views/index.html'));
});

router.get('/tables', function(req, res) {
    res.sendFile(path.join(__dirname + '../../views/tables.html'));
});



// generate the JSON WEB TOKEN.
function generateToken(req){
    console.log("req.headers['user-agent']");
    console.log(req.headers['user-agent']);
    var token = jwt.sign({
        agent: req.body.username,
        exp:   Math.floor(new Date().getTime()/1000) + 60 * 5, // Expires in 5 minutes!
}, tokenKey);  // secret is defined in the environment variable JWT_SECRET
    return token;
}

router.post('/authenticate', function (request, response) {
    User.findOne({username:request.body.username}, function (error, user) {
        if(error){
            return response.json({error:'errorfind', message:'Error at retrieving user data'})
        } else {
            if (user) {
                if (user.comparePass(request.body.password)) {
                    // var token = jwt.sign({username:user.username}, tokenKey, {expiresInSeconds:1});
                    var token = generateToken(request);
                    return response.json({message: 'Login successful', user:user, token:token});
                } else {
                    return response.json({error: 'errorfind', message: 'Invalid username/password'});
                }
            } else {
                return response.json({error: 'notFound', message: 'User not found'});
            }
        }
    });
});


router.use(function (request, response, next) {
    var token = request.body.token || request.query.token || request.headers['x-access-token'];
    var currentUser = request.body.crrUsrName;
    if(token){
        jwt.verify(token, tokenKey, function (error, decoded) {
            if(error){
                if(error.name === "TokenExpiredError"){
                    return response.status(403).send({error:'403',message:"You're late, 15 years late!! D:"});
                }
                return response.status(403).send({error:'403',message:"You came to the wrong neighborhood"});
            } else {
                request.decoded = decoded;
                console.log("decoded.agent = " + decoded.agent );
                console.log("currentUser = " + currentUser);
                if(decoded.agent === currentUser){
                    next();
                } else {
                    return response.status(403).send({error:'403',message:"You came to the wrong neighborhood"});
                }
            }
        })
    } else {
        return response.status(403).send({error:'403',message:"Not Authenticity token"});
    }
});

router.use('/create/user', function (request, response, next) {
    const MIN_SIZE_PASS = 6;
    const MIN_SIZE_USERNAME = 3;
    if(!request.body.password || request.body.password.length < MIN_SIZE_PASS){
       return response.json({error:'shortPass', message:'The password is too short'})
    }
    if(!request.body.username || request.body.username.length < MIN_SIZE_USERNAME){
       return response.json({error:'shortUsername', message:'The username is too short'})
    }
    next();
});

router.post('/create/user',function(request, response){
    var user = new User();
    user.name = request.body.name;
    user.username = request.body.username;
    user.password = request.body.password;

    user.save(function(error){
        if(error){
            console.log(error);
            if(error.code == 11000){
                return response.json({message:'The username already exists'});
            }
        } else {
            response.json({success:true, message: 'User created! :D'})
        }
    })
});


router.get('/users/list',function (request,response) {
    User.find(function (error,users) {
        if(error){
            response.json({error:'errorfind', message:'Error at retrieving users data'})
        } else {
            response.json(users);
        }
    })
});


router.get('/users/find/:id',function (request,response) {
    console.log(request.params.id);
    User.findById(request.params.id, function (error, user) {
        if(error){
            response.json({error:'errorfind', message:'Error at retrieving user data'})
        } else {
            response.json(user);
        }
    });
});

router.post('/users/remove/:id',function (request,response) {
    console.log(request.params.id);
    User.remove({_id:request.params.id}, function (error, user) {
        if(error){
            response.json({error:'errorfind', message:'Error at deleting user'});
        } else {
            response.send("User deleted");
        }
    });
});

router.post('/users/update/:id',function (request,response) {
    User.findById(request.params.id, function (error, user) {
        if(error){
            response.json({error:'errorfind', message:'Error at retrieving user data'})
        } else {
            if(request.body.name)       user.name = request.body.name;
            if (request.body.username)  user.username = request.body.username;
            if (request.body.password)  user.password = request.body.password;
            user.save(function(error){
                if(error){
                        return response.json({error:true,message:'Could not upgrade user'});
                } else {
                    response.json({success:true, message: 'User updated! :D'})
                }
            });
        }
    });
});


// start the server
app.use('/api',router);
app.listen(port);
console.log('Listening through port: ' + port);
