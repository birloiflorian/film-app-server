var mongoose = require('mongoose');

var User = mongoose.model('User', {
    username: {
        required: true,
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 8
    },
    email: {
        required: true,
        type: String,
        trim: true,
        maxlength: 30
    },
    password: {
        type: String,
        trim: true
    },
    token: {
        type: String,
        trim: true
    },
    token_expiration_time: {
        type: Number,
        trim: true
    }
});

module.exports = { User };
