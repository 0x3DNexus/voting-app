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
        let current_user = await user.findById(req.user.id);
        if(!current_user) return res.status(404).json({message:"User not found !"});

        res.status(200).json(current_user);
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Looks like Some Error Occured !"});;
    }
})

router.get('/login', async (req, res) =>{
    try{
        res.status(200).json({message: "Welcome to Login Page"});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Looks like Some Error Occured !"});;
    }
})

router.post('/login', async (req, res) =>{
    try{
        //clear cookie upon login
        res.clearCookie('token');

        const {aadharNumber, password} = req.body;

        let this_user = await user.findOne({aadharNumber: aadharNumber});
        if(!this_user) res.status(401).json({message: "Invalid aadhar Number"});

        let userPass = await comparePass(password, this_user.password);
        if(!userPass) res.status(401).json({message: "Invalid Password"});
        let payload = {
            id: this_user.id,
            randomNumber: Math.random() * 10
        }

        const token = genToken(payload);

        res.cookie('token', token, {httpOnly: true}).redirect('/user/profile');
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Looks like Some Error Occured !"});;
    }
})

router.get('/register', async (req, res) =>{
    try{    
        res.status(200).json({message: "Welcome to registration page !"});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Looks like Some Error Occured !"});;
    }
})

router.post('/register',  async (req, res) =>{
    try{
        let recievedData = req.body;
        if(!recievedData) res.status(400).json({message: "Something went Wrong ! Try Again !"});

        const { aadharNumber } = recievedData;
        if(await user.findOne({aadharNumber: aadharNumber})) return res.status(400).json({message: "User already exists !"});

        //create a object for the user model
        const newUser = new user(recievedData);
        if(newUser.age < 18) res.status(400).json({message: "User not eligible for voting because age is below 18 yrs old!"});

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
        res.status(500).json({message: "Looks like Some Error Occured !"});;
    }
})

router.put('/:userAadhar', jwtauthMiddlewareFunction, async (req, res) =>{
    try{
        let userAadhar = req.params.userAadhar;
        let body = req.body;
        if(body.password) body.password = await encryptPass(body.password);

        let current_user = await user.findOneAndUpdate({aadharNumber: userAadhar}, {$set: body},
            {new: true, runValidators: true}
        );
        if(!current_user) return res.status(404).json({message: "User not found !"});

        res.status(200).json({message: "Update Successful !"});        
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Looks like Some Error Occured !"});
    }
})

router.get('/logout', async (req, res) =>{
    try{
        res.clearCookie('token');
        res.redirect('/');
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Looks like Some Error Occured !"});;
    }
})

module.exports = router;