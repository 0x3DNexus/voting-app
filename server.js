const app = require('express')();
const db = require('./db.js');
require('dotenv').config();

const port = process.env.PORT || 3000;

//accept the post http request and parse the body
let body_parser = require("body-parser");
app.use(body_parser.json());

app.listen(port, () =>{
    console.log("Listening on port " + port);
})

app.get('/', (req, res) =>{
    res.status(200).send("Welcome to Voting Portal !!!");
})

//require the necessary routes
let userRoute = require('./routes/userRoutes.js');
let candidateRoute = require('./routes/candidateRoutes.js');

app.use('/user', userRoute);