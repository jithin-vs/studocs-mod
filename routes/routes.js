const { Console } = require('console');
const db =require('../controller/dbconnect');
const mail =require("../controller/mailserv");
const verify =require("../controller/verification");
const bodyParser=require('body-parser');
const encoder =bodyParser.urlencoded({extended:true});
//const path=require('path');
const express = require('express');
const router = express.Router();
const usersRoutes = require('./profile');
const requestDisplayRoutes = require('./requestDisplay');
const formManageRoutes = require('./formManage');


router.use('/',usersRoutes);
router.use('/',requestDisplayRoutes);
router.use('/',formManageRoutes);
  
    
    const isAuth = (req,res,next) =>{
      if(req.session.isAuth){
        next();
      }
      else{
         res.redirect('/inner-page');     
      }
    }
     
    router.get('/', (req, res) => {
        res.render('index'); 
        
      });
      router.get('/home', (req, res) => {
        res.render('index');
          
      });
      router.get('/welcome', (req, res) => { 
        res.render('welcome');
        
      });
   
     /*-----add user pages-----*/

     //tutor
      router.get('/tutoradd',isAuth,async(req,res)=>{     
        
        const query1 = 'SELECT collegeid,department FROM hod WHERE  id = ?';
        const query1Result = await db.query(query1, [req.session.userid]);
        console.log(req.session.userid)
        const collegeid=query1Result[0].collegeid;  
        const department=query1Result[0].department;

        const query2 = 'SELECT * FROM tutor WHERE  collegeid = ? AND department=?';
        const query2Result = await db.query(query2, [collegeid,department]);

        res.render('addnewtutor',{applications:query2Result,id:req.session.userid})
        
     });
  
     router.post('/tutoradd',encoder,(req,res)=>{
         var hodid=req.session.userid;
          var {name,id,batch,email}=req.body;
          var Collegeid;
          console.log(hodid);
          async function getid() {
            try {
             
              const hodQueryResult = await new Promise((resolve, reject) => {
                db.connection.query("SELECT collegeid,department FROM hod WHERE id=?", [hodid], (err, results, fields) => {
                  if (err) {
                    reject(err);
                  } else { 

                    //console.log(results);
                    resolve(results);  
                  }   
                });
              });
 
              Collegeid = hodQueryResult[0].collegeid;
              var department=hodQueryResult[0].department;
              //console.log(Collegeid); // Output the updated Collegeid value here
              const studentsQueryResult = await new Promise((resolve, reject) => {
                var genPassword=verify.randomPassword;
                mail.sendcredEmail(name,email,id,genPassword);  
                db.connection.query("insert into tutor (name,id,collegeid,email,department,batch,password) values(?,?,?,?,?,?,?)", [name,id,Collegeid,email,department,batch,genPassword], (err, results, fields) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(results);
                    res.redirect(`/tutoradd?id=${hodid}`);
                  };
                });
              });
          
            } catch (error) {
              res.send('server error');
              throw error;
            }
          }
        getid();  
     });
     
    
     //add new HOD   
     router.get('/hodadd',isAuth,async(req,res)=>{  
      console.log("at route="+req.session.userid)    
      const query1 = 'SELECT collegeid FROM principal WHERE  id = ?';
      const query1Result = await db.query(query1, [req.session.userid]);
      console.log(query1Result)
       collegeid = query1Result[0].collegeid;

      const query2 = 'SELECT * from hod WHERE  collegeid = ?';
      const query2Result = await db.query(query2, [collegeid]); 

      res.render('addnewhod',{applications:query2Result,id:req.session.userid});
    });
  
     router.post('/hodadd',encoder,(req,res)=>{      
        
        var principalid=req.session.userid;
        var {name,id,dept,email}=req.body;   
        async function getData() {
          try {
            
            const hodQueryResult = await new Promise((resolve, reject) => {
              db.connection.query("SELECT collegeid FROM principal WHERE id=?", [principalid], (err, results, fields) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(results);
                }
              });
            });
        
            Collegeid = hodQueryResult[0].collegeid;
            console.log(Collegeid); // Output the updated Collegeid value here
            var genPassword=verify.randomPassword;
            mail.sendcredEmail(name,email,id,genPassword);
            const studentsQueryResult = await new Promise((resolve, reject) => {
              db.connection.query("insert into hod (name,id,collegeid,email,department,password) values(?,?,?,?,?,?)", [name,id,Collegeid,email,dept,genPassword], (err, results, fields) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(results);
                  res.redirect(`/hodadd?id=${principalid}`);
                };
              });
            });
        
          } catch (error) { 
            res.send('server error');
            throw error;
          }
        }
      getData();
     });


 
      //student add  
     router.get('/studentadd',isAuth,async(req,res)=>{
            
      const query1 = 'SELECT collegeid,batch,department FROM tutor WHERE  id = ?';
      const query1Result = await db.query(query1, [req.session.userid]);
      const collegeid=query1Result[0].collegeid;
      const batch=query1Result[0].batch;
      const department=query1Result[0].department;

      const query2 = 'SELECT * FROM student WHERE  collegeid=? AND batch=? AND department=?';
      const query2Result = await db.query(query2, [collegeid,batch,department]);
        
      res.render('addnewstudent',{applications:query2Result,id:req.session.userid});
              
      });
   
      router.post('/studentadd', encoder, async (req, res) => {
        try {
          const tutorId = req.session.userid;
          const { name, id, email } = req.body;
      
          const searchQuery = 'SELECT collegeid, batch, department FROM tutor WHERE id = ?';
          const searchQueryResult = await db.query(searchQuery, [tutorId]);
      
          if (searchQueryResult.length === 0) {
            // Tutor not found
            res.render('studentadd', { message: 'Tutor not found' });
            return;
          }
      
          const collegeId = searchQueryResult[0].collegeid;
          const batch = searchQueryResult[0].batch;
          const department = searchQueryResult[0].department;
      
          const genPassword = verify.randomPassword;
          mail.sendcredEmail(name, email, id, genPassword);
      
          const studentInsertQuery = 'INSERT INTO student (name, id, collegeid, email, password, batch, department) VALUES (?, ?, ?, ?, ?, ?, ?)';
          const studentsInsertResult = await db.query(studentInsertQuery, [name, id, collegeId, email, genPassword, batch, department]);
      
          if (studentsInsertResult.affectedRows === 1) {
            // Student added successfully
            res.redirect(`/studentadd?id=${tutorId}`);
          } else {
            // Failed to add student
            res.render('studentadd', { message: 'Failed to add student' });
          }
        } catch (error) {
          console.error('Error occurred:', error);
          res.status(500).send('Server error');
        }
      });
      

    //principal add
    router.get('/principaladd',isAuth,(req,res)=>{
           
             
          db.connection.query("select * from  principal",
              [req.body.name],(err,results,fields)=>{
              if(err) {
                throw err;
                
              }
              else{
                var id=req.session.userid; 
                console.log(id);
                  res.render('addnewprincipal',{applications:results,id});
              }
            }); 
             
        });
        
     router.post('/principaladd',encoder,(req,res)=>{ 

          var {name,id,email}=req.body;
          
          async function getData() {  
            try {
              let Collegeid=req.session.userid;
              const id1=Collegeid;    
              var genPassword=verify.randomPassword;
              mail.sendcredEmail(name,email,id,genPassword)  
              const studentsQueryResult = await new Promise((resolve, reject) => {
                db.connection.query("insert into principal (name,id,collegeid,email,password) values(?,?,?,?,?)", [name,id,Collegeid,email,genPassword], (err, results, fields) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(results);
                    res.redirect(`/principaladd?id=${Collegeid}`);
                  };
                });
              });
          
            } catch (error) {
              res.send('server error');
              throw error;
            }
          }
         getData(); 
      });   
    
      /*-----------REQUEST HANDLING ROUTES ------*/
      
  // SENDING REQUEST ROUTE FOR STUDENTS        
  router.get('/requests', isAuth,async(req, res) => {
    let id=req.session.userid;
    const query1 = 'SELECT collegeid FROM student WHERE  id = ?';
    const query1Result = await db.query(query1, [id]);
    var Result=query1Result[0].collegeid
    console.log(Result)
    try {
      db.connection.query("SELECT * FROM forms where collegeid=?",[Result],(err, results, fields) => {
        if (err) {
          throw err;
        } else {
          res.render('requests', { forms: results,id1:null,id});
        }
      });
    } catch (err) {
      console.log(err);
    }
  });
        
  //SUBMIT FORM
  router.get('/submit',isAuth,async(req,res)=>{ 
    const jsonData = req.query.data;
    const data = JSON.parse(jsonData); 
    const formid = data[0].formid; // Accessing the 'formid' property
    const stdid = data[0].id; 
    const content=data[0].content;
    const attachments=data[0].attachments;

      console.log(stdid);
      console.log(attachments);
      try {
         
        // Execute the first query with arguments
        const query1 = 'SELECT collegeid FROM student WHERE  id = ?';
        const query1Result = await db.query(query1, [stdid]);
    
        // Execute the second query with arguments
        const query2 = `
              SELECT
                student.collegeid AS collegeId,
                student.id AS studentId,
                forms.formid AS formId,
                student.batch AS batch,
                student.department AS dept,
                forms.name AS formname,
                forms.dest AS dest 
              FROM
                student
              JOIN
                forms ON student.collegeid = forms.collegeid AND student.id = ? AND forms.formid = ?
            `;      
        const query2Result = await db.query(query2, [stdid,formid]);
        if (query2Result.length === 0) {
          // Render a template not found message to the client
          return res.render('template-not-found');
        }
        console.log(query2Result)
            // Generate a unique ID
              let uniqueId;
              let idExists = true;
              while (idExists) {
                uniqueId = verify.generateUniqueId(8);

                // Check if the ID already exists in the "requests" table
                const checkQuery = 'SELECT COUNT(*) AS count FROM requests WHERE appid = ?';
                const checkResult = await db.query(checkQuery, [uniqueId]);

                idExists = checkResult[0].count > 0;
              }

        var dest = query2Result[0].dest || 'principal';
        console.log('dest=\t'+dest);
        var final='final';
        var pending='pending';
        // Insert the values into the "requests" table
        const insertQuery = `INSERT INTO requests 
                             (collegeId, stdid, formid, appid,date,dept,request_data,formname,${dest},tutor,dest,attachment,insert_time)
                             VALUES (?,?,?,?,NOW(),?,?,?,?,?,?,?,NOW())`;
        const insertValues = query2Result.map(row => [row.collegeId, row.studentId, row.formId, uniqueId, row.dept, content, row.formname,final,pending,row.dest,attachments]);
        const flattenedValues = insertValues.flat(); // Flatten the nested arrays
        await db.query(insertQuery, flattenedValues);
        console.log(attachments); 
        // Render the webpage and pass the query results
        res.redirect(`/requests?id=${stdid}&alertMessage=Successful!`);

      } catch (error) {
        console.error('Error executing queries:', error);
        res.status(500).send('Error executing queries');
      }
   });


  

