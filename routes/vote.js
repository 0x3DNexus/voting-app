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

        let this_voter = await user.findById(req.user.id);
        let this_candidate = await candidate.findOne({party: party});

        if(!this_voter) res.status(400).send("voter not found !!!");
        if(!this_candidate) return res.status(400).json({message: "Candidate not found !"});
        if(this_voter.role === 'admin') return res.status(200).json({message: "Admin cannot vote"});

        //check wheather the this_this_voter has already voted or not
        if(this_voter.hasVoted) return res.status(400).json({message: "Voter has already voted"});        
        
        this_voter.votedFor = this_candidate.party;
        this_voter.hasVoted = true;
        await this_voter.save();

        this_candidate.noOfVotes += 1;
        await this_candidate.save();
        res.status(200).json({message: "Vote Successful !"});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Looks like Some Error Occured !"});
    }
})

module.exports = router;