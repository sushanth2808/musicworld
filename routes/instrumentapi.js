var express = require('express');
const { getFileStream, uploadFile,delObject } = require('../middleware/s3');
const multer = require('multer');

const { instruments } = require('../models/instruments');
const upload = multer({ dest: 'uploads/' })
const { authenticateToken } = require('../middleware/authenticate');
const { users } = require('../models/users');
var router = express.Router();
router.use(authenticateToken("user"))

router.get('/uploadform',(req,res)=>{
    res.render("fileuploadform")
})
router.post('/uploadfile', upload.single('avatar'), async function (req, res, next) {
    const file = req.file
    const result = await uploadFile(file)
    const des = req.body
    const uploadfile = await new instruments({instrument_id:result.Key,instrument_name:des.instrument_name,price:des.price,discount:des.discount,years_old:des.old,features:des.features,tag:des.tag})
    //console.log(uploadfile)
    const userdetails = await users.findOne({username:req.user.name},{email:1})
    //console.log(userdetails)
    uploadfile.owner_details.email = userdetails.email
    uploadfile.owner_details.name = req.user.name
    await uploadfile.save()
    req.flash("upload", "successfully uploaded")
    req.flash("sell","sell other instruments")
    res.redirect("/instruments/uploadform")
    
    })

router.get('/listfiles/:tag', async (req,res) =>{
    var all_details = await instruments.find({tag:req.params.tag})
    //console.log(all_details)
    res.render('files',{all_details})
    })

router.get('/listallfiles', async (req,res) =>{
    var all_details = await instruments.find({})
    res.render('files',{all_details:all_details,user:req.user.name})
    })
router.get('/list',async(req,res)=>{
    var details = await instruments.find({})
    res.send(details)
})

router.get('/myfiles/:id', async (req,res) =>{
    const id = req.params.id
    //console.log(id)
    //var file = await instruments.findOne({instrument_id:id},{__v:0,_id:0,instrument_id:0})
    //var disprice = await file.discountprice
    //file.priceafterdiscount = disprice
    var file = await instruments.aggregate([{$match:{instrument_id:id}},{$addFields:{priceafterdiscount:{$subtract:["$price",{$divide:[{$multiply:["$discount","$price"]},100]}]}}},{$project:{__v:0,_id:0,instrument_id:0}}])
    //console.log(file)
     
    const img= await getFileStream(id)
    const encoded = encode(img.Body)
    res.send({file:file,img:encoded})
    })

function encode(data){
    let buf = Buffer.from(data);
    let base64 = buf.toString('base64');
    return base64
}   

router.get('/myuploads/:name',async(req,res,next)=>{
    var uploads = await instruments.find({"owner_details.name":req.params.name},'instrument_name price instrument_id')
    res.send(uploads)
})

router.get('/delobject/:key', async (req,res,next) =>{
try{   
    await delObject(req.params.key)
    await instruments.deleteOne({instrument_id:req.params.key})
    res.send("object deleted")
}
    catch(err){next(err)}
})

router.get('/newpage',async (req,res,next)=>{
    var output = await instruments.aggregate([{$group:{_id:"$tag",count:{$sum:1},average_price:{$avg:"$price"},max_price:{$max:"$price"},min_price:{$min:"$price"},avg_discount:{$avg:"$discount"},names: { $push:  { item: "$instrument_name", price: "$price" } }}},{$sort:{count:-1}}])
    res.send(output)
})

module.exports = router