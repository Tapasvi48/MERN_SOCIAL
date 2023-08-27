const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const crypto=require('crypto');
const userSchema=new mongoose.Schema({
name:{
    type:String,
    required:[true,'please enter your name'],
    // agr required true hai toh agr us name nhi krenge toh error aayega


},
avatar:{
public_id:{
    type:String,},
url:{type:String,}
},
email:{
    type:String,
    required:[true,'please enter your email'],
    unique:[true,'email already exists'],


},
password:{
    type:String,
    required:[true,'please enter your password'],
    // restriction
    minlength:[6,'password must be atleast 6 characters'],
    select:false,
    // baki sare fields ayge password ko chodke 
},
posts:[
{type:mongoose.Schema.Types.ObjectId,
ref:'Post'}
],
followers:[
{type:mongoose.Schema.Types.ObjectId,
    ref:'User',}
],
following:[
{type:mongoose.Schema.Types.ObjectId,
ref:'User',
}],
resetPasswordToken:String,
resetPasswordExpire:Date,





})
userSchema.pre('save',async function(next){
// only jab password change hoga toh password hash karega
if(this.isModified('password')){this.password=await bcrypt.hash(this.password,10);}    
next();
// next is used to tell that the function is completed callback function







})
userSchema.methods.generateToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
  };

userSchema.methods.comparePassword=async function(enteredPassword){
return await bcrypt.compare(enteredPassword,this.password);}

userSchema.methods.getResetPasswordToken=function(){
    const resetToken=crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire=Date.now()+15*60*1000;
    return resetToken;
    
    
    }

module.exports=mongoose.model('User',userSchema)

