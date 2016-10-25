var path = require('path');
var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan'); // used to see requests
var bodyParser = require('body-parser'); // get body-parser
var router = express.Router();
var app = express();
var port = 1111;


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

router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '../../views/index.html'));
});

router.get('/tables', function(req, res) {
    res.sendFile(path.join(__dirname + '../../views/tables.html'));
});

router.use('/create/user', function (request, response, next) {
    const MIN_SIZE_PASS = 6;
    const MIN_SIZE_USERNAME = 3;
    console.log("naaanoo")
    if(!request.body.password || request.body.password.length < MIN_SIZE_PASS){
       return response.json({error:'shortPass', message:'The password is too short'})
    }
    if(!request.body.username || request.body.username.length < MIN_SIZE_USERNAME){
       return response.json({error:'shortUsername', message:'The username is too short'})
    }
    next();
})

router.post('/create/user',function(request, response){
    console.log("hhiihiii")
    var user = new User();
    user.name = request.body.name;
    user.username = request.body.username;
    user.password = request.body.password;

    user.save(function(error){
        if(error){
            console.log(error);
            if(error.code == 11000){
                return response.json({message:'The username already exsits'});
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
    console.log("end");
});


// start the server
app.use('/',router);
app.listen(port);
console.log('Listening through port: ' + port);
