/* Bring in the packages we need to create the express server  */

require('dotenv').config(); // This is for the .env file, the file is used to store passwords, keys and such
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
//const cors = require('cors');

axios.default.withCredentials = true;


const app = express(); // We name the entire express module [app]


const port = process.env.PORT || 5001; // Set port express server to run or 5001

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));


// We will use this in the future
//app.use(cors());
/*
app.use(
    cors({
        origin: ["http://127.0.0.1:3000"],
        methods: ["GET", "POST" ],
        credentials: true,
    })
);
*/

/* Example: How to create a route from here with app.get. But we dont want to fill this file, so we create routes  */
app.get('/example', (req, res) => {
    console.log('Example is working');
    res.json({ message: 'Example is working!' });
});

/* Here we tell express to use the routes folder & contents, which is the route.js file. There we set all our calls to the vrsctest node */
app.use('/', require('./routes/routes'))




// Here we tell app to listen on the port we set
app.listen(port, () => {
    console.log(`Running on http://127.0.0.1:${port}`)
})
