/**
 * User's controller to retrieve and save data.
 */
var express = require('express');
var router = express.Router();
var tokens = require('./Tokens.js');
//Model Imports
var User = require('../models/User.js')
exports = module.exports = {};

router.use(tokens.checkToken);

router.use('/create', function (request, response, next) {
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

router.post('/create',function(request, response){
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


router.get('/list',function (request, response) {
    User.find(function (error,users) {
        if(error){
            response.json({error:'errorfind', message:'Error at retrieving users data'})
        } else {
            response.json(users);
        }
    })
});


router.get('/find/:id',function (request, response) {
    console.log(request.params.id);
    User.findById(request.params.id, function (error, user) {
        if(error){
            response.json({error:'errorfind', message:'Error at retrieving user data'})
        } else {
            response.json(user);
        }
    });
});

router.post('/remove/:id',function (request, response) {
    console.log(request.params.id);
    User.remove({_id:request.params.id}, function (error, user) {
        if(error){
            response.json({error:'errorfind', message:'Error at deleting user'});
        } else {
            response.send("User deleted");
        }
    });
});

router.post('/update/:id',function (request, response) {
    User.findById(request.params.id, function (error, user) {
        if(error){
            response.json({error:'errorfind', message:'Error at retrieving user data'})
        } else {
            if(request.body.name)       user.name = request.body.name;
            if (request.body.username)  user.username = request.body.username;
            if (request.body.password)  user.password = request.body.password;
            user.save(function(error){
                if(error){
                    return response.json({error:true,message:'Could not update user'});
                } else {
                    response.json({success:true, message: 'User updated! :D'})
                }
            });
        }
    });
});

exports.router = router;

exports.countUsers = function () {
    var promise = new Promise((resolve, reject) => {
            User.count({}, function (error, count) {
            if (error) resolve(0);  
            resolve(count);
        });
});
    return promise;
}
