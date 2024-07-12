const jwt = require('jsonwebtoken');

const jwtauthMiddlewareFunction = function(req, res, next){

    const token = req.cookies.token;

    if(!token) return res.status(401).redirect('/user/login');

    try{
        //verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY_);
        
        req.user = decodedToken;
        next();
    }
    catch(error){
        res.status(401).json({message:"Invalid Token"});
    }
}

//generate Token

const genToken = (reqData) =>{
    return jwt.sign(reqData, process.env.JWT_SECRET_KEY_);
}

module.exports = {genToken, jwtauthMiddlewareFunction};