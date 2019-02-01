const _ = require('lodash');
const bcrcypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createTokens = async (user, secret, secret2) => {

    const createToken = jwt.sign(
        {
            user: _.pick(user, ['username'])
        },
        secret,
        {
            expiresIn: '1m'
        }
    );

    const createRefreshToken = jwt.sign(
        {
            user: _.pick(user, ['username'])
        },
        secret2,
        {
            expiresIn: '1h'
        }
    );

    return Promise.all([createToken, createRefreshToken]);
};

module.exports = {createTokens};
