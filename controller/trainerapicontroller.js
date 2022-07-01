const { users } = require("../models/users")
const asyncHandler = require('express-async-handler')
const { trainer, trainee} = require("../models/trainer")
const bcrypt = require("bcrypt")
const jwt  = require("jsonwebtoken")
require('dotenv').config()
const jwt_key = process.env.jwt_key


exports.filters = async (req,res)=>{
  //console.log(req.body.min_expereince)
  var min_experience =parseInt(req.body.min_expereince)
  var min_age = parseInt(req.body.min_age)
  var max_age = parseInt(req.body.max_age)
  //console.log(req.body)
   if(req.body.instruments=="all")
   var results = await trainer.aggregate([{$match:{experience:{$gte:min_experience},trainer_age:{$gte:min_age,$lte:max_age}}},{$project:{trainer_username:1, instrument:1, trainer_age:1, experience:1}}]).exec()
   else{
  var results = await trainer.aggregate([{$match:{experience:{$gte:min_experience},trainer_age:{$gte:min_age,$lte:max_age},instrument:req.body.instruments}},{$project:{trainer_username:1, instrument:1, trainer_age:1, experience:1}}]).exec()}
  res.send(results)
}

exports.trainer_data = async (req,res)=>
{
  res.render("trainer_page")
}
exports.trainer_update = async (req,res)=>
{
  var user= await trainer.aggregate([{$match:{trainer_username:req.user.name}},{$project:{password:0,__v:0,_id:0,meetings:0,posts:0}}]).exec()
  res.render("trainer_update",{user})
}
exports.trainer_updating = async (req,res)=>
{
  //console.log(req.body)
  var {trainer_name,trainer_email,trainer_age,experience,instrument} = {...req.body}
  var user = await trainer.findOneAndUpdate({trainer_username:req.user.name},{trainer_name,trainer_email,trainer_age,experience,instrument})
  req.flash("up","updated successfully")
  return res.redirect("/trainer/trainer_update")
}
exports.trainer_meetings = async (req,res)=>
{
  res.render('trainer_meetings')
}
exports.meetings = async  (req,res)=>
{
  var user = await trainer.findOneAndUpdate({trainer_username:req.user.name},{$push:{meetings:req.body.link}})
  req.flash("linker","link created")
  res.redirect("/trainer/trainer_meetings")
}
exports.posts = async (req,res)=>
{
  await trainer.findOneAndUpdate({trainer_username:req.user.name},{$push:{posts:{title:req.body.title,post:req.body.post}}})
  req.flash("success","post created")
  res.redirect("/trainer/trainer_meetings")
}

exports.fetch_trainer = async (req,res)=>
{
  res.render("trainer_details")
}
exports.trainer_list = async (req,res)=>
{
  if(req.params.val=="all")
  var details = await trainer.find({},'trainer_username instrument trainer_age experience gender')
  else
  var details = await trainer.find({instrument:req.params.val},'trainer_username instrument trainer_age experience gender')
  res.send(details)
}

exports.view_trainer = async (req,res)=>
{

   var user = await trainee.findOne({trainer_username:req.params.username,trainee_username:req.user.name})
   var details= await trainer.findOne({trainer_username:req.params.username},{meetings:1,_id:0,posts:1})
  

  if(user && user.status=="accepted")
  {
    //console.log(details)
   res.render("meetings",{details})
  }
  else{
    var details= await trainer.findOne({trainer_username:req.params.username})
    res.render("all_details",{trainers:details,user:req.user.name})
  }
}
exports.trainee_application= async (req,res)=>
{
  var user = await trainee.findOne({trainer_username:req.body.trainer,trainee_username:req.body.trainee})
  if(user)
  {
    if(user.status=="pending")
    req.flash("pending","application pending")
    else if(user.status=="rejected")
    req.flash("rejected","already applied and rejected")
    else
    {
      res.send("something went wrong in application form")
    }
  }
  else{
  var application = await new trainee({trainer_username:req.body.trainer,trainee_username:req.body.trainee})
  await application.save()
  req.flash("success","successfully applied")
  }
  res.redirect(`/trainer/view_trainer/${req.body.trainer}`)
}
exports.applications = async (req,res)=>{
const trainees = await trainee.find({trainer_username:req.user.name,status:"pending"},{_id:0})
req.trainer = req.params.username
res.render("approve_reject",{trainees})
}
exports.accept = async (req,res)=>{
  console.log(req.params.username.split(","))
  var usernames = req.params.username.split(",")
  await trainee.findOneAndUpdate({trainer_username:usernames[1],trainee_username:usernames[0]},{status:"accepted"})
  const val=await users.findOneAndUpdate({username:usernames[0]},{$push:{trainers:usernames[1]}})
  // await trainer.findOneAndUpdate({trainer_username:usernames[1]},{$push:{subscribers:usernames[0]}})
  res.redirect("/trainer/applications")

}
exports.reject = async (req,res)=>{
  var usernames = req.params.username.split(",")
  await trainee.findOneAndUpdate({trainer_username:usernames[1],trainee_username:usernames[0]},{status:"rejected"})
  res.redirect("/trainer/applications")
}

exports.loginpage= asyncHandler(async (req,res,next)=>{
  res.render("trainer_login")
})

exports.login = asyncHandler(async (req,res,next)=>{
const username = req.body.username
newtrainer = await trainer.findOne({trainer_username:username})
console.log(newtrainer)
if(newtrainer){
const validPassword = await bcrypt.compare(req.body.password, newtrainer.password);
if (validPassword) {
    const user = {name:username,role:"trainer"}
    const accessToken = await jwt.sign(user,jwt_key)
    //console.log(accessToken)
    //res.locals.trainer_name = username
    res.cookie('accessToken', 'Bearer ' + accessToken, {
    expires: new Date(Date.now() + 8*3600000)
  })
    return res.redirect("/trainer/trainer_data")
  } else {
    req.flash("password","invalid password")
    return res.redirect("/trainer/login")
    //return res.status(400).json({ error: "Invalid Password" });
  }
} else {
  req.flash("user","user does not exists")
    return res.redirect("/trainer/login")
  //return res.status(401).json({ error: "User does not exist" });
} 
})

exports.logout = asyncHandler(async (req ,res ,next)=>
{
  res.clearCookie('accessToken')
  res.render("trainer_login")
})

exports.subscribers = async (req,res)=>{
  res.render("subscribers",{username:req.user.name})

}
exports.newpage = async (req,res,next)=>{
  var lookupdata = await trainer.aggregate([{$match:{trainer_username:req.params.username}},
    {
      $lookup:
        {
          from:"users",
          as:"subscribers",
          pipeline:[{$match:{$expr:{$in:[req.params.username,"$trainers"]}}},{$project:{username:1,email:1,firstname:1,age:1,gender:1,_id:0}}]
      } 
      },{$project:{subscribers:1,_id:0}}])
   res.send(lookupdata)

}