let express = require('express');
let router = express.Router();

//import encryption methods and token methods
let {encryptPass, comparePass} = require('./../encrypt.js');
let {genToken, jwtauthMiddlewareFunction} = require('./../auth.js');

//import the models
let user = require('./../models/user.js');
let candidate = require('./../models/candidate.js');

router.get('/profile', jwtauthMiddlewareFunction,  async (req, res) =>{
    try{
        res.status(200).send("Welcome to your profile")
    }
    catch(error){
        console.log(error);
        res.status(500).send("Looks like Some Error Occured !");
    }
})

router.get('/login', async (req, res) =>{
    try{    
        res.status(200).send('This is the login page !!');
    }
    catch(error){
        console.log(error);
        res.status(500).send("Looks like Some Error Occured !");
    }
})

router.post('/login', async (req, res) =>{
    try{
        const {aadharNumber, password} = req.body;

        let this_user = await user.findOne({aadharNumber: aadharNumber});
        console.log(this_user.id);
        if(!this_user) res.status(401).send('Invalid aadhar Number');
        if(this_user.role === 'candidate') res.status(401).redirect('/');

        let userPass = await comparePass(password, this_user.password);
        if(!userPass) res.status(401).send('Invalid password');

        let payload = {
            id: this_user.id,
            randomNumber: Math.random() * 10
        }

        const token = genToken(payload);

        res.cookie('token', token, {httpOnly: true}).redirect('/user/profile');
    }
    catch(error){
        console.log(error);
        res.status(500).send("Looks like Some Error Occured !");
    }
})

router.get('/register', async (req, res) =>{
    try{    
        res.status(200).send('This is the register page !!');
    }
    catch(error){
        console.log(error);
        res.status(500).send("Looks like Some Error Occured !");
    }
})

router.post('/register',  async (req, res) =>{
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

        await newUser.save();
        res.cookie('token', token, {httpOnly: true}).redirect('/user/profile');
        
    }
    catch(error){
        console.log(error);
        res.status(500).send("Looks like Some Error Occured !");
    }
})



router.get('/logout', async (req, res) =>{
    try{
        res.clearCookie('token');
        res.redirect('/user/login');
    }
    catch(error){
        console.log(error);
        res.status(500).send("Looks like Some Error Occured !");
    }
})

module.exports = router;