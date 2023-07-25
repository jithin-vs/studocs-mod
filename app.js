// Import required modules
const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const bodyParser=require('body-parser');
const flash = require('connect-flash');
const path=require('path');
const db=require('./controller/dbconnect');
const mysqlStore = require('express-mysql-session')(session);
const Routes = require('./routes/routes');
const profileRoutes = require('./routes/profile');


const encoder =bodyParser.urlencoded({extended:true});
require('dotenv').config();

// Create an instance of the Express app  
const app = express();
app.set('view engine','ejs');  
 

//mysql session store
var sessionstore =new mysqlStore({
  expiration :10800000,
  createDatabaseTable: true,
  schema:{
     tableName:'Sessions',
     columnNames:{ 
        session_id:'session id',
        expires:'expires',
        data:'data'
     }
  }
},db.connection);

//session setup
app.use(session({
  secret:process.env.SECRET_KEY,
  store:sessionstore,
  resave:false,
  saveUninitialized:true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }, 
}));

 
// Serve static files
app.use(express.static(__dirname +  '/public/'));
app.use(express.json({}));
app.use(flash());  
app.use(encoder);
app.use(fileUpload({
  createParentPath:true,
  limits:{
    fileSize:4*1024*1024
  },
  abortOnLimit:true
}
));


app.use('/', Routes);
app.use('/profile', profileRoutes);

// Start the server
app.listen(3000, () => {
  console.log('Studocs app is listening on port 3000.');
});   
  