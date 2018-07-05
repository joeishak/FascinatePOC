/**Node Packages and Global Object - Declaration / Instantiation */

let express                    = require('express');
let router                     = express.Router();
let request                    = require('request');
let config                     = require('../configuration/config');
let sqlInstance                = require('mssql');
let db                         = require('../configuration/db');
const pool                     = new sqlInstance.ConnectionPool(config)


//Check for Errors
pool.connect(err => {
})

function executeQuery(query,res,type = 1) {

    const request = new sqlInstance.Request(pool)
    request.query(query, function (err, result) {
        if (err) {
            console.log(err);
            throw err;
        }

        data = result.recordset;
        if(type!=1){
            // console.log(data);
            let seriesData = data;
            seriesData.forEach(series => {

               transformSeries(series);
            });
            res.send(seriesFormat);
        }
        else{
            res.send( result);
        }
    }); 
}

// Default FootBALL API REQUESTS FOR DATA
router.use((req, res, next) => {

    console.log("Welcome to the Fascinate POC Route");

    next();
});

module.exports = router;