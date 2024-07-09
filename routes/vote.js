let express = require('express');
let router = express.Router();

//import encryption methods and token methods
let {genToken, jwtauthMiddlewareFunction} = require('./../auth.js');

//import the models
let user = require('./../models/user.js');
let candidate = require('./../models/candidate.js');


router.get('/', jwtauthMiddlewareFunction,  async (req, res) =>{
    try{
        //get all the candidates and send to the client side
        let allCandidates = await candidate.find();
        res.status(200).json(allCandidates); 
    }
    catch(error){
        console.log(error);
        res.status(500).send("Looks like Some Error Occured !");
    }
})

router.post('/', jwtauthMiddlewareFunction, async (req, res) =>{
    try{
        let {party} = req.body;

        let voter = await user.findById(req.user.id);
        if(!voter) res.status(400).send("Voter not found !!!");
        if(voter.role === 'admin') res.status(200).send("Admin cannot vote !!!")
        console.log(voter);

        //check wheather the voter has already voted or not
        if(voter.hasVoted) return res.status(200).json("Voter has already voted !");

        let this_candidate = await candidate.findOne({party: party});
        if(!this_candidate) res.status(400).send("Candidate not found !!!");
        console.log(this_candidate);

        voter.votedFor = this_candidate.party;
        voter.hasVoted = true;
        await voter.save();

        this_candidate.noOfVotes += 1;
        await this_candidate.save();
        res.status(200).json("Vote Successful !");
    }
    catch(error){
        console.log(error);
        res.status(500).send("Looks like Some Error Occured !");
    }
})

module.exports = router;