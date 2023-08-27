
const crypto=require("crypto");
const User=require("../models/User");
const Post=require("../models/Post");
const cloudinary=require("cloudinary");
const {sendEmail}=require("../middlewares/sendEmail")
exports.register=async(req,res)=>{

try{
const {name,email,password,avatar}=req.body;
let user=await User.findOne({email});
if(user){
return res.status(400).json({success:false,message:"User already exists"})
 }
 const myCloud = await cloudinary.v2.uploader.upload(avatar,{
    folder: "avatars",
  });
user=await User.create({name,email,password,avatar:{public_id:myCloud.public_id,url:
myCloud.secure_url},
// baki chije


});
const token=user.generateToken();
const options={expires:new Date(Date.now()+90*24*60*60*1000),
httpOnly:true,
    }
// ms me he expires
res.status(201).cookie("token",token,options
).json({success:true,
    user,
token,
message:"User created successfully",})

}
catch(error){
res.status(500).json({success:false,
message:error.message,})}



}
// async await 
exports.login=async (req,res)=>{
try{
const {email,password}=req.body;
const user=await User.findOne({email}).select("+password").populate("posts followers following");
if(!user){res.status(400).json({
success:false,
message:"User not found"})}
const isMatch=await user.comparePassword(password);
if(!isMatch){res.status(400).json({
success:false,
message:"Incorrect password"})}
const token=user.generateToken();
const options={expires:new Date(Date.now()+90*24*60*60*1000),
    httpOnly:true,
    }
// ms me he expires
res.status(200).cookie("token",token,options
).json({success:true,user,
token,})
// token generation
}

catch(error){
res.status(500).json({success:false,message:error.message});
}
}
exports.logout=async (req,res)=>{ 
try{res.status(200).cookie("token",null,{expires:new Date(Date.now()),httpOnly:true}).json({success:true,message:"Logged out successfully"})}
catch(error){
res.status(500).json({success:false,message:error.message});    
}


} 









exports.followUser=async (req,res)=>{
try{
const userToFollow=await User.findById(req.params.id);
const loggedInUser=await User.findById(req.user._id);

if(!userToFollow){

    return res.status(404).json({success:false,message:"User not found"})
    }
    if(loggedInUser.following.includes(userToFollow._id)){
loggedInUser.following.pull(userToFollow._id);
userToFollow.followers.pull(loggedInUser._id);
await loggedInUser.save();
await userToFollow.save();
res.status(200).json({success:true,message:"User Unfollowed successfully"})}
else{loggedInUser.following.push(userToFollow._id);
    userToFollow.followers.push(loggedInUser._id);
    await loggedInUser.save();
    await userToFollow.save();
    res.status(200).json({success:true,message:"User followed successfully"})}

}
catch(error){
res.status(500).json({success:false,message:error.message});
// internal server error


}}

exports.updatePassword=async (req,res)=>{ 

try{
const user=await User.findById(req.user._id).select("+password");
// since login vale he access krega
// 404 is not found 401 unauthorized 200 success 201 sucesss created 400 BAD REQUEST
// 501 not implemented
const {oldPassword,newPassword}=req.body;
if(!oldPassword||!newPassword){
   return res.status(400).json({success:false,message:"Please enter all fields"});
}
const isMatch=await user.comparePassword(oldPassword);
if(!isMatch){
return res.status(400).json({success:false,message:"Incorrect password"});}

user.password=newPassword;
await user.save();
return res.status(200).json({success:true,message:"Password updated successfully"});






}













catch(error){
res.status(500).json({success:false,message:error.message});
// 500 internal server error
}}


