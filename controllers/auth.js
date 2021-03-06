const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.createUser = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) // encrypt password
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(result => {
                    res.status(201).json({
                        message: 'User created successfully.',
                        result: result
                    })
                })
                .catch(err => {
                    res.status(500).json({
                        message: 'Invalid authentication credentials!'
                    });
                });
        });
};

exports.loginUser = (req, res ,next) => {
    let fetchedUser;
    User.findOne({email: req.body.email})
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    message: 'User authentication failed.'
                });
            }
            fetchedUser = user;
            return bcrypt.compare(req.body.password, user.password) // returns a promise
                .then(result => {
                    if (!result) {
                        return res.status(401).json({
                            message: 'User authentication failed.'
                        });
                    }
                    // if the sent password hash is equal to the hash of that user in the DB we generate a token with jwt
                    const token = jwt.sign({
                            email: fetchedUser.email,
                            userId: fetchedUser._id
                        }, process.env.JSON_WEB_TOKEN_SECRET,
                        {
                            expiresIn: '1h'
                        });
                    res.status(200).json({
                        message: 'Authentication was successful.',
                        token: token,
                        expiresIn: 3600,
                        userId: fetchedUser._id
                    })
                }).catch(err => {
                    return res.status(401).json({
                        message: 'Invalid authentication credentials!'
                    });
                })
        })
};
