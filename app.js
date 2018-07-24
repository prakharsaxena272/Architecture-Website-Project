var express= require("express");
var mongoose = require("mongoose");
var passport = require("passport");
var nodemailer = require('nodemailer');
var bodyParser = require("body-parser");
var local =      require("passport-local");
var plm = require("passport-local-mongoose");
var User = require("./models/user");
const multer = require('multer');
const path = require('path');
mongoose.connect("mongodb://localhost/arch"); 

var app = express();
app.set("view engine" , "ejs" );
// var path = require('path');
//app.use
//app.set('view engine', 'html');
//app.use(express.static('views'));
app.use(express.static('public')); 
var pass = "deep1234";
app.use(bodyParser.urlencoded({extended: true}));

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/images/',
  filename: function(req, file, cb){
    cb(null,file.originalname  );
  }
});

const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }
  }).single('projects');
  
  // Check File Type
  function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif|pdf/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    console.log(extname);
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
  }
  


//   app.get('/upload', (req, res) => res.render('index'));

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if(err){
      res.render('admin', {
        msg: err
      });
    } else {
      if(req.file == undefined){
        res.render('admin', {
          msg: 'Error: No File Selected!'
        });
      } else {
        res.render('admin', {
          msg: 'File Uploaded!',
          file: `uploads/${req.file.filename}`
        });
      }
    }
  });
});






app.use(require("express-session")({
    secret : "i am smart",
    resave : false,
    saveUninitialized : false
}));





app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new local(User.authenticate()));
// passport.use(new LocalStrategy(function(username, password, done){
//     if(username === 'admin'){
//         //Done!
//     }
//     else{
//         User.findOne({username:username}, function(error, results){
//             console.log(results);
//             if(error) throw error;
//             else{
//                 if(password == results.password){
//                     return done(null, {user_id:results.id});
//                 }
//                 else{
//                     return done(null, false);
//                 }
//             }
//         });
//     }
// }));
var Schema = new mongoose.Schema({
	//index : Number,
	name : String,
    image: String,
    description: String

});
var design = mongoose.model("design",Schema);


app.get("/register", function(req,res){

    res.render("register");
});



app.post('/signup', function(req, res){
	var email = req.body.email;
	var name = req.body.name;
    var msg = req.body.message;
    var tel = req.body.telephone;
    var subject = req.body.subject;
	var data = {name : name , email : email , message : msg , telephone : tel , subject : subject};
	var transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com', //Change HOST
        port:   587,
        secure: false, 
        auth: {
            user: 'prakharsaxena303@outlook.com',   // generated ethereal user
            pass: 'Robin123@'                  // generated ethereal password
        }
    });
    let mailOptions = {
        from: 'prakharsaxena303@outlook.com', // sender address
        to: 'prakharsaxena303@gmail.com', // list of receivers
        subject: 'Hello', // Subject line
        text: 'Hello testing with    '+name+'    email    '+email+ '     '+msg +'     ' +tel +'        ' + subject // plain text body
    };
    transporter.sendMail(mailOptions, function(error, info){
    	if(error){
        	return console.log(error);
    	}
    	console.log('Message sent: ' + info.response);
      res.render("submit.ejs");
   });
});



app.post("/register", function(req,res){
var username = req.body.username;
var password = req.body.password;
var email = req.body.email;
var gender = req.body.gender;
// res.render('sdfghj');
//it is not good to save the pssword in the database so we just 
// pass it   parameter to the database which is stored as a string 
User.register(new User({username: username,gender : gender, email : email  }), password , function(err, user){
    if(err)
    {  
        return res.render('register');
    }
    // here the user is going to be logged in
    passport.authenticate("local")(req,res,function(){
        //console.log("poi");
        res.redirect("/elevation");
    });
});
});




app.get("/login", function(req,res){
 res.render("login");
});

app.post("/login" , passport.authenticate("local",{
    

    failureRedirect : "/login"
    
 }), function(req,res){
     console.log(req.body.username);
     if(req.body.username === 'admin'){
         req.session.admin = true;
        res.redirect("/admin");
     }
     else{
         res.redirect('/elevation');
     }
 });



 app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
  });

 

app.get("/elevation",isLoggedIn, function(req, res){
    res.render("elevation");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
    }
    //console.log("fun");
    res.redirect("/login");
  }




app.get("/home", function(req,res)
{
 design.find({},function(err,alldesign){
	if(err){
		console.log(err);}
		else{
			res.render("home.ejs",{designs:alldesign});}
	});
	
    //res.sendFile(path.resolve('\Backup\www\color\views\color_game.html'));
    //    res.render("home.ejs");
    //res.sendFile(path.join(__dirname + '/views/home.ejs'))
});

app.get("/admin",function(req,res)
{
     //res.sendFile(path.resolve('\Backup\www\color\views\color_game.html'));
    // if(pass != "null")
    // {
    //     console.log(pass);
    
    // }
    // else{
    //     console.log("else");
    //     res.redirect("/home");
    // }
    if(req.isAuthenticated() && req.session.admin){
     res.render("admin.ejs");
    }
    
    //res.sendFile(path.join(__dirname + '/views/arch_pjt.ejs'))
});


app.post("/admin", function(req,res)
{ pass1= req.body.pass;
    if(pass.localeCompare(pass1) == 0)
    {
        bool= true;
    res.redirect("/admin");
    }
    else{
        alert("somethings wrong");
    }
});

function isCorrect (req,res,next)
{
    if(bool === true)
    {return next();}
    res.redirect('/home');
}

app.post("/home", function(req,res){
    // get data from form and add to campground
    // n=n+1;
    var image = req.body.image;
    var name = req.body.name;
    var desc = req.body.desc;
    var object = { name:name , image:image , description :desc};
    design.create(object,function(err , newadded){
        if(err)
        {
            console.log(err);
        }
        else{
            //console.log("entered");
            res.redirect("/home");
        }
    })
});

app.get("/about", function(req,res)
{
    //res.sendFile(path.resolve('\Backup\www\color\views\color_game.html'));
    res.render("about.ejs");
    //res.sendFile(path.join(__dirname + '/views/arch_pjt.ejs'))
});

app.get("/", function(req,res)
{
    //res.sendFile(path.resolve('\Backup\www\color\views\color_game.html'));
    res.render("arch_pjt.ejs");
    //res.sendFile(path.join(__dirname + '/views/arch_pjt.ejs'))
});


app.listen("2805",function(){
    console.log("sever is started");
 });
