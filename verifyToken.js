const jwt = require("jsonwebtoken");
require('dotenv').config();

module.exports = (req, res, next) => {
    const token = req.query.token || req.body.token || req.headers['x-access-token'];
    if(token){
        jwt.verify(token, process.env.JWT_SECRET, function (err,decoded){
            if(err){
                return res.status(401).json({
                    "status" : "error",
                    "message" : "Unauthorized access",
                    "asd" : err.stack
                });
            }
            req.decoded = decoded;
            next();
        });
    } else {
        return res.status(403).json({
            "status" : "error",
            "message" : "Token is empty"
        });
    }
}