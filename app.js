require('dotenv').config();
const alert = require('alert');
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const app=express();
const mongoose=require("mongoose");
const session = require('express-session');
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));
// const passport = require('passport');
// const passportLocalMongoose = require('passport-local-mongoose');
const md5 = require('md5');

function hello(){
  alert("Email Id already registered");
}
//const encrypt=require("mongoose-encryption");
app.use(express.static(__dirname+"/public"));
app.use(express.static(__dirname+"/views"));

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));



mongoose.connect('mongodb+srv://udaya:vudaikumar@udayadb.rfczy.mongodb.net/auth', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: String,
    posts: [String]
});
//userSchema.plugin(passportLocalMongoose);
//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']});

const User = mongoose.model("User", userSchema);



app.get("/",(req,res)=>{
  res.render("home");
});

app.get("/secrets",(req,res)=>{
  if(req.isAuthenticated()){
    res.render("secrets");
  }
  else {
    res.redirect("/login");
  }

});

app.get("/login",(req,res)=>{
  res.render("login",{Status: false});
});

app.get("/register",(req,res)=>{
  res.render("register");
});

app.post("/register",(req,res)=>{
  console.log(req.body.username);
  if(!req.body.username){

    res.redirect("/register");
  }
  else{
  User.findOne({email:req.body.username},(err,drill)=>{
    if(err){
      console.log(err);
    }
    else {
      console.log(drill);
      if(drill)
      {
        hello();
        res.redirect("/register");
      }
    }
  })
  const newUser=new User({
    email:req.body.username,
    password: md5(req.body.password),
    posts:[]
  });

  newUser.save(err=>{
    if(err)
    {
      console.log(err);
    }
    else{
      res.redirect("/login");
    }
  })
  }
  });
  //PassPORT SECURE
  // User.register({username:req.body.username},req.body.password,function(err,user){
  //   if(err){
  //     console.log(err);
  //     res.render("register");
  //   }
  //   else {
  //     passport.authenticate("local")(req,res,function(){
  //       res.redirect("/secrets");
  //     })
  //   }
  // })

  //NORMAL SECURE
  // const newUser=new User({
  //   email:req.body.username,
  //   password: md5(req.body.password)
  // });
  //
  // newUser.save(err=>{
  //   if(err)
  //   {
  //     console.log(err);
  //   }
  //   else{
  //     res.render("secrets");
  //   }
  // })



app.post("/login",(req,res)=>{


  const username=req.body.username;
  const password=md5(req.body.password);
  console.log(username);
  console.log(password);
  //console.log();
  if(!username){
    //console.log("invalid");
    res.redirect("/login");
  }
  else{
    //console.log("Still iam loading");
  User.countDocuments({email:username},(err,count)=>{
    if(err){
      res.redirect("/register");
    }
    else {
      console.log(count);
      if(count === 0){
        res.redirect("/register");
      }
      else{
        User.findOne({email:username},(err,foundUser)=>{
          if(err)
          {
            res.render("login",{Status: true});
          }
          else{
            if (foundUser.email===username && foundUser.password === password)
            {
                 req.session.user = username;
                 req.session.admin = true;
                res.render("secrets",{Name: username, Details: foundUser.posts});
            }
            else{
              res.render("login",{Status: true});

            }

          }
        })
      }
    }
  })

}
});
  //PASSPORT SECURE
  // const user=new User({
  //   username:req.body.username,
  //   password: req.body.password
  // });
  // req.login(user,function(err){
  //   if(err){
  //     console.log(err);
  //     console.log("err");
  //     res.render("login");
  //   }
  //   else {
  //     passport.authenticate("local")(req,res,function(err){
  //       if(err){
  //         res.render("login");
  //       console.log("err1");
  //     }
  //     else{
  //       res.redirect("/secrets");
  //       console.log("err2");
  //        }
  //     })
  //   }
  // })


  //NORMAL SECURE
  // const username=req.body.username;
  // const password=md5(req.body.password);
  // User.findOne({email:username},(err,foundUser)=>{
  //   if(err)
  //   {
  //     res.render("error");
  //   }
  //   else{
  //     if (foundUser)
  //     {
  //       if(foundUser.password === password){
  //         res.render("secrets");
  //       }
  //       else{
  //         console.log("error");
  //         res.render("error");
  //
  //       }
  //     }
  //     else{
  //       res.render("error");
  //
  //     }
  //
  //   }
  // })


app.post("/todo/:got",(req,res)=>{
   if(!req.session.admin){
     res.redirect("/login");
   }
   // console.log(req.params.got);
   // console.log(req.body.userName);
   const got=req.params.got;
   const merge=req.body.userName
  // console.log(typeof merge);
   if(!merge){
    //  console.log("lolol");
      User.findOne({email:got},(err,final)=>{
        if(err){
          console.log(err);
        }
        else {
          res.render("secrets",{ Details: final.posts, Name: got})
          //console.log(final.posts);
        }
      })
   }
   else{
   User.updateOne({email:got},{'$push': {posts: merge}},(err,found)=>{
     if(err){
       console.log(err);
     }
     else{
        User.findOne({email:got},(err,final)=>{
          if(err){
            console.log(err);
          }
          else {
            res.render("secrets",{ Details: final.posts, Name: got})
            //console.log(final.posts);
          }
        })
     }
   })
 }
})

app.post("/todod/:got",(req,res)=>{
   if(!req.session.admin){
     res.redirect("/login");
   }
   //console.log(req.params.got);
   const got=req.params.got;

   // if(merge == "" || merge == null){
   //    console.log("lolol");
   //     res.render("secrets",{ Details: final.posts, Name: got})
   // }
   User.updateMany({email:got},{'$set': {posts: []}},(err,found)=>{
     if(err){
       console.log(err);
     }
     else{
        User.findOne({email:got},(err,final)=>{
          if(err){
            console.log(err);
          }
          else {
            res.render("secrets",{ Details: final.posts, Name: got})
            //console.log(final.posts);
          }
        })
     }
   })
})



app.get("/logout",(req,res)=>{
  req.session.destroy();
  res.redirect("/");
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port,() =>
{
  console.log("The port is listening 4000");
})
