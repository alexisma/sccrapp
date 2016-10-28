/**
 * Controller that handles token operations like creating and verifying
 */
var jwt = require('jsonwebtoken');
var tokenKey = "iminadonaimirai";

exports = module.exports = {};

exports.checkToken = function (request, response, next) {
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
};


// generate the JSON WEB TOKEN.
exports.generateToken = function(username){
    var token = jwt.sign({
        agent: username,
        exp:   Math.floor(new Date().getTime()/1000) + 60 * 5, // Expires in 5 minutes!
    }, tokenKey);  // secret is defined in the environment variable JWT_SECRET
    return token;
}