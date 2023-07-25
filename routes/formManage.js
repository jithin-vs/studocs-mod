const express = require('express');
const db =require('../controller/dbconnect');
const router = express.Router();
const path=require('path');
const verify =require("../controller/verification");
const mail =require("../controller/mailserv");
const bodyParser=require('body-parser');
const encoder =bodyParser.urlencoded({extended:true});

        /*----------- FORM CONTROL AND MAANGEMENT -------------*/

      // ADDING TEMPLATE 
      router.get('/addtemplate',db.isAuth,async(req,res)=>{         
        try{
          const id=req.session.userid; 
          const query1 = 'SELECT name FROM forms WHERE  collegeid = ?';
          const query1Result = await db.query(query1, [req.session.userid]);
          var results=query1Result;
          const divContent = results.length>0?results[0].name:null;
          const applications = results.length>0?results[0].name:null;// Empty array, can be populated later if needed
          res.render('addtemplate',{applications:results,id});
        }catch(err){
          console.log(err); 
        }  
      });
      
      router.get('/get-templates',db.isAuth, (req, res) => {
        
        try{
          db.connection.query("select * from forms",
        [req.params.name],(err,results,fields)=>{
        if(err) {
          throw err;  
        } 
        else{
          const templateNames = results.map(result => result.name);
          res.json({ templates: templateNames });
      
        }
        });
        }catch(err){
          console.log(err); 
        } 
        
      });
      
      //STATUS table  DISPLAY
      router.get('/status',db.isAuth,async(req,res)=>{
        try{
          const query1= `
          SELECT distinct
          student.collegeid AS collegeid, student.id AS studentid, student.batch AS batch,
          student.department AS dept, requests.dest AS dest 
          FROM student
          JOIN requests ON student.collegeid = requests.collegeid AND student.id = requests.stdid
          WHERE student.id = ?
        `;
          const query1Result = await db.query(query1, [req.session.userid]);
          console.log(req.session.userid)
          var collegeid=query1Result[0].collegeid; 
          var dept=query1Result[0].dept;
          var batch=query1Result[0].batch;
          var dest=query1Result[0].dest;
          console.dir(query1Result);
          var pending1='pending';
          var pending2='final:pending'; 
          const query2 = `SELECT 
          student.name AS name, student.id AS studentId, requests.formname AS formname,requests.formid AS formid, 
          requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
          FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.collegeid = ?  
          AND student.id=requests.stdid AND student.department=? AND student.batch=? AND student.id=? AND (requests.${dest} IN(?,?) OR requests.tutor=? OR requests.hod=? OR requests.principal=? OR requests.office=?)`;
          const query2Result = await db.query(query2, [collegeid,dept,batch,req.session.userid,pending1,pending2,pending1,pending1,pending1,pending1]);   
          console.log(query2Result) 
          const applications =query2Result;
          active1 = "";
          active2 = "";
          active3 = "";
          active4 = "";
          
          // Empty array, can be populated later if needed
          res.render('status',{ applications,active1,active2,active3,active4 });
        
        
        }catch(err){
          console.log(err); 
        }
   
    });
    //ststus
    router.post('/fetch-request-data', (req, res) => {
      const { appid } = req.body;
   
          db.connection.query("SELECT * FROM requests WHERE appid = ?", [appid], (err, results, fields) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error occurred while fetching request data.');
        } else {
          const requestData = results[0].request_data;
          var active1 = ' ';
  var active2 = ' '; 
  var active3 = ' ';
  var active4 = ' ';

  if (results[0].tutor === 'verified' || results[0].tutor === 'completed') {
    active1 = 'active';
  } 
   if (results[0].hod === 'verified'|| results[0].hod === 'completed') {
    active2 = 'active';
  } 
   if (results[0].principal === 'verified' || results[0].principal === 'completed') {
    active3 = 'active';
  } 
   if (results[0].office === 'verified' || results[0].office === 'completed') {
    active4 = 'active';
  }
    const responseData = {
      active1: active1, 
      active2: active2,
      active3: active3,
      active4: active4
    };
        
          res.send({ requestData: requestData, responseData: responseData });
        } 
      });
    });
    
    

    //REQUEST DISPLAY
    router.get('/form/:selectedFormId',db.isAuth, (req, res) => {
      const formId = req.params.selectedFormId;
    console.log(formId);
      db.connection.query("SELECT formdata FROM forms WHERE formid = ?", [formId], (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error retrieving HTML content');
        } else {
          if (results.length > 0) {
            const fetchedHTML = results[0].formdata;
            res.send(fetchedHTML);
          } else {
            res.status(404).send('HTML content not found');
          }
        }
      });
    });
    
      //REQUEST DISPLAY
      router.get('/requ/:selectedFormId',db.isAuth, (req, res) => {
        const formId = req.params.selectedFormId;
        db.connection.query("SELECT request_data FROM requests WHERE appid = ?", [formId], (err, results) => {
          if (err) {
            console.error(err);  
            res.status(500).send('Error retrieving HTML content');
          } else {
            if (results.length > 0) {
              const fetchedHTML = results[0].request_data;
              res.send(fetchedHTML);
            } else {
              res.status(404).send('HTML content not found');
            }
          }
        });
      });
      

     //SAVING TEMPLATEFORMS
     router.post('/save-template', (req, res) => {
      var name = req.query.name;
      const selectedOption = req.body.selectedOption;
      const attachment = req.body.attachment;
      console.log(selectedOption);
      // console.log(name);
      var collegeid = req.session.userid;
      console.log(name);
      var divContent = req.body.content;
      // console.log(divContent);
      db.connection.query("UPDATE forms SET formdata = ?, dest = ?, attachment = ? WHERE name = ? AND collegeid = ?",
         [divContent, selectedOption, attachment, name, collegeid], (err, results, fields) => {
            if (err) {
               throw err;
            } else {
               res.render('addtemplate');
               // res.redirect(`/addtemplate?id=${collegeid}`);
            }
         });
   });
   
     //ADD OR EDIT FORMS
     router.get('/addnewform',db.isAuth,(req, res) => {
      const id= req.session.userid;
      const templateName = req.query.name; // Get the template name from the query parameter
  
      // Fetch the template content from the server
      db.connection.query('SELECT formdata FROM forms WHERE name = ?', [templateName], (err, results, fields) => {
        if (err) {
          throw err;
        } else {
          const templateContent = results.length > 0 ? results[0].formdata : ''; // Get the template content or set it as an empty string if not found
          res.render('addnewform', { templateName: templateName, templateContent: templateContent ,id});
        }
      });;
     });

     //VERIFY FORM BY ADMINISTRATORS
     router.get('/verify-form',async(req,res)=>{ 
        var appid=req.query.appid;
        var user=req.session.user;
        var nextUser;
        console.log('user'+user)
        switch (user.toLowerCase()) {
          case 'tutor'    : nextUser = 'hod' ;       break;
          case 'hod'      : nextUser = 'principal' ; break;
          case 'principal': nextUser = 'office' ;    break;
        }   
        if(user ==='office')
           nextUser=user; 
        console.log(nextUser+','+appid);
       // Check the flag column value before executing the update query
          const checkQuery = `SELECT ${user},${nextUser} FROM requests WHERE appid =?`;  
          
          try {
            const checkResult = await db.query(checkQuery, [appid]);
            console.log(checkResult);
            const userValue = checkResult[0][user];
            const nextUserValue= checkResult[0][nextUser];
            console.log("user value="+userValue);
              if (checkResult.length > 0 && checkResult[0][user]=== 'final:pending') {
                console.log('form path ended.');
                const updateQuery = `UPDATE requests SET ${user} = 'completed' WHERE appid = ?`;
                try {
                  const updateResult = await db.query(updateQuery, [appid]);  
                  // Process the update result
                  console.log('Update successful');
                  res.redirect(`/${user}-pending-requests`)
                } catch (error) {
                  // Handle the error
                  console.error('Error occurred during update:', error);
                }
              }else {
                let updateQuery;
                if (nextUserValue=== 'final') {
                  updateQuery = `UPDATE requests SET ${user} = 'verified', ${nextUser} = 'final:pending' WHERE appid = ?`;
                } else {
                  updateQuery = `UPDATE requests SET ${user} = 'verified', ${nextUser} = 'pending' WHERE appid = ?`;
                }

                try {
                  const updateResult = await db.query(updateQuery, [appid]);
                  // Process the update result
                  console.log('Update successful');
                  res.redirect(`/${user}-pending-requests`);
                } catch (error) {
                  // Handle the error  
                  console.error('Error occurred during update:', error);
                }
              }
              
          } catch (error) {
            // Handle the error
            console.error('Error occurred during flag check:', error);
          }

     })

      //REJECT FORM BY ADMINISTRATORS
      router.get('/reject-form',async(req,res)=>{ 
        var appid=req.query.appid;
        var user=req.session.user;
        const query1 = `SELECT 
        student.name AS name, student.id AS studentId,
        requests.appid AS appid,student.email AS email
        FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.id=requests.stdid AND 
        requests.appid=?`;
       const query1Result = await db.query(query1, [req.query.appid]);
       console.log(query1Result);
       const name=query1Result[0].name;
       const email=query1Result[0].email;
       mail.sendrejectEmail(name,appid,email);
        console.log('appid='+appid);
          try { 
            const updateQuery = `UPDATE requests SET ${user} = 'rejected' WHERE appid = ?`;
                try {
                  const updateResult = await db.query(updateQuery, [appid]);  
                  // Process the update result
                  console.log('Update successful');
                  res.redirect(`/${user}-pending-requests?id=${req.session.userid}&user=${user}`)
                } catch (error) {
                  // Handle the error
                  console.error('Error occurred during update:', error);
                }        
          } catch (error) {
            // Handle the error
            console.error('Error occurred during flag check:', error);
          }

     })

         //OTP VERIFICATION
        router.get('/otpverify',db.isAuth,(req, res) => {
            const jsonData = req.query.data;
            const data = JSON.parse(jsonData);  
            const formid = data[0].formid; // Accessing the 'formid' property
            const stdid = data[0].id; 
        
            db.connection.query('SELECT name,email FROM student WHERE id = ?', [stdid], (err, results, fields) => {
            if (err) {
                throw err;
            } else {
                const email = results.length > 0 ? results[0].email : '';
                const name=results.length>0?results[0].name:''; // Get the template content or set it as an empty string if not found
                var genOtp=verify.generateOTP();        
                mail.sendOTPEmail(name,email,genOtp);
                req.session.otp = genOtp; 
                console.log(genOtp)
                //const jsonData = JSON.stringify(data);
                res.render('otpverify', {otp:genOtp,jsonData});
            }
            });;    
        });

        //OTP VERIFICATION
        router.post('/otpverify',db.isAuth,(req, res) => {
            console.log(req.body)  
            const jsonData = req.body.jsonData;
            const submittedOTP = req.body.otp;
            const storedOTP = req.session.otp;
            console.log("in post otp=\t"+storedOTP);
            if (submittedOTP === storedOTP) {
            // OTP verification successful  
            // Handle form submission here
            
            // Clear the OTP from the session after successful submission
            delete req.session.otp;
            res.redirect(`/submit?data=${encodeURIComponent(jsonData)}`);
            } else {
            // Invalid OTP, display an error or redirect to the OTP verification page
            res.send('Invalid OTP. Please try again.');     
            }   
        
        });
        
        //UPLOAD ATTCHMENT FILES FOR STUDENTS
        router.post('/upload', async(req, res) => {
        
            const id = req.session.userid;
            console.log('here' + id);
            console.log(req.body);
            if (!req.files || !req.files.file) {

            console.log('no file uploaded');
            return res.status(400).json({ error: 'No file uploaded' });
            
            }
            
            // Retrieve file information from request
            const file = req.files.file;
            console.log(file);

            // Insert file data into the MySQL database
            const query1 = 'select * from student';
            const values = [req.body.attaname, file.mimetype, file.size];
            
            try {
            const result = await db.query(query1,values);

            console.log(result);
            // Retrieve the generated file ID
            // const fileId = result.insertId;
            
            // Update the file ID in the file object
            // file.fileId = fileId;
            
            // Continue with additional file processing or response handling
            // For example, you can save the file to a specific location on the server
            // or perform further operations based on the file ID
            
            res.status(200).json({ message: 'File uploaded successfully', fileId });
            } catch (error) {
            // Handle database errors
            console.error(error);
            res.status(500).json({ error: 'Database error' });
            }
            
    
        
        });
        

        //render in edit in student requestes
        router.get('/edit', db.isAuth,(req, res) => {
            const formid = req.query.Formid;
            const id=req.session.userid;
            
            // Retrieve the form data from the database based on the formId
            db.connection.query("SELECT * FROM forms WHERE formid = ?", [formid], (err, results) => {
            if (err) {
                throw err; 
            } else {
                const templateContent = results.length > 0 ? results[0].formdata : ''; // Get the template content or set it as an empty string if not found
                res.render('newform', { formid,id,templateContent: templateContent});
        }
        }); 
    });
        
        //upload student attachment 
        const otpGenerator = require('otp-generator');
        
        function generateUniqueID() {
            return new Promise((resolve, reject) => {
            const uniqueID = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
            // Check if the generated ID is already present in the database
            const sql = 'SELECT attaid FROM attachment WHERE attaid = ?';
            db.connection.query(sql, [uniqueID], function (error, results) {
                if (error) {
                console.error('Error checking uniqueness of attaid');
                reject(error);
                }
                if (results.length === 0) {
                resolve(uniqueID); // Return the unique ID if it is not present in the database
                } else {
                resolve(generateUniqueID()); // Generate a new unique ID recursively if it is already present
                }
            });
            });
        }
        
        router.post('/upload/:name', (req, res) => {
            const { attaname } = req.body;
            const name = req.params.name;
            let collegeid, regno;

            if (!req.files || !req.files.file) {
            // Display error notification using SweetAlert
            return res.status(400).send('no files attached');
            }
            db.connection.query("SELECT * FROM student WHERE id = ?", [name], (err, results1, fields) => {
            if (err) {
                throw err;
            } else {
                collegeid = results1[0].collegeid;
                regno = results1[0].id;
        
                generateUniqueID()
                .then(attaid => {
                const uploadedFile = req.files.file; // Assuming the file input field name is "file"
                var filePath = path.join('./public/uploads/student', regno.toString(), uploadedFile.name);
                console.log(filePath);
                
                uploadedFile.mv(filePath)
                    .then(() => {
                    console.log('Upload successful');
                    filePath = filePath.replace('public', '');
                    return generateUniqueID();
                    })
                    .then(attaid => {
                    console.log(attaid);
                    console.log(regno);
                    console.log(collegeid);
                
                    const sql = 'INSERT INTO attachment (stdid, collegeid, attaid, attaname, file) VALUES (?, ?, ?, ?, ?)';
                    db.connection.query(sql, [regno, collegeid, attaid, attaname, filePath], function (error, results) {
                        if (error) {
                        console.error('Error saving attachment to the database');
                        res.status(500).send('Internal Server Error'+error);
                        } else {
                
                            res.redirect(`/student/${regno}`);

                        }
                    });
                    })
                    .catch(error => {
                    console.error('Error uploading file or generating unique ID', error);
                    res.status(500).send('Internal Server Error');
                    });
                
                })
                .catch(error => {
                console.error('Error generating unique ID', error);
                res.status(500).send('Internal Server Error');
                });
            
            }
            }); 
        });
        router.post('/remove', function (req, res) {
            const attachmentId = req.body.attachmentId;
            const Id = req.query.regno;
            console.log(attachmentId);
            console.log(Id);
            const sql = 'DELETE FROM attachment WHERE attaid = ?';
            db.connection.query(sql, [attachmentId], function (error, results) {
            if (error) {
                console.error('Error removing attachment from the database',attachmentId);
                console.error(error);
            }
            console.log(query);
            res.redirect(`/student/${Id}#docs`);
            });
        }); 
        //delete template
        router.get('/delete', (req, res) => {
            const templateName = req.query.name;
        
            // Delete the corresponding records in the `requests` table first
            const deleteRequestsQuery = 'DELETE FROM requests WHERE formid IN (SELECT formid FROM forms WHERE name = ?)';
        
            db.connection.query(deleteRequestsQuery, [templateName], (err, result) => {
            if (err) {
                console.error('Error deleting requests: ', err);
                res.sendStatus(500);
                return;
            }
        
            // Delete the template from the `forms` table
            const deleteFormQuery = 'DELETE FROM forms WHERE name = ?';
        
            db.connection.query(deleteFormQuery, [templateName], (err, result) => {
                if (err) {
                console.error('Error deleting template: ', err);
                res.sendStatus(500);
                } else {
                console.log('Template deleted successfully');
                
                res.redirect(`/addtemplate`);
                } 
            });
            });
        });
        
        router.get('/psw-reset', (req, res) => {
            res.render('forget');
        })
        
        router.post('/delete', (req, res) => {
            const { user, username } = req.session.resetPasswordData;
            const newPassword = req.body.newPassword;
            
            // Update the password based on the user type
            switch (user) {
                case 'college':
                // Update the college password in the database
                db.connection.query(
                    'UPDATE college SET password = ? WHERE collegeid = ?',
                    [newPassword, username],
                    (err, results) => {
                    if (err) {
                        console.error(err);
                        return res.send('Server error');
                    }
                    
                    // Password updated successfully
                    res.send('Password reset successfully!');
                    }
                );
                break;
                
                case 'Student':
                // Update the student password in the database
                db.connection.query(
                    'UPDATE Student SET password = ? WHERE id = ?',
                    [newPassword, username],
                    (err, results) => {
                    if (err) {
                        console.error(err);
                        return res.send('Server error');
                    }
                    
                    // Password updated successfully
                    res.send('Password reset successfully!');
                    }
                );
                break;
                
                case 'Tutor':
                // Update the tutor password in the database
                db.connection.query(
                    'UPDATE Tutor SET password = ? WHERE id = ?',
                    [newPassword, username],
                    (err, results) => {
                    if (err) {
                        console.error(err);
                        return res.send('Server error');
                    }
                    
                    // Password updated successfully
                    res.send('Password reset successfully!');
                    }
                );
                break;
                
                case 'Hod':
                // Update the HOD password in the database
                db.connection.query(
                    'UPDATE Hod SET password = ? WHERE id = ?',
                    [newPassword, username],
                    (err, results) => {
                    if (err) {
                        console.error(err);
                        return res.send('Server error');
                    }
                    
                    // Password updated successfully
                    res.send('Password reset successfully!');
                    }
                );
                break;
                
                case 'Principal':
                // Update the principal password in the database
                db.connection.query(
                    'UPDATE Principal SET password = ? WHERE id = ?',
                    [newPassword, username],
                    (err, results) => {
                    if (err) {
                        console.error(err);
                        return res.send('Server error');
                    }
                    
                    // Password updated successfully
                    res.send('Password reset successfully!');
                    }
                );
                break;
                
                default:
                res.send('Invalid user type');
            }
            });
        //attachment_student loading and select
        router.get('/attachment-options', (req, res) => {
        const id=  req.session.userid
            const query = 'SELECT attaid, attaname FROM attachment where stdid=?';
            db.connection.query(query,[id], (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                res.status(500).send('Error fetching attachment options');
            } else {
                res.json(results);
            }
            });
        });


            router.get('/download', (req, res) => {
            const filePath = req.query.file; // Get the file path from the query parameter
            
            // Check if the file exists
            if (!filePath) {
                return res.status(404).send('File not found.');
            }
            
            // Resolve the absolute file path
            const absolutePath = path.join(__dirname, '..', 'public', filePath);
            
            // Set the appropriate headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline'); // Open file in browser tab
            
            // Send the file as the response
            res.sendFile(absolutePath);
            });
            
        // Route for inserting a new card
    router.post('/insert-card', (req, res) => {
    const name = req.body.name;
    const collegeId = req.session.userid;

    // Prepare the SQL query
    const sql = 'INSERT INTO forms (name, collegeid) VALUES (?, ?)';
    const values = [name, collegeId];

    // Execute the SQL query
    db.connection.query(sql, values, (error, results) => {
        if (error) {
        console.error('Error inserting the card into the database: ' + error.stack);
        res.json({ success: false });
        } else {
        console.log('Card inserted successfully!');
        res.json({ success: true });
        }
    });   
    });
        
    // Define a route to update the request_data field
    router.post('/update-request-data', (req, res) => {
    // Get the request body
    const { request_data,appid } = req.body;
    console.log(appid)
    // Update the MySQL table with the new request_data value
    const query = 'UPDATE requests SET request_data = ? WHERE appid = ?';
    db.connection.query(query, [request_data, appid], (error, results) => {
        if (error) {
        console.error('Error updating request_data:', error);
        res.status(500).send('Error updating request_data');
        } else {
        console.log('request_data updated successfully1');
        res.send('request_data updated successfully');
        }
    });
    });

    //attachment add in request

    router.get('/add_attach', (req, res) => {
    const id = req.session.userid; // Get the 'id' parameter from the query string
    console.log(id)
    // Perform the database query to fetch attachments based on the 'id'
    // Replace the database query with your actual implementation
    db.connection.query('SELECT attachment.attaname, attachment.file FROM requests INNER JOIN attachment ON FIND_IN_SET(attachment.attaid, requests.attachment) WHERE requests.appid = ?;', [id], (error, results) => {
        if (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
        } else {
        console.log(results);
        res.json(results);
        }
    }); 
    });

    // Function to process the retrieved data and generate HTML content
    function generateAttachmentHTML(results) {
    const attachmentHTMLArray = [];

    results.forEach((row) => {
        const linkHTML = `<a href="${row.file}">${row.attaname}</a>`;
        attachmentHTMLArray.push(linkHTML);
    });

    return attachmentHTMLArray.join('');
    }

module.exports=router;