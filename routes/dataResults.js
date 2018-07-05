/**Node Packages and Global Object - Declaration / Instantiation */

let express                    = require('express');
let router                     = express.Router();
let config                     = require('../configuration/config');
let sqlInstance                = require('mssql');
// let db                         = require('../configuration/db');
// const pool                     = new sqlInstance.ConnectionPool(config)
convertExcel = require('excel-as-json').processFile
 let data = require('../data');
//Check for Errors
// pool.connect(err => {
// })

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

class Results {
    constructor(obj){
        console.log(obj);
        this.ga_gender=obj.ga_gender,
		this.Organization=obj.Organization,
		this.create_date=obj.create_date,
		this.conference_code=obj.conference_code,
		this.primary =obj.primary,
		this.secondary=obj.secondary,
		this.dormant=obj.dormant,
		this.archetype=obj.archetype,
		this.user_id=obj.user_id,
		this.power=obj.power,
		this.trust=obj.trust,
		this.prestige=obj.prestige,
		this.passion=obj.passion,
		this.mystique=obj.mystique,
		this.innovation=obj.innovation,
		this.alert=obj.alert
    }
}
// Default FootBALL API REQUESTS FOR DATA
router.use((req, res, next) => {

    console.log("Welcome to the Fascinate POC Route");

    next();
});

router.get('/',(req,res,next)=>{

    
    let responseArray = data.map( object =>{
        let incommingRow = new Results(object);
        return incommingRow;
    })
    res.status(200).send(responseArray);

    

});

module.exports = router;