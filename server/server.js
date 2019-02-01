const express = require("express");
const { mongoose } = require("./db/mongoose");
const cors = require("cors");
const { ObjectID } = require("mongodb");
var bodyParser = require("body-parser");
const _ = require("lodash");
const tokenList = {};
const config = require("./config/config.json");
const jwt = require("jsonwebtoken");

var { User } = require("./models/user");
var { authenticate } = require("./middleware/authenticate");

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Works");
});

app.post("/user", (req, res) => {
  const user = addDummyUser();

  user.save().then(
    doc => {
      res.send(doc);
    },
    e => {
      res.status(400).send(e);
    }
  );
});

/**
 *
 * Register - using username/email
 * get back
 */
app.post("/register", (req, res) => {
  const body = _.pick(req.body, ["email", "username"]);
  const user = new User(body);
  const dummy = addDummyUser();

  //generate password
  const random = randomPassword();
  user.password = random;

  User.remove()
    .then(() => {
        dummy.save();
    })
    .then(() => {
      return user.save();
    })
    .then(token => {
      res.send({user, random});
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

/*
 * Reset password
 */
app.post("/resetpassword", (req, res) => {
  const body = _.pick(req.body, ["username", "email"]);
  const username = body.username;

  User.findOne({ username }).then(
    user => {
      const random = randomPassword();
      user.password = random;
      user
        .save()
        .then(token => {
          res.send({user, random});
        })
        .catch(e => {
          res.status(400).send(e);
        });
    },
    e => {
      res.status(400).send(e);
    }
  );
});

app.post("/login", (req, res) => {
  var body = _.pick(req.body, ["username", "password"]);
  var refreshToken = jwt.sign({ _id: randomPassword()}, '123456').toString();

  User.findByCredentials(body.username, body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res.header("x-auth").send({user, token, refreshToken});
      });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

app.get("/user", (req, res) => {
  User.find().then(
    docs => {
      res.send(docs);
    },
    e => {
      res.status(400).send(e);
    }
  );
});

app.get("/user/me", authenticate, (req, res) => {
  res.send(req.user);
});

function addDummyUser() {
  return new User({
    username: "Anonymus",
    password: "Test123#",
    email: "test@email.com"
  });
}

/**
 * Stupid function
 */
function randomPassword() {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  return (
    Array(1)
      .fill(uppercase)
      .map(function(x) {
        return x[Math.floor(Math.random() * x.length)];
      })
      .join("") +
    Array(5)
      .fill(lowercase)
      .map(function(x) {
        return x[Math.floor(Math.random() * x.length)];
      })
      .join("") +
    Array(2)
      .fill(numbers)
      .map(function(x) {
        return x[Math.floor(Math.random() * x.length)];
      })
      .join("")
  );
}

app.get("/password", (req, res) => {
  const password = randomPassword();
  return res.send({ password });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
