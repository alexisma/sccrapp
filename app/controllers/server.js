/**
 * Main server file
 */

//Module imports
var path = require('path');
var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan'); // used to see requests
var bodyParser = require('body-parser'); // get body-parser
var router = express.Router();
var app = express();
var port = 1111;
const pug = require('pug');


//Import controller Routers
var usersRouter =  require('./Users.js')
var tokens = require('./Tokens.js');


//ModelImports
var User = require(path.join(__dirname, '/../models/User.js'));

//Constant Variables
var tokenKey = "iminadonaimirai";

mongoose.connect("mongodb://localhost:27017/scc_dev");

app.use(express.static(path.join(__dirname, '../../vendors')));
app.use(express.static(path.join(__dirname, '../../build')));
app.use(express.static(path.join(__dirname, '/../views')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(function(req, res, next) {res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \ Authorization');
    next();
});


var countUsers = function () {
    var promise = new Promise((resolve, reject) => {
            User.count({}, function (error, count) {
            if (error) reject("errorCounting");
            resolve(count);
        });
    });
    return promise;
}

app.get('/', function(req, res) {
    var userCount = 4;
    var countPromise = countUsers();
    countPromise.then(function (count) {
        console.log("count = " + count);
        res.render(path.join(__dirname + '../../views/index.pug'),{userCount:count});
    });
});



router.post('/authenticate', function (request, response) {
    User.findOne({username:request.body.username}, function (error, user) {
        if(error){
            return response.json({error:'errorfind', message:'Error at retrieving user data'})
        } else {
            if (user) {
                if (user.comparePass(request.body.password)) {
                    // var token = jwt.sign({username:user.username}, tokenKey, {expiresInSeconds:1});
                    var token = tokens.generateToken(request.body.username);
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


app.use('/api',router);
app.use('/users',usersRouter);
app.listen(port);
console.log('Listening through port: ' + port);
