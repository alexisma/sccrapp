/**
 * Created by Alexis on 23/10/16.
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var schema = mongoose.Schema;


var userSchema = new schema({
        name: String,
        username: {type:String, index:{unique:true}, required:true},
        password: {type:String, required:true, select:true},
    },
    {
        collection:'User',
        versionKey: false
    }
);

userSchema.pre('save', function (next) {
    var user = this;
    if(!this.isModified('password')) next();
    bcrypt.hash(this.password, null, null, function(err, hash) {
       if(err) {
           next(err);
       }
        user.password = hash;
        next();
    });
});

userSchema.methods.comparePass = function(pass){
    return bcrypt.compareSync(pass, this.password);
};

module.exports = mongoose.model('User',userSchema);