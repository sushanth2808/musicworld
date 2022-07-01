var express = require('express');
var router = express.Router();
const { register, home, loginpage, login,  logout, update, registerpage, deleteaccount } = require('../controller/userapicontroller');
const { authenticateToken } = require('../middleware/authenticate');
//const { blogs } = require('../models/blogs');
const { trainee } = require('../models/trainer');
const { users } = require('../models/users');


//login
router.post('/register',register)
router.get('/login',loginpage)
router.post('/login',login)
router.get('/logout',logout)
router.get('/register',registerpage)
//users
router.get('/update/:username',update)
router.get('/home',authenticateToken("user"),home)
router.get('/del/:username',deleteaccount)
router.post("/sumnumbers",async (req,res)=>{
    // var num1 = parseInt(req.query.num1)
    // var num2 = parseInt(req.query .num2)
    //var sum1 = num1+num2
    var sum1= parseInt(req.body.num1)+parseInt(req.body.num2)
    return res.json(sum1)
    
})
module.exports = router;