/*----------- other control routes -------------*/

      // Set up a route for the login page
   router.post('/inner-page',encoder,async(req, res,next) => {
            var user =req.body.users; 
            var username =req.body.username;
            var password =req.body.password;
            
            if(user === 'Administrator'){
                user='college';
            }
            if(user === 'StaffAdvisor'){
              user='Tutor';
          }
            console.log(req.body);
            if(user === 'college')
               { 
                try{
                  const query1 = 'select collegeid,password,phno from college where collegeid=? and password=?';
                  const query1Result = await db.query(query1, [username,password]);
                      if(query1Result.length>0){
                          req.session.isAuth=true;
                          req.session.userid=username;  
                          req.session.user =user;
                          console.log(req.session.id);

                              try{
                                if(query1Result[0].phno===null){
                                    res.redirect(`/cform`);
                                }
                                else{ 
                                      res.redirect(`/college`);
                                } 
                  
                                }catch(err){
                                  console.log(err);
                                  res.send('server error');
                                }
                        }
                        else{  
                          res.render('inner-page',{message:'incorrect username or password'}); 
                        } 
                res.end(); 
 
               }catch(err){
                  console.log(err);
                  res.redirect(`/inner-page?id=4000`)
               }
            }
               
          else{
                try{
                  const query1 = 'select id,password,phno from ?? where id=? and password=?';
                  const query1Result = await db.query(query1,[user,username,password]);

                  if(query1Result && query1Result.length > 0){ 
                      req.session.isAuth=true;  
                      req.session.userid =username;
                      req.session.user =user;
                      console.log(req.session.id);
                      switch(user) { 
                  
                        case 'Student':    

                                              if(query1Result[0].phno===null){
                                                    return res.redirect(`/sform`);
          
                                                  
                                              }else{ 
      
                                                   return res.redirect(`/student`);
                                              }
                                          
                                              
                                    break;
 
                        case 'Tutor':try {
                                            if (query1Result[0].phno === null) {
                                              return res.redirect(`/tform`);
                                            } else {
                                              return res.redirect(`/staffadvisor`);
                                            }
                                          } catch (err) {
                                            console.error(err);
                                            return res.send('server error');
                                          }
                                      break;
                        case 'Hod':
                                    try{
                                            if(query1Result[0].phno===null){
                                                 return res.redirect(`/tform`);
                                            }
                                            else{
                                                 return res.redirect(`/hod`);
                                            }
                        
                                      }catch{
                                        console.log(err);
                                        res.send('server error');
                                      }

                              break;
                        case  'Principal':
                                          try{
                                                  if(query1Result[0].phno===null){
                                                      return res.redirect(`/pform`);
                                                  }
                                                  else{
                                                      return res.redirect(`/Principal`);
                                                  }
                                    
                                            }catch{
                                              console.log(err);
                                              res.send('server error');
                                           }
                            
                                                  break;  
                    }
                    }
                    else{  
                      res.render('inner-page',{message:'incorrect username or password'}); 
                    } 
                    res.end();
                }catch(err){
                  console.log(err);
                  res.redirect(`/inner-page?id=4000`);
              }
            }
          });
        
        //REGISTER COLLEGE
        router.post('/register-college',(req,res)=>{
             
          var{name,email,subject,message}=req.body;
          mail.sendregisterEmail(name,email);
          res.redirect('/home');
       })  
         

      router.post('/deleteuser', encoder, (req, res) => { 
        var id = req.session.userid; 
        var user = req.query.user;
        var returnid=req.query.returnid;
        console.log('user='+returnid);
        console.log('hererdfxf'); 
        db.connection.query("DELETE FROM ?? WHERE id = ?", [req.query.user, req.session.userid], (err, results, fields) => {
          if (err) {
            res.send('server error');    
            throw err;
          } else { 
            if (user === 'student')  
              return res.redirect(`/studentadd?id=${returnid}&user=${user}`);
            if (user === 'tutor')
              return res.redirect(`/tutoradd?id=${returnid}&user=${user}`);
            if (user === 'hod')
              return res.redirect(`/hodadd?id=${returnid}&user=${user}`);
              console.log(returnid)
            if (user === 'principal')
              return res.redirect(`/principaladd?id=${id}`);
          }
        });   
      });
      
     //logout
      router.get('/logout',(req,res)=>{
        req.session.destroy(function(err){    
          if(err){
            console.log(err);
            res.send('error');
          }else{
            res.redirect('/inner-page?id=8989');
          }
        })
      });
      

      router.post('/staffadvisor/:name/search', async (req, res) => {
        const searchTerm = req.body.search;
      
        const query1 = 'SELECT collegeid, batch, department FROM tutor WHERE id = ?';
        const query1Result = await db.query(query1, [req.params.name]);
        const collegeid = query1Result[0].collegeid;
        const batch = query1Result[0].batch;
        const department = query1Result[0].department;
      
        // Perform search query
        const query2 = 'SELECT * FROM student WHERE collegeid = ? AND batch = ? AND department = ? AND (name LIKE ? OR id LIKE ?)';
        const params = [collegeid, batch, department, `%${searchTerm}%`, `%${searchTerm}%`];
      
        db.connection.query(query2, params, (err, results) => {
          if (err) {
            console.log(err);
            res.send('Server error: ' + err.message);
          } else {
            const applications = results;
            res.json({applications});
          }
        });
      });
       
 
      router.post('/hod/:name/search', async (req, res) => { // Specify the URL for search with the name parameter
        const searchTerm = req.body.search;
      
        const query1 = 'SELECT collegeid, department FROM hod WHERE id = ?';
        const query1Result = await db.query(query1, [req.params.name]);
        const collegeid = query1Result[0].collegeid;
        const batch = query1Result[0].batch;
        const department = query1Result[0].department;
        // Perform search query
        const query2 = 'SELECT * FROM tutor WHERE collegeid = ? AND department = ? AND (name LIKE ? OR id LIKE ?)';
        const params = [collegeid, department, `%${searchTerm}%`, `%${searchTerm}%`];
        
      
        db.connection.query(query2, params, (err, results) =>  {
          if (err) {
            console.log(err);
            res.send('Server error: ' + err.message);
          } else {
            const applications = results;
            res.render('addnewtutor', { applications, id: req.params.name, searchTerm });
          }
        });
      });


      router.post('/principal/:name/search', async(req, res) => { // Specify the URL for search with the name parameter
        const searchTerm = req.body.search;
      
        const query1 = 'SELECT collegeid FROM principal WHERE id = ?';
        const query1Result = await db.query(query1, [req.params.name]);
        const collegeid = query1Result[0].collegeid;
        const batch = query1Result[0].batch;
        const department = query1Result[0].department;
        // Perform search query
        const query2 = 'SELECT * FROM hod WHERE collegeid = ?  AND (name LIKE ? OR id LIKE ?)';
        const params = [collegeid,`%${searchTerm}%`, `%${searchTerm}%`];

        // Perform search query
      
        db.connection.query(query2, params, (err, results) =>  {
          if (err) {
            console.log(err);
            res.send('Server error: ' + err.message);
          } else {
            const applications = results;
            res.render('addnewhod', { applications, id: req.params.name, searchTerm });
          }
        });
      });  
         
      router.post('/college/:name/search', (req, res) => { // Specify the URL for search with the name parameter
        const searchTerm = req.body.search;
      
        // Perform search query
        const query = `SELECT * FROM principal WHERE
          name LIKE '%${searchTerm}%' OR
          id LIKE '%${searchTerm}%'`;
      
        db.connection.query(query, (err, results) => {
          if (err) {
            console.log(err);
            res.send('Server error: ' + err.message);
          } else {
            const applications = results;
            res.render('addnewprincipal', { applications, id: req.params.name, searchTerm });
          }
        });
      });    
module.exports = router;
