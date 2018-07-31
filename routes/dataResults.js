/**Node Packages and Global Object - Declaration / Instantiation */

let express                    = require('express');
let router                     = express.Router();
// let config                     = require('../configuration/config');
let sqlInstance                = require('mssql');
// let db                         = require('../configuration/db');
let data = require('../data');
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
		this.Organization=obj.organization,
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
        let sql = `Insert  into dbo.fascinationresults (fUserId, gender, organization, `+
            `conference, primaryAdvantage,primaryIndex, secondaryIndex, secondaryAdvantage, dormantAdvantage, archetype,`+
           ` power, trust, prestige, passion, mystique, innovation, alert,boxKey) Values(`+
            `'${this.user_id}', '${this.ga_gender}', '${this.Organization}','${this.conference_code}',`+
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
router.get('/shuffler',(req,res,next)=>{
    executeQuery(`Select top 25 * from dbo.fascinationresults ;`,res);

})
// // Default FootBALL API REQUESTS FOR DATA
// router.use((req, res, next) => {
//     console.log("Welcome to the Fascinate POC Route");
//     next();
// });
router.get('/genderData/:conference/:organization/:boxkey',(req,res,next)=>{

    let conFilter = req.params.conference.split(':',)[1];
    let orgFilter = req.params.organization.split(':',)[1];
    let boxFilter = req.params.boxkey.split(':',)[1];


    console.log("Retreiving gender data", orgFilter,conFilter,boxFilter);

    getGenderData(orgFilter,conFilter,boxFilter,res);
});
router.get('/data/:conference/:organization',(req,res,next)=>{
    console.log("Retreiving grid tile data");
    let conFilter = req.params.conference.split(':',)[1];
    let orgFilter = req.params.organization.split(':',)[1];
    // conFilter = req.params.conference=='all' ? '' :conFilter;
    if(conFilter == "all"  && orgFilter!= "all"){
    executeQuery(`Select * from dbo.fascinationresults where organization like'%${orgFilter}%';`,res);
        
    } else if(conFilter !="all" && orgFilter!= "all") {
    executeQuery(`Select * from dbo.fascinationresults where conference like '%${conFilter}%' and organization like'%${orgFilter}%';`,res);
        
    } else if(conFilter == "all" && orgFilter == "all"){
    executeQuery(`Select * from dbo.fascinationresults ;`,res);

    }
        else {
    executeQuery(`Select * from dbo.fascinationresults where conference like '%${conFilter}%';`,res);

    }

});
router.get('/primary-population/:organization/:conference',(req,res,next)=>{
    let orgFilter = req.params.organization.split(':',)[1];
    let conFilter = req.params.conference.split(':',)[1];
    conFilter = (conFilter=='all') ? '' : conFilter;

    console.log('Fetching primary archetype population data for organization',orgFilter,conFilter);
    getPrimaryPopulationData(res, orgFilter,conFilter);
});

router.get('/secondary-population/:organization/:conference',(req,res,next)=>{
    let orgFilter = req.params.organization.split(':',)[1];
    let conFilter = req.params.conference.split(':',)[1];
    conFilter = conFilter=='all' ? '' :conFilter;

    console.log('Fetching secondary archetype population data for organization',orgFilter,conFilter);

    getSecondaryPopulationData(res, orgFilter,conFilter);
});



