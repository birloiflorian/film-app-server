const express = require('express');
var {mongoose} = require('./db/mongoose');
var {ObjectID} = require('mongodb');
var bodyParser = require('body-parser');


var {User} = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/user', (req, res) => {
    res.status(200).send({ text: "Create user!"});
});

app.get('/movies', (req, res) => {
    console.log("Get data");
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

