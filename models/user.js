var mongoose = require('mongoose');
var plm = require('passport-local-mongoose');
var UserSchema = new mongoose.Schema({

    
    username : String,
    password : String,
    gender   : String,
    email    : String
    

});

UserSchema.plugin(plm);

module.exports = mongoose.model("user", UserSchema);