exports.updateProfile=async (req,res)=>{  

   try{ 
const user=await User.findById(req.user._id).select("-password");
const {name,email,avatar}=req.body;
if(avatar){



     await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    const myCloud = await cloudinary.v2.uploader.upload(avatar,{
        folder: "avatars",
      });
user.avatar.public_id=myCloud.public_id;
user.avatar.url=myCloud.secure_url;



}

await user.save();


if(!name||!email){
    res.status(400).json({success:false,message:"Please enter all fields"});
}
if(name){user.name=name;}
if(email){user.email=email;}
await user.save();

// avatar 
res.status(200).json({success:true,message:"Profile updated successfully"});

}
catch(error){
res.status(500).json({success:false,message:error.message});
}
}
exports.deleteProfile=async(req,res)=>{
try{
const user=await User.findById(req.user._id);
const posts=user.posts;
// deleting post of user
for(let i=0;i<posts.length;i++){
const post=await Post.findById(posts[i]);
await cloudinary.v2.uploader.destroy(post.image.public_id);
await post.deleteOne();
}
// remove user id from following and followers
const followers=user.followers;
for(let i=0;i<followers.length;i++){
const follower=await User.findById(followers[i]);
follower.following.pull(user._id);
await follower.save();
}
// followers valo me se remove
const following=user.following;
for(let i=0;i<following.length;i++){ 
const followingUser=await User.findById(following[i]);
followingUser.followers.pull(user._id);
followingUser.save();}



await cloudinary.v2.uploader.destroy(user.avatar.public_id);



await user.deleteOne();

// logout also as server will get crashed else
res.cookie("token",null,{expires:new Date(Date.now()),httpOnly:true});






res.status(200).json({success:true,message:"User deleted successfully"});
}









catch(error){res.status(500).json({success:false,message:error.message});
}}



exports.myProfile=async (req,res)=>{
   try{ 
const user=await User.findById(req.user._id).populate("posts followers following");

res.status(200).json({success:true,user});}
catch(error){
res.status(500).json({
success:false,
message:error.message
})



}
}
exports.getUserProfile=async (req,res)=>{
try{
const user=await User.findById(req.params.id).populate("posts followers following");
if(!user){
res.status(404).json({success:false,message:"User not found"});}
res.status(200).json({success:true,user});










}

catch(error){
res.status(500).json({
success:false,
message:error.message,

})

}






}
exports.getAllUsers=async (req,res)=>{  
try{
const users=await User.find({name:{$regex:req.query.name,$options:'i'}});
res.status(200).json({success:true,users});}
catch(error){res.status(500).json({
success:false,
message:error.message,})}
}
exports.forgotPassword=async(req,res,next)=>{

try{
const user= await User.findOne({email:req.body.email});
if(!user){res.status(404).json({success:false,message:"User not found"});}
const resetPasswordToken=user.getResetPasswordToken();
await user.save();
const resetUrl=`${req.protocol}://${req.get("host")}/password/reset/${resetPasswordToken}`;
const message=`Reset your password by clicking on the link below:\n\n'${resetUrl}`;

// sending mail
try{
await sendEmail({
email:user.email,
subject:"Password reset link", 
message})
return res.status(200).json({success:true,message:`Email sent to ${user.email} successfully`});
}
catch(error){
    user.resetPasswordToken=undefined;
user.resetPasswordExpire=undefined;
await user.save();
return res.status(500).json({success:false,message:error.message});}}
catch(error){
return res.status(500).json({
success:false,
message:error.message})}}


exports.resetPassword=async (req,res,next)=>{
try{
const resetPasswordToken=crypto.createHash("sha256").update(req.params.token).digest("hex");
const user=await User.findOne({resetPasswordToken,resetPasswordExpire:{$gt:Date.now()}});
if(!user){
return res.status(401).json({success:false,message:"Invalid token or Expired"});}
user.password=req.body.password;
user.resetPasswordExpire=undefined;
user.resetPasswordToken=undefined;
await user.save();
return res.status(200).json({success:true,message:"Password reset successfully"});
}

catch(error){
return res.status(500).json({
success:false,
message:error.message,})}}

exports.getUserPost=async(req,res)=>{
    try{
        const user=await User.findById(req.params.id);
        const posts=[];
        for(let i=0;i<user.posts.length;i++){
        const post=await Post.findById(user.posts[i]).populate("owner likes comments.user");
        posts.push(post);
        
        
        }
        
        
        res.status(200).json(
        {success:true,
        posts
        }
        
        )
        }
        
        
        catch(error){
        
        res.status(500).json({
        success:false,
        error:error.message,
        
        
        })
        
        
        }
        








}








  





