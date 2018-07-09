var express= require("express");
var mongoose = require("mongoose");
var passport = require("passport");

var bodyParser = require("body-parser");
var local =      require("passport-local");
var plm = require("passport-local-mongoose");
var User = require("./models/user");
mongoose.connect("mongodb://localhost/arch"); 

var app = express();
app.use(require("express-session")({
    secret : "i am smart",
    resave : false,
    saveUnitialized : false


}));


app.use(bodyParser.urlencoded({extended: true}));




app.set("view engine" , "ejs" );
// var path = require('path');
//app.use
//app.set('view engine', 'html');
//app.use(express.static('views'));
app.use(express.static('public'));



app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new local(User.authenticate()));

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


app.post("/register", function(req,res){
var user = req.body.name;
var pass = req.body.pass;
var email = req.body.email;
var gender = req.body.gender;
// res.render('sdfghj');
//it is not good to save the pssword in the database so we just 
// pass it   parameter to the database which is stored as a string 
User.register(new User({username: user,gender : gender, email : email  }), pass , function(err, user){
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
   
    successRedirect : "/elevation" , 

    failureRedirect : "/login"
    
 }), function(req,res){
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
			console.log(err);
		}
		else{
			res.render("home.ejs",{designs:alldesign});
		}
	});
	
    //res.sendFile(path.resolve('\Backup\www\color\views\color_game.html'));
//    res.render("home.ejs");
    //res.sendFile(path.join(__dirname + '/views/home.ejs'))
});

app.get("/admin", function(req,res)
{
    
    //res.sendFile(path.resolve('\Backup\www\color\views\color_game.html'));
    if(pass != "null")
    {
        console.log(pass);
    res.render("admin.ejs");
    }
    else{
        console.log("else");
        res.redirect("/home");
    }
    //res.sendFile(path.join(__dirname + '/views/arch_pjt.ejs'))
});

app.post("/admin", function(req,res)
{
    var pass = "deep1234";
    var pass1= req.body.pass;
    if(pass.localeCompare(pass1) == 0)
    {
    res.redirect("/admin");
    }
    else{
        alert("somethings wrong");
    }
});



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
