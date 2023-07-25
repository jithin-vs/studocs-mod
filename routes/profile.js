const express = require('express');
const db =require('../controller/dbconnect');
const router = express.Router();
const path=require('path');
const bodyParser=require('body-parser');
const encoder =bodyParser.urlencoded({extended:true});

const query = (sql, args) => {
    return new Promise((resolve, reject) => {
      db.connection.query(sql, args, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        } 
      });
    });
  };

  const isAuth = (req,res,next) =>{
    if(req.session.isAuth){
      next();
    }
    else{
       res.redirect('/inner-page');     
    }
  }

    router.get('/inner-page', (req, res) => {
        var id=req.query.id; 
        console.log(id);
        if(id ==='1010')
        res.render('inner-page',{message:'registeration complete!!'});
        else if(id ==='8989')
        res.render('inner-page',{message:'logged out successfully!!'});
        else if(id ==='4000')
        res.render('inner-page',{message:'server error!!'})
        else
            res.render('inner-page');
    });
    
    router.get('/Principal',isAuth,(req, res) => {
        res.render('Principal');  
    });

    //forms
    router.get('/tform', isAuth, (req, res) => {
        var name = req.session.userid;
        var user = req.session.user;
        console.log('ID:', name);
        console.log('User:', user);
        db.connection.query("select * from ?? where id=?", [user, name], (err, results, fields) => {
            if (err) {
                throw err;
            } else {
                var collegeid = results[0].collegeid;
                console.log(collegeid); 
                var result = results[0];
                res.render('tform', { name, collegeid, user, result });
            }
        });
    });

    router.get('/sform',isAuth,(req, res) => {

        var name=req.session.userid;
        db.connection.query("select * from student where id=?",
        [name],(err,results,fields)=>{
        if(err) {
        throw err;
        
        }
        else{

        var result=results[0];
        console.log(result);
        res.render('sform',{name,result}); 
        }
    });    
    }); 
    router.get('/cform',isAuth, (req, res) => {
    var name=req.session.userid;
    db.connection.query("select * from college where collegeid=?",
    [name],(err,results,fields)=>{
    if(err) {
        throw err;
        
    }
    else{

        var result=results[0];
        res.render('cform',{name,result});
    }
    });
    });
    router.get('/pform',isAuth, (req, res) => {
    var name=req.session.userid;
        db.connection.query("select * from principal where id=?",
        [name],(err,results,fields)=>{
        if(err) {
        throw err;
        
        }
        else{ 

        var n1=results[0].name;
        var collegeid=results[0].collegeid;
        var address=results[0].address;
        var phno=results[0].phno;
        var email=results[0].email;
        console.log(address);
        res.render('pform',{n1,name,address,phno,email,collegeid}); 
        }
    }); 
    });
    
        
    /*------register forms-------*/   

    //colllge form
    router.post('/cform',(req, res) => {
        console.log(req.body);
        var name=req.session.userid;
        var {collegename,collegeid,university,address,mobile,email,website,logo,image,username,password}=req.body;
        var { logo,image } = req.files;
        console.log(name);
        const photoName = `${name}_photo${path.extname(image.name)}`;
        const logoName = `${name}_logo${path.extname(logo.name)}`;
        console.log(photoName)
        let photoPath = path.join('./public/uploads/college', name, photoName);
        let logoPath = path.join('./public/uploads/college',  name, logoName);
        
        if(!logo) {
            return res.status(400). send('please upload college logo. .');
        }
        if(!image) {
            return res.status(400). send('please upload college image. .');
        }
        console.log(logo);
        image.mv(photoPath,function(err){
            if(err) throw err;
            else { 
            console.log('upload successful');
            photoPath = photoPath.replace('public', '');
            }
        })   
        logo.mv(logoPath,function(err){
        if(err)
            throw err;
        else { 
            console.log('upload successful');
            logoPath = logoPath.replace('public', '');
        }   
        })
        db.connection.query("update college set password=?,collegename=?,university=?,address=?,phno=?,email=?,collegelogo=?,collegeimage=?,website=? where collegeid=?" 
    ,[password,collegename,university,address,mobile,email,logoPath,photoPath,website,name],
    (err,results,fields)=>{  
            if(err){
            res.send("server error");
            throw err;
            }  
            else{ 
            res.redirect('/inner-page');
            } 

    });  
    });  

    //student form
    router.post('/sform', encoder, (req, res) => {
    console.log(req.body);
    var username=req.session.userid;
    var { name, address, phno, email, yearofadmn, regno, admno, password, repassword } = req.body;
    var { photo } = req.files;
    const photoName = `${username}_photo${path.extname(photo.name)}`;

    let photoPath = path.join('./public/uploads/student',username, photoName);
    
    photo.mv(photoPath)
        .then(() => {
        console.log('Upload successful');

        photoPath = photoPath.replace('public','');  

        
        db.connection.query("UPDATE student SET name=?, address=?,phno=?, email=?, yearofadmission=?, admno=?, photo=?, password=? WHERE id=?",
            [name, address,phno, email, yearofadmn, admno, photoPath, password,username],
            (err, results, fields) => {
            if (err) {
                console.error(err);   
                return res.status(500).send('Server error');
            } else {
                console.log('Query successful');
                return res.redirect(`/inner-page?id=${'1010'}`);
            }
            });
        })
        .catch((err) => {
        console.error(err);
        return res.status(500).send('Server error');
        });
    });

    //teacher form  
    router.post('/tform',(req, res) => {
    var {name,address,phno,email,design,dept,password,repassword}=req.body;
    var{photo,signature}=req.files;
    console.log(req.body);
    var username=req.session.userid;
    const photoName = `${username}_photo${path.extname(photo.name)}`;
    const signatureName = `${username}_signature${path.extname(signature.name)}`;

    let photoPath = path.join('./public/uploads/teacher', username, photoName);
    let signaturePath = path.join('./public/uploads/teacher', username, signatureName);

    photo.mv(photoPath,function(err){
        if(err) throw err;
        else { 
            console.log('upload successful');
            photoPath = photoPath.replace('public', '');
        }
        })   
    signature.mv(signaturePath,function(err){
        if(err)
            throw err; 
        else { 
        console.log('upload successful');
        signaturePath = signaturePath.replace('public', '');
        }   
    }) 
    db.connection.query("update ?? set name=?,photo=?,address=?,signature=?,phno=?,email=?,department=?,password=? where id=?"
    ,[req.session.user,name,photoPath,address,signaturePath,phno,email,dept,password,username],
    (err,results,fields)=>{  
        if(err){
        res.send("server error");  
        throw err;   
        }  
        else{  
        console.log('query succesful');
        res.redirect(`/inner-page`);
        } 
    });  
    });  

    //principal form

    router.post('/pform',encoder,(req, res) => {
    console.log(req.body);
    var id=req.session.id;
    var {name,photo,address,signature,phno,email,password}=req.body;
    var { photo,signature} = req.files;
    const photoName = `${id}_photo${path.extname(photo.name)}`;
    const signatureName = `${id}_logo${path.extname(signature.name)}`;

    let photoPath = path.join('./public/uploads/college', id, photoName);
    let signaturePath = path.join('./public/uploads/college', id, signatureName);

    photo.mv(photoPath,function(err){  
    if(err) throw err;
    else { 
        console.log('upload successful');
        photoPath = photoPath.replace('public','');
    }
    })   
    signature.mv(signaturePath,function(err){
    if(err)
        throw err;
    else { 
    console.log('upload successful');
    signaturePath = signaturePath.replace('public','');
    }    
    })
    db.connection.query("update principal set name=?,address=?,phno=?,email=?,password=?,photo=? where id=?"
    ,[name,address,phno,email,password,photoPath,id],
    (err,results,fields)=>{  
    if(err){
        res.send("server error");
        throw err;
    }  
    else{ 
        res.redirect('/inner-page?id=1010');  
    } 

    });  
    }); 
   
   /*------dashboards-------*/   

    //staffadvisor
    router.get('/staffadvisor',isAuth,async(req, res) => {
       
        if(req.session.user){
          const username = req.session.userid;
          const query1 = 'SELECT collegeid,batch,department FROM tutor WHERE  id = ?';
          const query1Result = await query(query1, [username]);
          //console.log(query1Result)
          var collegeid=query1Result[0].collegeid;
          var dept=query1Result[0].department; 
          var batch=query1Result[0].batch;   
          const pending='pending';
          //console.log('cid='+collegeid+',dept='+dept+',batch='+batch+',status='+pending)
          const query2 = `SELECT 
                student.name AS name, student.id AS studentId, requests.formname AS formname,
                requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
                FROM student JOIN requests ON student.collegeid = requests.collegeid AND  student.id=requests.stdid AND student.collegeid = ? AND student.department=? AND student.batch=? AND requests.tutor=?`;
          const query2Result = await query(query2, [collegeid,dept,batch,pending]);
          //console.log(query2Result);
          const query3=`SELECT name, id, phno, department, address, email, photo FROM tutor WHERE id = ?`
          const query3Result = await query(query3, [username]);
          const tutorData=query3Result[0];
          const imagePath = tutorData.photo ? path.relative('public', tutorData.photo) : 'default/path/to/image.jpg';
          const Photo = imagePath.replace(/\\/g, '/'); // Convert backslashes to forward slashes for URL compatibility
          const user='tutor';
          res.render('staffadvisor', { Photo, tutorData, applications:query2Result,user });
          } else {
          res.send('Unauthorized user');
        }
      });

       //hod
    router.get('/hod', isAuth, async(req, res) => {
    if (req.session.user) {
      try {
        const username = req.session.userid;
        const query1 = 'SELECT collegeid,department FROM hod WHERE  id = ?';
        const query1Result = await query(query1, [username]);
        console.log(query1Result)
        var collegeid=query1Result[0].collegeid;
        var dept=query1Result[0].department;
        var pending1='pending';
        var pending2='final:pending';  
        //console.log('cid='+collegeid+',dept='+dept+',batch='+batch+',status='+pending)
        const query2 = `SELECT 
              student.name AS name, student.id AS studentId, requests.formname AS formname,requests.formid AS formid,
              requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
              FROM student JOIN requests ON student.collegeid = requests.collegeid AND  student.id=requests.stdid AND student.collegeid = ? AND student.department=?  AND requests.hod IN(?,?)`;
        const query2Result = await query(query2, [collegeid,dept,pending1,pending2]);
        console.log(query2Result);
        const query3=`SELECT name, id, phno, department, address, email, photo FROM hod WHERE id =? `
        const query3Result = await query(query3, [username]);
        const tutorData=query3Result[0];
        const imagePath = tutorData.photo ? path.relative('public', tutorData.photo) : 'default/path/to/image.jpg';
        const Photo = imagePath.replace(/\\/g, '/'); // Convert backslashes to forward slashes for URL compatibility
        const user='hod';
        res.render('hod', { Photo, tutorData, applications:query2Result,user });
      } catch (err) {
        console.log(err);
        res.send('Server error: ' + err.message);
      }
    } else { 
      res.send('Unauthorized user');
    }
      });
  
   
      //Principal
      router.get('/Principal',isAuth,async(req, res) => {
        console.log(req.session.userid);
        if(req.session.user){  
          try{
            const username = req.session.userid;
            const query1 = 'SELECT collegeid FROM principal WHERE  id = ?';
            const query1Result = await query(query1, [username]);
            console.log(query1Result)
            var collegeid=query1Result[0].collegeid;
            var pending1='pending';
            var pending2='final:pending';  
            //console.log('cid='+collegeid+',dept='+dept+',batch='+batch+',status='+pending)
            const query2 = `SELECT 
                  student.name AS name, student.id AS studentId, requests.formname AS formname,
                  requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
                  FROM student JOIN requests ON student.collegeid = requests.collegeid AND  student.id=requests.stdid AND student.collegeid = ?  AND requests.principal IN(?,?)`;
            const query2Result = await query(query2, [collegeid,pending1,pending2]);
            console.log(query2Result);
            const query3=`SELECT name, id, phno, address, email, photo FROM principal WHERE id =? `
            const query3Result = await query(query3, [username]);
            const tutorData=query3Result[0];
            const imagePath = tutorData.photo ? path.relative('public', tutorData.photo) : 'default/path/to/image.jpg';
            const Photo = imagePath.replace(/\\/g, '/'); // Convert backslashes to forward slashes for URL compatibility
            const user='principal';
            res.render('principal', { Photo, tutorData, applications:query2Result,user,Id:tutorData.id });
          }catch(err)
          {
              console.log(err);
              res.send('server error');
          }
      
        }
        else{
          res.send('unauthorized user');
        }
      
      }); 
  
     //Student
      router.get('/student',isAuth,async(req, res) => {
       // console.log(req.params.name);
        if(req.session.user){
          try{
            const query1 = 'SELECT * FROM attachment where stdid=?';
            const query1Result = await query(query1, [req.session.userid]);

            const query2 = 'select * from student where id=?';
            const query2Result = await query(query2, [req.session.userid]);
            
               // console.log(results);
                var name=query2Result[0].name;
                var admno=query2Result[0].admno;
                var regno=query2Result[0].id; 
                var dept=query2Result[0].department;
                var phno=query2Result[0].phno;  
                var addr=query2Result[0].address
                var email=query2Result[0].email;
                var photo=query2Result[0].photo;
                res.render('student',{name,admno,regno,dept,phno,addr,email,photo,attachments:query1Result})
          }catch(err)
          {
              console.log(err); 
              res.send('server error');  
          }
      
        }
        else{
          res.send('unauthorized user');
        }
       
      });
      
      //Office
  
       router.get('/college',isAuth,async(req, res) => {
        var username=req.session.userid;    
        if(req.session.user){
          if (req.session.user) {
            try {
              var pending1='pending';
              var pending2='final:pending';  
              const query1 = `SELECT 
              student.name AS name, student.id AS studentId, requests.formname AS formname,
              requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
              FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.id=requests.stdid AND student.collegeid = ? AND requests.office IN(?,?)`;
              const query1Result = await query(query1, [req.session.userid,pending1,pending2]);
              console.log(query1Result);
              const selectQuery = "SELECT * FROM college WHERE collegeid = ?"
              try {
                const results = await query(selectQuery, [username]);
          
                if (results.length > 0) {
                  const { collegename, collegeid, phno, address, email, collegeimage, website } = results[0];
          
                  const imagePath = path.relative('public', collegeimage);
          
                  const collegeData = {
                    Name: collegename || 'N/A',
                    Id: collegeid || 'N/A',
                    Phno: phno || 'N/A',
                    Addr: address || 'N/A',
                    Email: email || 'N/A',
                    Photo: imagePath || 'N/A',
                    Website: website || 'N/A'
                  };
          
                  console.log(collegeData);
          
                  // Render the 'college' template and pass the query results and collegeData
                  res.render('college', { applications: query1Result, collegeData });
                } else {
                  // Handle case when no college is found for the given username
                  console.log('No college found for the given username');
                  res.render('college', { applications: query1Result, collegeData: null });
                }
              } catch (error) {
                // Handle the error
                console.error('Error occurred during college retrieval:', error);
                res.render('college', { applications: query1Result, collegeData: null });
              }
            } catch (error) {
              // Handle the error
              console.error('Error occurred during query execution:', error);
              res.render('college', { applications: null, collegeData: null });
            }
          }
          
        }else{
          res.send('unauthorized user');
        }
      
      }); 

    module.exports = router;