let express = require('express');
let router = express.Router();

//import encryption methods and token methods
let {encryptPass, comparePass} = require('./../encrypt.js');
let {genToken, jwtauthMiddlewareFunction} = require('./../auth.js');

//import the models
let user = require('./../models/user');

router.get('/profile', jwtauthMiddlewareFunction, async (req, res) =>{
    try{
        if(!req.user) res.redirect('/user/login');
        res.send('This is profile')
    }
    catch{
        res.status(500).send("Looks like Some Error Occured !");
        console.log(error);
    }
})

router.post('/login', async (req, res) =>{
    try{
        console.log('This is the login page')
        const {aadharNumber, password} = req.body;
        console.log(aadharNumber);
        console.log(password);

        let this_user = await user.findOne({aadharNumber: aadharNumber});
        if(!this_user) res.status(401).redirect('/');

        let userPass = comparePass(password, this_user.password);
        if(!userPass) res.status(401).redirect('/');

        let payload = {
            id: this_user.id,
            randomNumber: Math.random() * 10
        }

        const token = genToken(payload);
        console.log("token = " + token);
        
        res.redirect('/user/profile');
        // res.status(200).send({"token": token});
    }
    catch(error){
        res.status(500).send("Looks like Some Error Occured !");
        console.log(error);
    }
})

router.post('/register', async (req, res) =>{
    try{
        let recievedData = req.body;
        if(!recievedData) res.status(400).send("Something Went Wrong ! Try Again !");

        //create a object for the user model
        const newUser = new user(recievedData);
        
        if(newUser.age < 18) res.status(400).send("User not eligible for voting because age is below 18 yrs old!")

        //encrypt the password before saving
        newUser.password = await encryptPass(newUser.password);

        //return a jwt
        const payload = {
            id: newUser.id,
            randomNumber: Math.random() * 10
        }

        const token = genToken(payload);
        console.log("token = " + token);

        await newUser.save();
        // res.redirect('/profile');
        // res.status(200).send({response: "Data Saved !!", token: token});
        res.redirect('/user/profile');
        
    }
    catch(error){
        res.status(500).send("Looks like Some Error Occured !");
        console.log(error);
    }
})

module.exports = router;