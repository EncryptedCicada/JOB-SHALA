const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');


const userSchema = new mongoose.Schema({

    FirstName: {
        type: String,
        required: true,
        max: 255
    },

    LastName: {
        type: String,
        required: false,
        max: 255
    },

    Company : {
        type : String,
        default : null  
    },

    College : {
        type : String,
        default : null  
    },

    Graduation : {
        type : Number,
        default : null
    },

    role : {
        type : String,
        default : 'Student'
    }
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = new mongoose.model('User', userSchema);