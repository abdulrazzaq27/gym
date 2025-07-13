const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const MemberSchema = new Schema({
    email : {
        type: String,
        required: true,
        unique: true,
    }
})

//this plugin adds username password and methods 
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('Member',MemberSchema);