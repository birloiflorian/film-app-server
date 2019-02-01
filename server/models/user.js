const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrcypt = require('bcryptjs');
const config = require('./../config/config.json');


var UserSchema = new mongoose.Schema({
    username: {
        required: true,
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 8,
        unique: true
    },
    email: {
        type: String,
        trim: true,
        maxlength: 30,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        trim: true
    },
    token: {
        type: String
    },
    refresh_token: {
        type: String
    }
});

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';

    var token = jwt.sign({ _id: user._id.toHexString(), access }, 'abc123', {expiresIn: config.tokenLife}).toString();

    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email', 'username']);
}

UserSchema.statics.findByCredentials = function (username, password) {
    var User = this;
    console.log("username", username);
    return User.findOne({username}).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrcypt.compare(password, user.password, (err, res) => {
                if(res) {
                    resolve(user);
                }else {
                    reject();
                }
            });
        });

    });
};

UserSchema.statics.findByToken = function(token) {
    const User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, 'abc123');
    } catch(e) {
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });

}

UserSchema.pre('save', function(next) {
    const user = this;

    if(user.isModified('password')) {
        bcrcypt.genSalt(10, (err, salt) => {
            bcrcypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        })
    } else {
        next();
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = {
    User
};
