const express = require('express');
const {mongoose} = require('./db/mongoose');
const cors = require('cors')
const {ObjectID} = require('mongodb');
var bodyParser = require('body-parser');
const _ = require('lodash');


var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send("Works");
});

app.post('/user', (req, res) => {

    const user = new User({
        username: 'Anonymus',
        password: 'Test123#',
        email: 'test@email.com',
    })

    user.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.post('/register', (req, res) => {
    const body = _.pick(req.body, ['email', 'username']);
    const user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.get('/user', (req, res) => {
    User.find().then((docs) => {
        res.send(docs);
    }, (e) => {
        res.status(400).send(e);
    });
});



app.get('/user/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/login', (req, res) => {
    var body = _.pick(req.body, ['username', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        // console.log('user', user);
        return user.generateAuthToken().then((token) => {
            res.send(user);
        }, (err) => {
            res.status(400).send(err);
        });
    }).catch((e) => {
        res.status(400).send();
    });
})

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});
