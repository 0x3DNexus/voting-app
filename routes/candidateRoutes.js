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

router.get('/candidateProfile/:party', jwtauthMiddlewareFunction, checkVoter, async (req, res) =>{
    try{
        let party = req.params.party;
        let current_candidate = await candidate.findOne({party: party});
        if(!current_candidate) return res.status(404).json({message: "Candidate not found !"});

        res.status(200).json(current_candidate);
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Looks like Some Error Occured !"});
    }
})

router.get('/register', jwtauthMiddlewareFunction, checkVoter, async (req, res) =>{
    try{    
        res.status(200).json({message:"Welcome to Candidate registration page"});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Looks like Some Error Occured !"});
    }
})

router.post('/register', jwtauthMiddlewareFunction, checkVoter, async (req, res) =>{
    try{
        let recievedData = req.body;
        if(!recievedData) res.status(400).json({message:"Something went Wrong ! Try Again !"});

        //create a object for the candidate model
        const newcandidate = new candidate(recievedData);
        
        if(newcandidate.age < 18) res.status(400).json({message: "candidate not eligible for voting because age is below 18 yrs old!"});

        //return a jwt
        const payload = {
            id: req.user.id,
            randomNumber: Math.random() * 10
        }

        const token = genToken(payload);

        await newcandidate.save();

        const party = newcandidate.party;
        res.cookie('token', token, {httpOnly: true}).redirect(`/candidate/candidateProfile/${party}`);
        
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Looks like Some Error Occured !"});
    }
})

router.put('/:candidateAadhar', jwtauthMiddlewareFunction, checkVoter, async (req, res) =>{
    try{
        let candidateAadhar = req.params.candidateAadhar;
        let body = req.body;
        if(body.password) body.password = await encryptPass(body.password);
        
        let current_candidate = await candidate.findOneAndUpdate({aadharNumber: candidateAadhar}, {$set: body},
            {new: true, runValidators: true}
        );
        if(!current_candidate) return res.status(404).json({message: "Candidate not found !"});

        res.status(200).json({message: "Update Successful !"});        
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Looks like Some Error Occured !"});
    }
})

router.delete('/:candidateAadhar', jwtauthMiddlewareFunction, checkVoter, async (req, res) =>{
    try{
        let candidateAadhar = req.params.candidateAadhar;
        let this_candidate = await candidate.findOne({aadharNumber: candidateAadhar});
        if(!this_candidate) res.status(404).json({message: "Candidate not found"});

        let votedUser = await user.updateMany({votedFor: this_candidate.party}, {$set:{votedFor: null}});
        
        await this_candidate.deleteOne();

        res.status(200).json({message: "Candidate deleted Successfully !"})
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Looks like Some Error Occured !"});
    }
})

module.exports = router;