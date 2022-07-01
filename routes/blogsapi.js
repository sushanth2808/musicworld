var axios = require("axios")
var express = require("express")
const { authenticateToken } = require("../middleware/authenticate")
var router = express.Router()

router.get('/',authenticateToken("user"),(req,res)=>
{
    user=req.user.name
    res.render("blogs",{user})
})

router.post('/writeblog',async (req,res)=>
{ 
    const options = {
        method: 'POST',
        data:req.body,
        url: `http://localhost:5000/blogs/writeblog`,
        headers: {'Authorization': `${req.cookies.accessToken}`}
      };
try{
    var blogs = await axios.request(options)
    req.flash("post","successfully posted") 
    res.redirect("/blogs")
}
catch(err)
{
  next(err)
}
})

router.get('/myblogs/:name',async (req,res,next)=>
{
    const options = {
        method: 'GET',
        data:req.body,
        url: `http://localhost:5000/blogs/myblogs/${req.params.name}`,
        headers: {'Authorization': ` ${req.cookies.accessToken}`}

      };
      try{
    var blogs = await axios.request(options)
    res.send(blogs.data)
      }
      catch(err)
      {
          //console.log(err.message)
        next(err)
      }
})
router.get('/delblog/:id',async (req,res)=>
{
    const options = {
        method: 'GET',
        url: `http://localhost:5000/blogs/delblog/${req.params.id}`,
        headers: {'Authorization': ` ${req.cookies.accessToken}`}

      };
      try{
    var blogs = await axios.request(options)
    res.send(blogs.data)
      }
    catch(err)
    {
        next(err)
    }
})
router.get('/editblog/:id',async (req,res)=>
{
    console.log(req.params.id)
    const options = {
        method: 'GET',
        url: `http://localhost:5000/blogs/editblog/${req.params.id}`,
        headers: {'Authorization': ` ${req.cookies.accessToken}`}
      };
      try{
    var blogs = await axios.request(options)
    res.send(blogs.data)
      }
      catch(err){
          next(err)
      }
})
router.post('/updateblog/:id',async (req,res)=>
{
    // console.log(req.body)
    const options = {
        method: 'POST',
        data:req.body,
        url: `http://localhost:5000/blogs/updateblog/${req.params.id}`,
        headers: {'Authorization': ` ${req.cookies.accessToken}`}

      };
      try{
    var blogs = await axios.request(options)
    res.status(200).send(blogs.data)
      }
      catch(err){
          next(err)
      }
})

router.get('/pagination/:page/:limit', async (req, res,next) => {
    const options = {
        method: 'GET',
        url: `http://localhost:5000/blogs/pagination/${req.params.page}/${req.params.limit}`,
        headers: {'Authorization': ` ${req.cookies.accessToken}`}
      };
      try{
      var blogs = await axios.request(options)
      res.send(blogs.data)
      }
      catch(err)
      {
          next(err)
      }
  })

  router.post('/allblogs',async (req,res,next)=>
{
    const options = {
        method: 'POST',
        url: "http://localhost:5000/blogs/allblogs",
        data:{text:req.body.text},
        headers: {'Authorization': ` ${req.cookies.accessToken}`}
      };
      try{
    var blogs = await axios.request(options)
    res.send(blogs.data)
      }
      catch(err)
      {
          next(err)
      }
})

module.exports = router