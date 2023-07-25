const express = require('express');
const db =require('../controller/dbconnect');
const router = express.Router();
const path=require('path');
const bodyParser=require('body-parser');
const encoder =bodyParser.urlencoded({extended:true});

         /*-------------------- VERIFIED REQUESTS  --------------------*/

   // SENDING REQUEST ROUTE FOR STUDENTS 
   router.get('/verified-requests',db.isAuth,async(req,res)=>{ 
    try{
     
     const query1= `
                   SELECT
                   student.collegeid AS collegeid, student.id AS studentid, student.batch AS batch,
                   student.department AS dept, requests.dest AS dest
                   FROM student
                   JOIN requests ON student.collegeid = requests.collegeid AND student.id = requests.stdid
                   WHERE student.id = ?
                 `;
     const query1Result = await db.query(query1, [req.session.userid]);
     console.log(query1Result);
     var collegeid=query1Result[0].collegeid; 
     var dept=query1Result[0].dept;
     var batch=query1Result[0].batch;
     var dest=query1Result[0].dest;
     var checkVal1='verified'; 
     var checkVal2='completed';
     var checkVal3='rejected';
     const query2 = `SELECT 
         student.name AS name, student.id AS studentId, requests.formname AS formname,
         requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
         FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.collegeid = ?  
         AND student.id=requests.stdid AND student.department=? AND student.batch=? AND student.id=? AND (requests.${dest} IN(?,?,?) OR requests.tutor=? OR requests.hod=? OR requests.principal=? OR requests.office=?)`;
     const query2Result = await db.query(query2, [collegeid,dept,batch,req.session.userid,checkVal1,checkVal2,checkVal3,checkVal3,checkVal3,checkVal3,checkVal3]);   
     res.render('student_verified_requests',{applications:query2Result});
    }catch(err){
     console.log(err); 
   }  
    
    });
 
    router.get('/tutor-verified-requests',db.isAuth,async(req,res)=>{ 
       
         const query1 = 'SELECT collegeid,batch,department FROM tutor WHERE  id = ?';
         const query1Result = await db.query(query1, [req.session.userid]);
         console.log(query1Result)
         var collegeid=query1Result[0].collegeid; 
         var dept=query1Result[0].department;
         var batch=query1Result[0].batch;
         var checkVal1='verified';
         var checkVal2='completed';
         var checkVal3='rejected';
         //console.log('cid='+collegeid+',dept='+dept+',batch='+batch+',status='+pending)
         const query2 = `SELECT 
               student.name AS name, student.id AS studentId, requests.formname AS formname,
               requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
               FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.collegeid = ?  AND student.id=requests.stdid AND student.department=? AND student.batch=? AND requests.tutor IN(?,?,?)`;
         const query2Result = await db.query(query2, [collegeid,dept,batch,checkVal1,checkVal2,checkVal3]);
         //console.log(query2Result);
         res.render('teacher_verified_requests',{id:req.session.userid,applications:query2Result});
     }); 
 
    router.get('/hod-verified-requests',db.isAuth,async(req,res)=>{ 
                 
         const query1 = 'SELECT collegeid,department FROM hod WHERE id = ?';
         const query1Result = await db.query(query1, [req.session.userid]);
         
         var collegeid=query1Result[0].collegeid;   
         var dept=query1Result[0].department;   
         var checkVal1='verified';
         var checkVal2='completed';
         var checkVal3='rejected';
         console.log('cid='+collegeid+',dept='+dept)
         const query2 = `SELECT
               student.name AS name,student.collegeid AS collegeId, student.id AS studentId,requests.formname AS formname,
               requests.appid AS appid, student.batch AS batch, student.department AS dept ,requests.date AS date 
               FROM student JOIN requests ON student.collegeid = requests.collegeid  AND 
               student.id=requests.stdid AND student.collegeid =?  AND student.id=requests.stdid  AND student.department=? AND requests.hod IN(?,?,?)`;
         const query2Result = await db.query(query2, [collegeid,dept,checkVal1,checkVal2,checkVal3]);
         console.log(query2Result);
         res.render('pending-requests',{id:req.session.userid,applications:query2Result});
       });
 
    router.get('/principal-verified-requests',db.isAuth,async(req,res)=>{ 
       
         const query1 = 'SELECT collegeid FROM principal WHERE id = ?';
         const query1Result = await db.query(query1, [req.session.userid]); 
         var collegeid=query1Result[0].collegeid;
         var checkVal1='verified';
         var checkVal2='completed';
         var checkVal3='rejected';
         console.log(collegeid)
         const query2 = `SELECT 
         student.name AS name, student.id AS studentId, requests.formname AS formname,
         requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
         FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.collegeid = ? AND student.id=requests.stdid AND requests.principal IN (?,?,?)`;
         const query2Result = await db.query(query2, [collegeid,checkVal1,checkVal2,checkVal3]);
         console.log(query2Result);
         res.render('teacher_verified_requests',{applications:query2Result});
         
         });
 
    router.get('/office-verified-requests',db.isAuth,async(req,res)=>{ 
             
             var checkVal1='verified';
             var checkVal2='completed';
             var checkVal3='rejected';
             const query1 = `SELECT 
                     student.name AS name, student.id AS studentId, requests.formname AS formname,
                     requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
                     FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.collegeid = ?  AND student.id=requests.stdid AND  requests.office IN(?,?,?)`;
             const query1Result = await db.query(query1, [req.session.userid,checkVal1,checkVal2,checkVal3]);
             console.log(query1Result);
             res.render('teacher_verified_requests',{id:req.session.userid,applications:query1Result}); 
           
           });
 
        /*-------------------- PENDING REQUESTS  --------------------*/  
      
    // PENDING REQUEST ROUTE FOR ADMINS 
    router.get('/office-pending-requests',db.isAuth,async(req,res)=>{         
         
     var pending1='pending';
     var pending2='final:pending';  
     const query1 = `SELECT 
             student.name AS name, student.id AS studentId, requests.formname AS formname,
             requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
             FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.id=requests.stdid AND 
             student.collegeid = ? AND requests.office IN(?,?)`;
     const query1Result = await db.query(query1, [req.session.userid,pending1,pending2]);
     console.log(query1Result);
     res.render('pending-requests',{id:req.session.userid,applications:query1Result}); 
     });
 
     //PENDING REQUESTS FOR TUTOR
    router.get('/tutor-pending-requests',db.isAuth,async(req,res)=>{          
         
       const query1 = 'SELECT collegeid,batch,department FROM tutor WHERE  id = ?';
       const query1Result = await db.query(query1, [req.session.userid]);
       console.log(query1Result) 
       var collegeid=query1Result[0].collegeid;
       var dept=query1Result[0].department;
       var batch=query1Result[0].batch;  
       const pending='pending';
       //console.log('cid='+collegeid+',dept='+dept+',batch='+batch+',status='+pending)
       const query2 = `SELECT 
             student.name AS name, student.id AS studentId, requests.formname AS formname,
             requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
             FROM student JOIN requests ON student.collegeid = requests.collegeid AND  student.id=requests.stdid AND student.collegeid = ? AND student.department=? AND student.batch=? AND requests.tutor=?`;
       const query2Result = await db.query(query2, [collegeid,dept,batch,pending]);
       //console.log(query2Result);
       res.render('pending-requests',{id:req.session.userid,applications:query2Result});
       });
 
       //PENDING REQUESTS FOR PRINCIPAL
    router.get('/principal-pending-requests',db.isAuth,async(req,res)=>{         
         
         const query1 = 'SELECT collegeid FROM principal WHERE id = ?';
         const query1Result = await db.query(query1, [req.session.userid]);  
          
         var collegeid=query1Result[0].collegeid;
         var pending1='pending';
         var pending2='final:pending';
         const query2 = `SELECT 
         student.name AS name, student.id AS studentId, requests.formname AS formname,
         requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
         FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.collegeid = ? AND student.id=requests.stdid AND requests.principal IN (?,?)`;
         const query2Result = await db.query(query2, [collegeid,pending1,pending2]);
         console.log(query2Result);
         res.render('pending-requests',{applications:query2Result});
         });
 
         //PENDING REQUESTS FOR HOD
           router.get('/hod-pending-requests',db.isAuth,async(req,res)=>{         
         
           const query1 = 'SELECT collegeid,department FROM hod WHERE id = ?';
           const query1Result = await db.query(query1, [req.session.userid]);
            
           var collegeid=query1Result[0].collegeid;  
           var dept=query1Result[0].department;   
           var pending='pending';
           console.log('cid='+collegeid+',dept='+dept+'status='+pending)
           const query2 = `SELECT 
             student.name AS name, student.id AS studentId, requests.formname AS formname,
             requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
             FROM student JOIN requests ON student.collegeid = requests.collegeid AND  student.id=requests.stdid AND student.collegeid = ? AND student.department=? AND requests.hod=?`;
          const query2Result = await db.query(query2, [collegeid,dept,pending]);
           console.log(query2Result);
           res.render('pending-requests',{id:req.session.userid,applications:query2Result});
         });
  
 module.exports = router;