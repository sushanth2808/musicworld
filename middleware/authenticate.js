const jwt  = require("jsonwebtoken")
require('dotenv').config()
const jwt_key = process.env.jwt_key
function Token(role){ return (req,res,next)=>{
  //console.log(req.cookies)
  const authHeader = req.cookies.accessToken
  //const token = authHeader && authHeader.split(' ')[1]
  const token = authHeader.split(' ')[1]
  if(token==null)
  //return res.sendStatus(401)
  res.redirect("/users/login")
  jwt.verify(token,jwt_key,(err,val)=>{
    if(err) 
    return res.sendStatus(403)
    req.user=val
   // console.log(val)
    if(role==req.user.role)
    return next()
    res.redirect("/users/login")
  })
}}

  exports.authenticateToken = Token;