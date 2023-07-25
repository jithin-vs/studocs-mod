const mysql = require('mysql2');
require('dotenv').config();
 
// Set up a MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:process.env.MYSQL_PASS,
    database: 'studocs',
  });  
  
  // Connect to the MySQL database
 connection.connect((error) => {
    if (error) {  
      console.error('Error connecting to the MySQL database: ' + error.stack);
      return;
    }
    console.log('Connected to the MySQL database.'); 
  });   
 
  const isAuth = (req,res,next) =>{
    if(req.session.isAuth){
      next();
    }
    else{
       res.redirect('/inner-page');     
    }
  }
     // Promisify the pool.query method
     const query = (sql, args) => {
      return new Promise((resolve, reject) => {
           connection.query(sql, args, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          } 
        });
      });
    };
    
module.exports = {connection,isAuth,query};