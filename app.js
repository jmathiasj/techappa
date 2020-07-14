
//**********************************************************Node Modules********************************************************************************************************

var express = require("express");
var fs = require("fs");
var app = express();
var bodyParser = require("body-parser");
var nodemailer = require("nodemailer");
var passport = require("passport");
var flash = require('express-flash-messages');
var multer=require('multer');
var passportLocalMongoose = require("passport-local-mongoose");
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/user");
var mongoose = require("mongoose");

var admin = require("./models/admin");



var methodOverride =require('method-override');


  
  
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
}) ;        
//*******************************************************************Node Mailer*******************************************************************************************************************************************************************************

// var transporter = nodemailer.createTransport({ // Creating a Transporter(The admin account from which ails will be sent )
//     service: 'gmail',
//     auth: {
//         user: '',
//         pass: ''
//     }
// });




//************************************************************Extra Variable Methods*******************************************************************************************************

mongoose.connect("mongodb://localhost:27017/cupcake"); // set the database named cupcake
app.use(bodyParser.urlencoded({ extended: true })); // tell app to use body parse
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(flash());

 
 
//********************************************************************************************************************************************************************************************************** 
//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Drug",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


passport.serializeUser(function(User, done) {
  // placeholder for custom user serialization
  // null is for errors
  done(null, User);
});

passport.deserializeUser(function(User, done) {
  // placeholder for custom user deserialization.
  // maybe you are going to get the user from mongo by id?
  // null is for errors
  done(null, User);
});

app.use(function(req,res,next){
   res.locals.currentUser  = req.user;
   next();
});

// app.use(function(req,res,next){
//   res.locals.currentadmin  = req.admin;
//   next();
// });



//************************************************************cONNECTIONS*******************************************************************************************************
// "/" => home.ejs..........it is the homepage
app.get("/",function(req,res){
    
    
    res.render("home");
})

app.get("/admin",function(req,res){
    
    res.render("admin");
})

app.get("/voter",isLoggedIn,function(req,res){
    
    
    res.render("aboutUs");
})






// "/aboutus" => aboutUs.ejs..........it is the page which will take to info pg about us



//==============================================================User profile=======================================================================

app.get("/home/:id",isLoggedIn,  function(req, res){
    // find user by id
            User.findById(req.params.id, function(err){
                if(err)
                {
                    console.log(err);
                }
                else 
                {
                  console.log("Success");
                  res.render("userprofile",{user:User});
                }
             });
});















//==============================================================Registered=======================================================================

app.get("/viewRehab",function(req,res){
    var noMatch;
    if(req.query.search){
        
       const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        User.find({name: regex},function(err, allRehab){
                
                if(err){
                    console.log(err);
                }else{
                    
                    if(allRehab.length<1){
                        noMatch = "No Rehabs found in that location, Sorry.";
                    }
                  res.render("viewRehab",{rehab:allRehab, noMatch:noMatch});  
                }
            });
        
    }else{
            User.find(function(err, allRehab){
                
                if(err){
                    console.log(err);
                }else{
                    
                  res.render("viewRehab",{rehab:allRehab, noMatch: noMatch});  
                }
            });
        }
          
});


//********AUTH ROUTES*********

// "/signin" => signIn.ejs..........it is the sigin page for user signup
app.get("/signIn",function(req,res){
    res.render("signIn");
})

// var fs = require('fs'); 
// var path = require('path'); 
 
  
// var storage = multer.diskStorage({ 
//     destination: (req, file, cb) => { 
//         cb(null, '/public/uploads/') 
//     }, 
//     filename: (req, file, cb) => { 
//         cb(null, file.fieldname + '-' + Date.now()) 
//     } 
// }); 
  
// var upload = multer({ storage: storage }); 


app.post("/signIn",function(req,res){
  
    var newUser = new User({username : req.body.username, 
        name: req.body.name,
    
    number:req.body.number,
    email: req.body.email,
    // image:{ 
    //         data: fs.readFileSync(path.join(__dirname + '/public/uploads/' + req.body.file)), 
    //         contentType: 'image/png'
    //     }, 
    quiz1: 0,
    quiz2: 0,
    quiz3: 0,
    quiz4: 0,
    quiz5: 0

});    
    // upload(req,res,function(err) {
    // if(err){
    //     console.log("Error uploading file.");
    // }
    // console.log("File is uploaded");
 
    // });
    
    //  var mailOptions = {
    //     from: '',
    //     to: newUser.email,
    //     subject: 'Greetings From Drug_rehab.com!!',
    //     html: '<h4>Hello</h4>' + newUser.username + '<h4>Thanks for visiting us.</h4><h4>You have succesfully signed in. We hope you have a wonderful experience</h4>'
    // };

    // transporter.sendMail(mailOptions, function(error, info) {
    //     if (error) {
    //         console.log(error);
    //     }
    //     else {
    //         console.log('Email sent: ' + info.response);
    //     }
    // });
   
    User.register(newUser, req.body.password,function(err, User){
        if(err){
            console.log(err);
            return res.render("signIn");
        }
        console.log("New User created:");
        console.log(User);
        passport.authenticate("local")(req,res, function(){
          res.redirect("/");
        });
        
        });
        
        
        
        
    });

// ==============Login========================= \\


// "/login" => login.ejs..........it is the login page for user to login
app.get("/login",function(req,res){
    
    
    res.render("login");
})

app.post('/login',
  passport.authenticate('local', { successRedirect: "/", failureRedirect: "/login"})
);

// admin
app.get("/adminlogin",function(req,res){
    res.render("adminLogin");
})

app.post('/adminlogin', function(req,res){
    if(req.body.username ==="admin" && req.body.password==="admin123"){
        res.render("admin");
    }
    else{
        res.render("adminLogin");
    }
}
);


// ==============Logout======================== \\

app.get("/logout",function(req,res){
   req.logout();
   res.redirect("/");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
        
    }
    res.redirect("/login");
}

// =============Search Logic================== \\

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

//listen to port (AWS  ports)
app.listen(process.env.PORT,process.env.IP,function(){
    
     console.log("Server Started Sucessfully......!! ");
    
});

