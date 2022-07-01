var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

var trainerSchema = new mongoose.Schema({
  trainer_username:{type:String,required:true},
    trainer_name:{type:String,required:true},
    trainer_email:{type:String},
    password:{type:String},
    trainer_age:{type:Number,default:22},
    experience:{type:Number,default:0},
    instrument:{type:String,default:null},
    gender:{type:String},
    meetings:[],
    posts:[],
    role:{type:String,default:"trainer",immutable:true}
})

var traineeapplicationSchema = new mongoose.Schema({
  trainer_username:{type:String},
  trainee_username:{type:String},
  status:{type:String,default:"pending"}
})

trainerSchema.pre('save',  async function(next) {  
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await  bcrypt.hash(this.password, salt);
  next()
  }
)

exports.trainee = mongoose.model('trainee',traineeapplicationSchema)
exports.trainer = mongoose.model('trainer',trainerSchema)

