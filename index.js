const express = require('express');


const {graphHandler} = require('./routes/graph');
const bodyparser = require('body-parser');



const app = express();
app.use(bodyparser.json());

app.use('/getGraphData', graphHandler);

app.listen(3000, () => {
    console.log("Listening at 3000");
})