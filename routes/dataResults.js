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
// Check for Errors
pool.connect(err => {
    throw err;
})

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

// Default FootBALL API REQUESTS FOR DATA
router.use((req, res, next) => {
    console.log("Welcome to the Fascinate POC Route");
    next();
});

router.get('/data',(req,res,next)=>{
    executeQuery("Select * from fascinationresults;",res);
});
router.get('/primary-population:organization',(req,res,next)=>{
    let orgFilter = req.params.organization;
    orgFilter = orgFilter.split(':',)[1];
    console.log('Fetching primary population data for organization',orgFilter);

    getPrimaryPopulationData(res, orgFilter);
});
router.get('/dormant-population:organization',(req,res,next)=>{
    let orgFilter = req.params.organization;
    orgFilter = orgFilter.split(':',)[1];
    console.log('Fetching dormant population data for organization',orgFilter);
    getDormantPopulationData(res, orgFilter);
});
router.get('/rangebar-data:boxkey',(req,res,next)=>{
     
    let boxkey = req.params.boxkey;
    // console.log(boxkey);
    boxkey = boxkey.split(':',)[1];
    if(boxkey!=undefined){
       executeQuery(`select * from ViewOrgAdvantages
           where boxKey = ${boxkey}`,res);
    }
    else executeQuery(`select * from ViewOrgAdvantages;`,res);
});

router.get('/secondary-counts',(req,res,next) => {
   executeQuery(`select secondaryadvantage 'Advantage' ,count(secondaryadvantage) 'Total' 
   from fascinationresults group by secondaryadvantage`,res); 
});

router.get('/primary-counts',(req,res,next) => {
   executeQuery(`select primaryadvantage 'Advantage' ,count(primaryadvantage) 'Total' 
   from fascinationresults group by primaryadvantage`,res); 
});

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
function executeQuery(query,res,type = 1) {

    const request = new sqlInstance.Request(pool)
    request.query(query, function (err, result) {
        if (err) {
            console.log(err);
            throw err;
        }

        data = result.recordset;
        // console.log(data);
        res.send(data);
    }); 

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
function getPrimaryPopulationData(res,org){
    const request = new sqlInstance.Request(pool);
    let response = {};
    let population;
    let organizational;
    org = (org==undefined ? "": org)
    // console.log('filter: ', org);
    
    request.query(`select primaryadvantage 'Advantage' ,count(primaryadvantage) 'Total' 
    from vieworgadvantages
    where organization = '${org}'
     group by primaryadvantage
    order by 1;`,  (err, result)=> {
        if (err) {
            console.log(err);
            throw err;
        }else{
            console.log('We got a response for the primary population donut chart',result.recordsets.length);
            organizational = result.recordsets;
            // console.log(organizational);
            const innerRequest = new sqlInstance.Request(pool);
            innerRequest.query(`select primaryadvantage 'Advantage' ,count(primaryadvantage) 'Total' 
            from vieworgadvantages
            where organization != '${org}'
             group by primaryadvantage
            
             order by 1;`,(err2,result2)=>{
            if(err) throw err;
            population = result2.recordsets;
            console.log('We got a response for the primary population donut chart',result2.recordsets.length);

            response.population = population;
            response.organizatinal = organizational
            // console.log(response);
            res.send(response);
            });
    
           
        }        
    }); 
}
function getDormantPopulationData(res,org){
    const request = new sqlInstance.Request(pool);
    let response = {};
    let population;
    let organizational;
    org = (org==undefined ? "": org)
    
    request.query(`select dormantadvantage 'Advantage' ,count(dormantadvantage) 'Total' 
    from vieworgadvantages
    where organization = '${org}'
     group by dormantadvantage
    order by 1;`,  (err, result)=> {
        if (err) {
            console.log(err);
            throw err;
        }else{
            organizational = result.recordsets;
            const innerRequest = new sqlInstance.Request(pool);
            innerRequest.query(`select dormantadvantage 'Advantage' ,count(dormantadvantage) 'Total' 
            from vieworgadvantages
            where organization != '${org}'
             group by dormantadvantage
            
             order by 1;`,(err2,result2)=>{
            if(err) throw err;
            population = result2.recordsets;
            console.log('We got a response for the primary population donut chart',result2.recordsets.length);

            response.population = population;
            response.organizatinal = organizational
            res.send(response);
            });
    
           
        }        
    }); 
}


module.exports = router;