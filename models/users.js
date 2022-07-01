var mongoose = require('mongoose')
const { Schema } = mongoose;
var bcrypt = require('bcrypt')
var userSchema = Schema({
    username:{type:String,required:[true,'username is required'],unique:[true,"username already exists"]},
    firstname:{type:String,required:[true,'first name is required']},
    lastname:{type:String},
    email:{type:String,unique:[true,"email already exists"] ,validate: {
        validator: function(v) {
          return /^[a-z0-9]+(?!.*(?:\+{2,}|\-{2,}|\.{2,}))(?:[\.+\-]{0,1}[a-z0-9])*@gmail\.com$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
      },},
    password:{type:String,required:[true,'password is must'] ,validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/.test(v);
      },
      message: props => `password must contain atleast 1 capital letter,1 number,1 special character, 1 small letter, minlength:8 !`
    },
    },
    gender:{type:String,default:"male"},
    age:{type:Number},
    trainers:[],
    role:{type:String,default:"user",immutable:true}
})

  userSchema.pre('save',  async function(next) {  
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await  bcrypt.hash(this.password, salt);
    next()
    }
);
exports.users = mongoose.model('users',userSchema)



