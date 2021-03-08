const jwt = require('jsonwebtoken');

const middleware = {
    checkAuth: (req,res,next) => {
        try {
            console.log('Middleware called.');
            const token = req.headers.authorization.split(' ')[1]; // get the token, it's saved as a key value pair example bearer: token, so separate and take second element
            jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET);
            next();
        } catch(error) {
            res.status(401).json({
                message: 'Auth failed.'
            })
        }
    }
}

module.exports = middleware;
