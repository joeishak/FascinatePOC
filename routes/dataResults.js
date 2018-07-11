/**Node Packages and Global Object - Declaration / Instantiation */

let express                    = require('express');
let router                     = express.Router();
// let config                     = require('../configuration/config');
let sqlInstance                = require('mssql');
// let db                         = require('../configuration/db');
var config = 
   {
     user: 'serverAdmin', // update me
     password: 'C#form$ru!', // update me
     server: 'infosol-dev-test.database.windows.net',
     database: 'InfosolDB' //update me,
,
     // update me
     options: 
        {
            encrypt: true
        }
   }
const pool                     = new sqlInstance.ConnectionPool(config)
// var Connection = require('tedious').Connection;
// var Request = require('tedious').Request;

// Create connection to database

// var connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through
// connection.on('connect', function(err) 
//    {
//      if (err) 
//        {
//           console.log(err)
//        }
//     else
//        {
//         //    queryDatabase()
//        }
//    }
//  );

// function queryDatabase(sql)
//    { console.log('Reading rows from the Table...');

//        // Read all rows from table
//      request = new Request(
//           sql,
//              function(err, rowCount, rows) 
//                 {
//                     if(err) throw err;
//                     console.log("Inserted");
//                     process.exit();
//                 }
//             );

//      request.on('row', function(columns) {
//         columns.forEach(function(column) {
//             console.log("%s\t%s", column.metadata.colName, column.value);
//          });
//              });
//      connection.execSql(request);
//    }
 let data = require('../data');
// Check for Errors
pool.connect(err => {
    throw err;
})
// function executeQuery(query){

//     const request = new sqlInstance.Request(pool)
//     request.query(query, function (err, result) {
//         if (err) {
//             console.log(err);
//             throw err;
//         }

//         data = result.recordset;
//         if(type!=1){
//             // console.log(data);
//             let seriesData = data;
//             seriesData.forEach(series => {

//                transformSeries(series);
//             });
//             return seriesFormat;
//         }
//         else{
//             return result;
//         }
//     }); 
// }
function executeQuery(query,res,type = 1) {

    const request = new sqlInstance.Request(pool)
    request.query(query, function (err, result) {
        if (err) {
            console.log(err);
            throw err;
        }

        data = result.recordset;
        console.log(data);
        res.send(data);
    }); 

}

class Results {
    constructor(obj){
        // console.log(obj);
        this.ga_gender=obj.ga_gender,
		this.Organization=obj.Organization,
		this.create_date=obj.create_date,
		this.conference_code=obj.conference_code,
		this.primary =obj.primary,
        this.primaryIndex = getIndex(this.primary),
		this.secondary=obj.secondary,
        this.secondaryIndex = getIndex(this.secondary),
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
        this.key = `${this.primaryIndex}${this.secondaryIndex}`
    }

    insertIntoDatabase(execute){
        let sql = `Insert  [fascinationresults] (fUserId, gender, organization,creationDate, `+
            `conference, primaryAdvantage,primaryIndex, secondaryIndex, secondaryAdvantage, dormantAdvantage, archetype,`+
           ` power, trust, prestige, passion, mystique, innovation, alert,boxKey) Values(`+
            `'${this.user_id}', '${this.ga_gender}', '${this.Organization}','${this.create_date}','${this.conference_code}',`+
           ` '${this.primary}',${this.primaryIndex},${this.secondaryIndex},'${this.secondary}','${this.dormant}','${this.archetype}',${this.power},${this.trust},`+
            `${this.prestige},${this.passion},${this.mystique},${this.innovation},${this.alert},${this.key});`;  
        if(execute){
            return sql;

        }
        else{
        //    return  executeQuery(sql);
        }
       
    }
}

function getIndex(advantage){
    switch(advantage) {
            case "innovation":
            return 1;
            break;
            case "passion":
            return 2;        
            break;
            case "power":
            return 3;        
            break;
            case "prestige":
            return 4;        
            break;
            case "trust":
            return 5;                
            break;
            case "mystique":
            return 6;                
            break;
            case "alert":
            return 7;              
            break;
          }
     
    }
// Default FootBALL API REQUESTS FOR DATA
router.use((req, res, next) => {

    console.log("Welcome to the Fascinate POC Route");

    next();
});
router.get('/data',(req,res,next)=>{
    executeQuery("Select * from fascinationresults;",res);
})

router.get('/insertData',(req,res,next)=>{

    let sql = "";
    // let responseArray = data.map( object =>{
    //      return  incommingRow.insertIntoDatabase(false);
    // });
    for(let i = 0; i< data.length; i++) {
        let object = data[i];
        let incommingRow = new Results(object);
        let newSql = incommingRow.insertIntoDatabase(true);
        if(newSql.includes('undefined')){

        }else{
            sql+=newSql;

        }
        // console.log(newSql);

    }

    executeQuery(sql,res,1)

});

module.exports = router;