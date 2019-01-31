const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');


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
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';

    var token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, 'abc123').toString();

    user.tokens = user.tokens.concat([{ access, token }]);

    return user.save().then(() => {
        return token;
    });
};

UserSchema.statics.findByCredentials = function (username, password) {
    var User = this;

    return User.find().then((docs) => {
        const user = docs[0];

        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            // Use bcrypt.compare to compare password and user.password
            if (user.password == password) {
                resolve(user);
            } else {
                reject();
            }
        });

    });
};

UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
}

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

var User = mongoose.model('User', UserSchema);

module.exports = {
    User
};
