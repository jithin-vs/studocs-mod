const nodemailer = require("nodemailer");
require('dotenv').config();

let transporter=nodemailer.createTransport({
  host:'smtp.gmail.com',
 port:587,
 secure:false,
 requireTLS:true,
 tls: {
  rejectUnauthorized: false
 },
 auth:{
   user:'studocs.geci@gmail.com',
   pass:process.env.EMAIL_PASS
 }
});
const sendverifyEmail=async(name,email,token)=>{

      const mailOptions = {
        from: 'studocs.geci@gmail.com',
        to: email,
        subject: 'Verify your email address',
        html: '<p>Hi '+name+' please  <a href="http://127.0.0.1:3000/verify?token='+token+'&?email='+email+'">click here</a> to verify your email.</p>'
         
      };  
      transporter.sendMail(mailOptions, function(error,info){
        if(error){
           console.log(error);
        }
        else{
           console.log("Email has been sent:- ",info.response);
        }
      })

    
}

const sendcredEmail=async(name,email,gen_username,gen_password)=>{
      console.log('sending mail....');
      const mailOptions = {
        from: 'studocs.geci@gmail.com',
        to: email,
        subject: 'Login details',
        html: '<p>Hi, '+name+' .Given below is your username and password .You can change your login details if needed</p>  <p>Username: '+gen_username+'</p> <p>Password: '+gen_password+'</p>'   
      };
      transporter.sendMail(mailOptions, function(error,info){
        if(error){
           console.log(error);
        }
        else{

           console.log("Email has been sent:- ",info.response);
        }
      })

}

const sendregisterEmail=async(name,email)=>{
  const mailOptions = {
    from: 'studocs.geci@gmail.com',
    to: email,
    subject: 'College Registeration',
    html:`<!DOCTYPE html>
    <html>
    
    <head>
      <meta charset="UTF-8">
      <title>Studocs</title>
    </head>
    
    <body>
      <div style="font-family: Arial, sans-serif;">
        <h2>Welcome to Studocs</h2>
        <p>Thank you for contacting Studocs.</p>
        <p>Please provide us with the following details:</p>
    
        <ol>
          <li>Official College Name:</li>
          <li>College id:</li>
          <li>Physical Address:</li>
          <li>College Website URL:</li>
          <li>Contact Person's Name:</li>
          <li>Contact Person's Position/Role:</li>
          <li>Contact Person's Email Address:</li>
          <li>Contact Person's Phone Number:</li>
          <li>Contact person id proof:</li>
        </ol>
        <p>We may contact you for any clarifications or additional documentation, if necessary.</p>
        <p>After verification, we will provide you with a username and password.</p>
    
        <p>Best regards,</p>
        <p>Team Studocs</p>
        <br>
        
        <p>For more queries contact,</p>
        <p>studocs.geci@gmail.com</p>
        <p>9947761957</p>
       
    
    
       
      </div>
    </body>
    
    </html>`  
  };
  transporter.sendMail(mailOptions, function(error,info){
    if(error){
       console.log(error);
    }
    else{

       console.log("Email has been sent:- ",info.response);
    }
  })

}
 
const sendrejectEmail=async(name,appid,email)=>{
  const mailOptions = {
    from: 'studocs.geci@gmail.com',
    to: email,
    subject: 'Request Rejected',
    html: '<p>Hi, '+name+' .Your request '+appid+' has been rejected.login to your account for more details.</p>'   
  };
  transporter.sendMail(mailOptions, function(error,info){
    if(error){
       console.log(error);
    }
    else{

       console.log("Email has been sent:- ",info.response);
    }
  })

}
 
const sendOTPEmail=async(name,email,otp)=>{
  console.log('sending mail....');
  const mailOptions = {
    from: 'studocs.geci@gmail.com',
    to: email,
    subject: 'Login details',
    html: '<p>Hi, '+name+' ,Your OTP is: '+otp+'</p>'   
  };
  transporter.sendMail(mailOptions, function(error,info){
    if(error){
       console.log(error);
    }
    else{

       console.log("Email has been sent:- ",info.response);
    }
  })

}

const sendpswOTPEmail=async(name,email,otp)=>{
  console.log('sending mail....');
  const mailOptions = {
    from: 'studocs.geci@gmail.com',
    to: email,
    subject: 'Login details',
    html: '<p>Hi, '+name+' ,Your Password reseting OTP is: '+otp+'</p>'   
  };
  transporter.sendMail(mailOptions, function(error,info){
    if(error){
       console.log(error);
    }
    else{

       console.log("Email has been sent:- ",info.response);
    }
  })

}

/*const verifyEmail =async (req,res) =>{
   
  try{
   //
  } catch(error) {
      console.log(error.message);
  }
} */

 module.exports = {sendverifyEmail,sendcredEmail,sendregisterEmail,sendOTPEmail,sendpswOTPEmail,sendrejectEmail};
