const jwt = require('jsonwebtoken');

const jwtauthMiddlewareFunction = function(req, res, next){

    //check if authorization present in the header or not
    const auth = req.headers.authorization;
    if(!auth) return res.status(401).send("Invalid Authorization");

    //store the token part only
    const token = req.headers.authorization.split(" ")[1];

    if(!token) return res.status(401).send("Unauthorized");

    try{
        //verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY_);
        
        req.user = decodedToken;
        next();
    }
    catch(error){
        res.status(401).send("Invalid Token")
    }
}

//generate Token

const genToken = (reqData) =>{
    return jwt.sign(reqData, process.env.JWT_SECRET_KEY_, { expiresIn: '300s' });
}

module.exports = {genToken, jwtauthMiddlewareFunction};