const jwt = require('jsonwebtoken');

const middleware = {
    checkAuth: (req,res,next) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            // get the token, it's saved as a key value pair example bearer: token, so separate and take second element
            const decodedToken = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET);
            req.userData = {
                email: decodedToken.email,
                userId: decodedToken.userId
            }
            next();
        } catch(error) {
            res.status(401).json({
                message: 'Unauthenticated action!'
            })
        }
    }
}

module.exports = middleware;
