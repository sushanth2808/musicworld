const { users } = require("../models/users")
const asyncHandler = require('express-async-handler')
const jwt  = require("jsonwebtoken")
var bcrypt = require('bcrypt')
const { trainer } = require("../models/trainer")
require('dotenv').config()
const jwt_key = process.env.jwt_key


exports.registerpage = async (req,res,next)=>{
  res.render("register")
}

exports.register = async (req,res,next)=>{
  try{
    console.log(req.body)
    var {username,firstname,email,password,age,gender,role} = {...req.body}
    if(role === "user"){ 
    var user = await new users({username:username,firstname:firstname,email:email,password:password,age:age,gender:gender,role:role})
    await user.save()
    }
    else if(role==="trainer")
    {
      var newtrainer = new trainer({trainer_username:username,trainer_name:firstname,trainer_email:email,password:password,trainer_age:age,gender:gender})
      await newtrainer.save()
    }
    else
    {
      req.flash("role","choose your role")
      return res.redirect("/users/register")
    }
    req.flash("success","successfully registered")
    res.redirect("/users/login")
}
    //catch(error){next(error.message)}
    catch(err){     
    let message = 'something went wrong';
    if (err.code === 11000) message = handleDuplicateField(err);
    if (err.name === 'ValidationError') message = handleValidationError(err);
    req.flash("errors",message)
    return res.redirect("/users/register")
}
}

exports.loginpage= asyncHandler(async (req,res,next)=>{
    res.render("login")
})


exports.login = asyncHandler(async (req,res,next)=>{
  //console.log(req.session)
  const username = req.body.username
  finduser = await users.findOne({username:username})
  if(finduser){
  const validPassword = await bcrypt.compare(req.body.password, finduser.password);
  if (validPassword) {
      const user = {name:username,role:"user"}
      const accessToken = await jwt.sign(user,jwt_key)
      res.cookie('accessToken', 'Bearer ' + accessToken, {
      expires: new Date(Date.now() + 8*3600000)
    })
    //return res.send("hello")
    //return res.redirect("/users/register")
      return res.redirect("/users/home")
    } else {
      req.flash("password","Invalid password")
      return res.redirect("/users/login")
    }
  } else {
    req.flash("username","User does not exist")
    return res.redirect("/users/login")
  } 
})

  
const handleValidationError = (err) => {
  let message;
  const key = Object.keys(err.errors);
  if (err.errors[key[0]] && err.errors[key[0]].properties) {
    message = err.errors[key[0]].properties.message;
  }
  return message;
}

const handleDuplicateField = (err) => {
  let message;
  const keys = Object.keys(err.keyValue);
  if (keys.includes('email')) message = 'email already exists';
  if (keys.includes('username')) message = 'username already exists';
  return message;
}

exports.home = asyncHandler(async (req,res,next)=>{
  //console.log(req.session)
  var user = await users.findOne({username:req.user.name})
  res.render("home",{user})
})

exports.update = async (req,res,next)=>{
  const filter = { username: req.params.username};
  //let user = await users.findOneAndUpdate(filter, update,{returnOriginal:false});
  let user = await users.findOne(filter,{password:0,__v:0,_id:0,username:0})
  //console.log(user)
  res.render("update",{user})
}
exports.deleteaccount = async (req,res)=>{
  await users.findOneAndDelete({username:req.params.username})
  await trainee.deleteMany({trainee_username:req.params.username})
  req.flash("delete","account deleted")
  res.redirect("/users/login")
}


exports.logout = asyncHandler(async (req ,res ,next)=>
{
  res.clearCookie('accessToken')
  res.render("login")
})