let express = require('express');
let router = express.Router();

//import encryption methods and token methods
let {encryptPass, comparePass} = require('./../encrypt.js');
let {genToken, jwtauthMiddlewareFunction} = require('./../auth.js');

//import the models
let candidate = require('./../models/candidate.js');
let user = require('./../models/user.js');

async function checkVoter(req, res, next){
    //extract the id and find by the id
    let this_user = await user.findById(req.user.id);
 
    //if the user is a voter then redirect to home page
    if(this_user.role === 'voter') return res.status(401).redirect('/');
    next();
}

router.get('/candidateProfile', jwtauthMiddlewareFunction, checkVoter, async (req, res) =>{
    try{
        res.status(200).send("Welcome to your Candidate profile")
    }
    catch(error){
        console.log(error);
        res.status(500).send("Looks like Some Error Occured !");
    }
})

router.get('/register', checkVoter, async (req, res) =>{
    try{    
        res.status(200).send('This is the Candidate register page !!');
    }
    catch(error){
        console.log(error);
        res.status(500).send("Looks like Some Error Occured !");
    }
})

router.post('/register', jwtauthMiddlewareFunction, checkVoter, async (req, res) =>{
    try{
        let recievedData = req.body;
        if(!recievedData) res.status(400).send("Something Went Wrong ! Try Again !");

        //create a object for the candidate model
        const newcandidate = new candidate(recievedData);
        
        if(newcandidate.age < 18) res.status(400).send("candidate not eligible for voting because age is below 18 yrs old!")

        //return a jwt
        const payload = {
            id: req.user.id,
            randomNumber: Math.random() * 10
        }

        const token = genToken(payload);

        await newcandidate.save();
        res.cookie('token', token, {httpOnly: true}).redirect('/candidate/profile');
        
    }
    catch(error){
        console.log(error);
        res.status(500).send("Looks like Some Error Occured !");
    }
})

router.get('/logout', async (req, res) =>{
    try{
        res.clearCookie('token');
        res.redirect('/');
    }
    catch(error){
        console.log(error);
        res.status(500).send("Looks like Some Error Occured !");
    }
})

module.exports = router;