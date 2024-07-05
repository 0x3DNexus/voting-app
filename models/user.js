let mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
    password:{
        type: String,
        required: true
    },
    hasVoted:{
        type: Boolean,
        required: true,
        default: false
    },
    role:{
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter',
        required: true
    },
    votedFor:{
        type: String,
        default: null
    }
})

const user = mongoose.model('user', userSchema);

module.exports = user;