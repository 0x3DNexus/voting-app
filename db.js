let mongoose = require('mongoose');

let dbURL = 'mongodb://localhost:27017/election';
mongoose.connect(dbURL);

let db = mongoose.connection;

db.on('connected', () =>{
    console.log("Connected to database");
})

db.on('disconnected', () =>{
    console.log("Disconnected from database");
})

db.on('error', (error) =>{
    console.log("MongoDB connection error" + error);
})

//export the db object
module.exports = db;
