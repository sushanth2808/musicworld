var mongoose = require("mongoose")
 
var instrumentSchema = new mongoose.Schema({
    instrument_id:{type:String,required:true},
    instrument_name: {type:String,required:true},
    price: {type:Number,required:true},
    discount:{type:Number,default:0},
    features:{type:String},
    tag:{type:String},
    priceafterdiscount:{type:Number},
    years_old:{type:Number,default:0},
    owner_details:{
      email:String,
      name:String
    }
})
instrumentSchema.virtual('discountprice').get(function(){
    return this.price-(this.discount*this.price)/100
})


instrumentSchema.pre('save', function(next) {
    console.log(this.features)
    next()
  });
  instrumentSchema.post('save', function(doc,next) {
    console.log(doc.features)
    console.log("uploaded")
    next()
  });


exports.instruments = mongoose.model('instruments',instrumentSchema)