router.get('/dormant-population/:organization/:conference', (req,res,next) => {
    let orgFilter = req.params.organization.split(':',)[1];
    let conFilter = req.params.conference.split(':',)[1];
    conFilter = conFilter=='all' ? '' : conFilter;
 
    // orgFilter = orgFilter.split(':',)[1];
    // conFilter = conFilter.split(':',)[1]
    // console.log(orgFilter);
    // console.log(conFilter);
    
    console.log('Fetching dormant population data for organization',orgFilter, conFilter);
    getDormantPopulationData(res, orgFilter,conFilter);
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

router.get('/organizations/:conference',(req,res,next)=>{
    // console.log(req.params.conference);
    let conFilter = req.params.conference.split(':',)[1];
    // this.conFilter = req.params.conference=='all' ? '' :this.conFilter;

    // console.log('Getting organizations for conferenece', conFilter)
    if(conFilter =="all"){
    executeQuery(`select top 10 organization, count(organization) as 'value'
    from ViewOrgAdvantages
    group by organization
    order by 2 desc;`,res);

    }else{
        executeQuery(`select top 10 organization, count(organization) as 'value'
        from ViewOrgAdvantages
        where conference like '%${conFilter}%'
        group by organization
        order by 2 desc;`,res);

    }

});

// router.get('/secondary-counts',(req,res,next) => {
//    executeQuery(`select secondaryadvantage 'Advantage' ,count(secondaryadvantage) 'Total' 
//    from fascinationresults group by secondaryadvantage`,res); 
// });

// router.get('/primary-counts',(req,res,next) => {
//    executeQuery(`select primaryadvantage 'Advantage' ,count(primaryadvantage) 'Total' 
//    from fascinationresults group by primaryadvantage`,res); 
// });

router.get('/insertData',(req,res,next)=>{

   let sql = "";
   // let responseArray = data.map( object =>{
   //      return  incommingRow.insertIntoDatabase(false);
   // });
   for(let i = 0; i< data.length; i++) {
       let object = data[i];
       let incommingRow = new Results(object);
       let newSql = incommingRow.insertIntoDatabase(true);
      
           sql+=newSql;

       // console.log(newSql);
    }
    res.send(sql);
//    executeQuery(sql,res,1)
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
function getGenderData(orgFilter,conFilter,boxFilter,res){
    console.log("Executing gender data query", orgFilter,conFilter,boxFilter);

    let responseObj = {conference:[],organization:[],box:[]};
    const request = new sqlInstance.Request(pool);
    let orgCategory = (orgFilter=="all"? "all": orgFilter);
    let confCategory = (conFilter=="all"? "all": conFilter);

    let maleVal, femaleVal, otherVal = 0;
     conFilter = (conFilter=="all"? "": conFilter);
     orgFilter = (orgFilter=="all"? "": orgFilter);
    
    let conferenceGendersSql = `select gender, count(gender) 'Value'
    from dbo.fascinationresults
    where conference like '%${conFilter}%'
    group by gender`;

    let organizationGenderSql = `select gender, count(gender) 'Value'
    from dbo.fascinationresults
    where organization like '%${orgFilter}%'
    and conference like '%${conFilter}%'
    group by gender`;

    let boxKeyGenderSql = `select gender, count(gender) 'Value'
    from dbo.fascinationresults
    where conference like '%${conFilter}%'
    and organization like '%${orgFilter}%'
    and boxkey = ${boxFilter}
    group by gender`
    // console.log(boxKeyGenderSql);
    //Get Total Genders for Conference
    request.query(conferenceGendersSql,  (err, result)=> {
            if (err) {
                console.log(err);
                throw err;
            }else{
               
                // console.log("Result for Conference Genders", result.recordset.length);
                responseObj.conference = result.recordset;

                const innerRequest = new sqlInstance.Request(pool);
                //Get Total Genders for Organization at the Conference
                innerRequest.query(organizationGenderSql,(err1,result1) => {
                    if (err1) {
                        console.log(err1);
                        throw err1;
                    }
                    responseObj.organization = result1.recordset;
                     
    
           
                    
                    const inner2Request = new sqlInstance.Request(pool);

                     //Get Total Genders for Organization at the Conference for this boxkey
                    inner2Request.query(boxKeyGenderSql,(err2,result2)=>{
                        if (err2) {
                            console.log(err2);
                            throw err2;
                        }
                    // console.log(result2);
                    //  console.log("Result for Conference, Organization, and box Genders", result2);
                     responseObj.box = result2.recordset;
                     res.send(responseObj)
                    
                    });
                });
        
               
            
            }        

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
function getPrimaryPopulationData(res,org,con){
    const request = new sqlInstance.Request(pool);
    let response = {};
    let population;
    let organizational;
    let orgSql = "";
    let popSql = "";
    org = (org==undefined ? "": org)
    // console.log('filter: ', con);
    if(con == ''){
      orgSql = `select primaryadvantage 'Advantage' ,count(primaryadvantage) 'Total' 
      from vieworgadvantages
      where organization in ('${org}')
       group by primaryadvantage
      order by 1;`
      popSql = `select primaryadvantage 'Advantage' ,count(primaryadvantage) 'Total' 
      from vieworgadvantages
      where organization not in ('${org}')
      group by primaryadvantage
       order by 1;`
    } else{
        orgSql = `select primaryadvantage 'Advantage' ,count(primaryadvantage) 'Total' 
        from vieworgadvantages
        where organization in ('${org}')
         and  conference in ('${con}')
        group by primaryadvantage
        order by 1;`
        popSql = `select primaryadvantage 'Advantage' ,count(primaryadvantage) 'Total' 
        from vieworgadvantages
        where organization not in ('${org}')
        and conference like ('${con}')             
        group by primaryadvantage
         order by 1;`
    }
    
    request.query(orgSql,  (err, result)=> {
        if (err) {
            console.log(err);
            throw err;
        }else{
            // console.log('We got a response for the primary Organization donut chart',result.recordsets[0].length);
            organizational = result.recordsets;
            // console.log(organizational);
            const innerRequest = new sqlInstance.Request(pool);
            innerRequest.query(popSql,(err2,result2)=>{
                if(err) throw err;
                population = result2.recordsets;
                // console.log('We got a response for the primary population donut chart',result2.recordsets[0].length);

                response.population = population;
                response.organizatinal = organizational
                // console.log(response);
                res.send(response);
            });
    
           
        }        
    }); 
}
function getSecondaryPopulationData(res,org,con){
    const request = new sqlInstance.Request(pool);
    let response = {};
    let population;
    let organizational;
    let orgSql = "";
    let popSql = "";
    org = (org==undefined ? "": org)
    // console.log('filter: ', org);
    
    if(con == ''){
        orgSql = `select secondaryadvantage 'Advantage' ,count(secondaryadvantage) 'Total' 
        from vieworgadvantages
        where organization in ('${org}')
        group by secondaryadvantage
        order by 1;`
        popSql = `select secondaryadvantage 'Advantage' ,count(secondaryadvantage) 'Total'
        from vieworgadvantages
        where organization not in ('${org}')
        group by secondaryadvantage
         order by 1;`
      } else{
          orgSql = `select secondaryadvantage 'Advantage' ,count(secondaryadvantage) 'Total' 
          from vieworgadvantages
          where organization in ('${org}')
           and  conference in ('${con}')
           group by secondaryadvantage
          order by 1;`
          popSql = `select secondaryadvantage 'Advantage' ,count(secondaryadvantage) 'Total' 
          from vieworgadvantages
          where organization not in ('${org}')
          and conference  like ('${con}')             
          group by secondaryadvantage
           order by 1;`
      }
    request.query(orgSql,  (err, result)=> {
        if (err) {
            console.log(err);
            throw err;
        }else{
            // console.log('We got a response for the secondary Organization donut chart',result.recordsets[0].length);
            organizational = result.recordsets;
            // console.log(organizational);
            const innerRequest = new sqlInstance.Request(pool);
            innerRequest.query(popSql,(err2,result2)=>{
            if(err) throw err;
            population = result2.recordsets;
            // console.log('We got a response for the secondary population donut chart',result2.recordsets[0].length);
            response.population = population;
            response.organizatinal = organizational
            // console.log(response);
            res.send(response);
            });
    
           
        }        
    }); 
}
function getDormantPopulationData(res,org,con){
    const request = new sqlInstance.Request(pool);
    let response = {};
    let population;
    let organizational;
    let orgSql = "";
    let popSql = "";
    org = (org==undefined ? "": org)

    if(con == ''){
        orgSql = `select dormantadvantage 'Advantage' ,count(dormantadvantage) 'Total'  
        from vieworgadvantages
        where organization in ('${org}')
        group by dormantadvantage
        order by 1;`
        popSql = `select dormantadvantage 'Advantage' ,count(dormantadvantage) 'Total' 
        from vieworgadvantages
        where organization not in ('${org}')
        group by dormantadvantage
         order by 1;`
      } else{
          orgSql = `select dormantadvantage 'Advantage' ,count(dormantadvantage) 'Total' 
          from vieworgadvantages
          where organization in ('${org}')
           and  conference in ('${con}')
           group by dormantadvantage
          order by 1;`
          popSql = `select dormantadvantage 'Advantage' ,count(dormantadvantage) 'Total'  
          from vieworgadvantages
          where organization not in ('${org}')
          and conference  like ('${con}')             
          group by dormantadvantage
           order by 1;`
      }

    request.query(orgSql,  (err, result)=> {
        if (err) {
            console.log(err);
            throw err;
        }else{
            organizational = result.recordsets;
            const innerRequest = new sqlInstance.Request(pool);
            innerRequest.query(popSql,(err2,result2)=>{
            if(err) throw err;
            population = result2.recordsets;
            // console.log('We got a response for the primary population donut chart',result2.recordsets.length);
            response.population = population;
            response.organizatinal = organizational
            res.send(response);
            });
    
           
        }        
    }); 
}

function getPrimaryArchetypePopulationData(res,org,key){
    const request = new sqlInstance.Request(pool);
    let response = {};
    let population;
    let organizational;
    key = (key == undefined) ? "": key;
    org = (org == undefined ? "": org)
    // console.log('filter: ', org);
    
    request.query(`select primaryadvantage 'Advantage' ,count(primaryadvantage) 'Total' 
    from vieworgadvantages
    where organization = '${org}'
    and boxkey like '%${key}%'
     group by primaryadvantage
    order by 1;`,  (err, result)=> {
        if (err) {
            console.log(err);
            throw err;
        }else{
            // console.log('We got a response for the primary population donut chart',result.recordsets.length);
            organizational = result.recordsets;
            // console.log(organizational);
            const innerRequest = new sqlInstance.Request(pool);
            innerRequest.query(`select primaryadvantage 'Advantage' ,count(primaryadvantage) 'Total' 
            from vieworgadvantages
            where organization != '${org}'
            and boxkey != '${key}'
             group by primaryadvantage
             order by 1;`,(err2,result2)=>{
            if(err) throw err;
            population = result2.recordsets;
            // console.log('We got a response for the primary population donut chart',result2.recordsets.length);

            response.population = population;
            response.organizatinal = organizational
            // console.log(response);
            res.send(response);
            });
    
           
        }        
    }); 
}
function getDormantArchetypePopulationData(res,org,key){
    const request = new sqlInstance.Request(pool);
    let response = {};
    let population;
    let organizational;
    key = (key ==undefined) ? "": key;
    org = (org==undefined) ? "": org;
    
    request.query(`select dormantadvantage 'Advantage' ,count(dormantadvantage) 'Total' 
    from vieworgadvantages
    where organization = '${org}'
    and boxkey like '%${key}%'
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
            and boxkey != '${key}'
            group by dormantadvantage
            order by 1;`,(err2,result2)=>{
            if(err) throw err;
            population = result2.recordsets;
            // console.log('We got a response for the primary population donut chart',result2.recordsets.length);

            response.population = population;
            response.organizatinal = organizational
            res.send(response);
            });
    
           
        }        
    }); 
}


module.exports = router;