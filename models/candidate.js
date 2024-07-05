let mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    age:{
        type: Number,
        required: true
    },
    mobile:{
        type: Number,
        required: true
    },
    aadharNumber:{
        type: Number,
        required: true,
        unique: true,
    },
    address:{
        type: String,
        required: true
    },
    party:{
        type: String,
        required: true,
        unique: true
    },
    noOfVotes:{
        type: Number,
        required: true,
        default: 0
    }
})

const candidate = mongoose.model('candidate', candidateSchema);

module.exports = candidate;