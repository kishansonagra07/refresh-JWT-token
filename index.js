const express = require("express");
const bodyParser = require("body-parser");
const jwt  = require("jsonwebtoken");
const router = express.Router();
const refreshTokenList = {}; // you can store in your DB too
const app = express();
require('dotenv').config();
app.use(bodyParser.json());

app.get('/', (req,res) => {
    res.status(200).json({ message : "JWT Refresh Token App"});
});

// remaining route access via http://localhost:3000/api/login && post : {email,password}
router.post('/login', (req,res) => {
    const postData = req.body;
    const user = {
        "email" : postData.email,
        "password" : postData.password
    }
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn : process.env.JWT_EXPIRE_IN });
    const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn : process.env.JWT_REFRESH_EXPIRE_IN });
    const listObject = {
        "token" : token,
        "refreshToken" : refreshToken
    }
    refreshTokenList[refreshToken] = listObject;
    res.status(200).json({
        "status" : "success",
        "token" : token,
        "refreshToken" : refreshToken,
        "message" : "Login Successfully"
    });
});

//refresh token route
router.post('/refresh-token', (req,res) => {
    const postData = req.body;
    if((postData.refreshToken) && (postData.refreshToken in refreshTokenList)) { // check if refresh token exists
        const user = {
            "email" : postData.email,
            "password" : postData.password
        }
        const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE_IN});
        
        // update refresh token which is in the list
        refreshTokenList[postData.refreshToken].token = token;
        res.status(200).json({
            "status" : "success",
            "token" : token
        });
    } else {
        res.status(400).json({
            "status" : "error",
            "message" : "Invalid Token",
            "asd" : refreshTokenList
        });
    }
});

// delete refresh token in your list if it is lost or stolen or anything
router.post('/clear-token', (req,res) => {
    var refreshToken = req.body.refreshToken 
    if(refreshToken in refreshTokenList) { 
        delete refreshTokenList[refreshToken]
    } 
     res.status(200).json({
        "status" : "success",
        "message" : "Token Destroyed.."
    });
});

//secure route
router.get('/data', require('./verifyToken') , (req, res) => {
    res.status(200).json({
        "status" : "success",
        "message" : "Accessing secure route.."
    });
});


app.use('/api',router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});