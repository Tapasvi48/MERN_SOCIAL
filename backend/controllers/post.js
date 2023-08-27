// functions are made here 

const cloudinary=require("cloudinary");
const Post=require('../models/Post');
const User=require('../models/User');



exports.createPost = async (req, res) => {
  try {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "posts",
    });
    const newPostData = {
      caption: req.body.caption,
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
      owner: req.user._id,
    };

    const post = await Post.create(newPostData);

    const user = await User.findById(req.user._id);

    user.posts.unshift(post._id);

    await user.save();
    res.status(201).json({
      success: true,
      message: "Post created",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.LikeandUnlikePost=async(req,res)=>{
try{
const post=await Post.findById(req.params.id);
if(!post){
return res.status(404).json({
success:false,
message:"Post not found",})
 }
//  pull and push method

if(post.likes.includes(req.user._id)){
await post.likes.pull(req.user._id);
await post.save();
return res.status(200).json({
success:true,
message:"Post Unliked",})

}
else{
post.likes.push(req.user._id);
await post.save();
return res.status(200).json({
success:true,
message:"Post Liked",})}}
catch(error){ 
res.status(500).json({
success:false,
message:error.message,})}}



exports.deletePost=async(req,res)=>{
try{
const post=await Post.findById(req.params.id);
// 404 Not found
if(!post){
res.status(404).json({
success:false,
message:"Post not found",   
})}
else{

if(post.owner.toString()!==req.user._id.toString()){
return res.status(401).json({
success:false,
message:"Unauthorized user",
})
}
await cloudinary.v2.uploader.destroy(post.image.public_id);
const user=await User.findById(req.user._id);
user.posts.pull(req.params.id);
await user.save();
await post.deleteOne();

return res.status(200).json({
        success:true,
        message:"Post Deleted",})
    }




}


catch(error){  
 return res.status(500).json({
    success:false,
    message:error.message,
})
// 500 internal server error
}}
exports.getPostOfFollowing=async(req,res)=>{

try{
    const user = await User.findById(req.user._id);
    const posts = await Post.find({
        owner: {
          $in: user.following,
        },
      }).populate("owner likes comments.user");

// populated the user post with user id in following section of current logged in user
// or can do like 
// const post=await Post.find({owner:user.following}
// following:user.following
// $in use are array of owner:{
    // $in:user.following,
// }

res.status(200).json({
success:true,
posts: posts.reverse(),
})
  





}
catch(error){

    res.status(500).json({
success:false,
message:error.message,
})}}


exports.updatePost=async(req,res)=>{
const post=await Post.findById(req.params.id);
try{
if(!post){
return res.status(404).json({
success:false,
message:"Post not found",})
}
if(post.owner.toString()!==req.user._id.toString()){
 return res.status(401).json({
success:false,
message:"Unauthorized user",})
}
 
if(!req.body.caption){
 return res.status(400).json({
success:false,
message:"Caption is required",})
}
post.caption=req.body.caption;   

await post.save();
res.status(200).json({
success:true,
message:"Post Updated",

})






}
    

catch(error){
    res.status(500).json({
        success:false,
        message:error.message,
    })
}}


exports.commentOnPost = async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }
  
      let commentIndex = -1;
  
      // Checking if comment already exists
  
      post.comments.forEach((item, index) => {
        if (item.user.toString()===req.user._id.toString()) {
          commentIndex = index;
        }
      });
  
      if (commentIndex !== -1) {
        post.comments[commentIndex].comment = req.body.comment;
  
        await post.save();
  
        return res.status(200).json({
          success: true,
          message: "Comment Updated",
        });
      } else {
        post.comments.push({
          user: req.user._id,
          comment: req.body.comment,
        });
  
        await post.save();
        return res.status(200).json({
          success: true,
          message: "Comment added",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  
exports.deleteCommentOnPost=async(req,res)=>{
try{
const post= await Post.findById(req.params.id);
if(!post){
return res.status(404).json({ 
success:false,
message:"Post not found",})}
if(post.owner.toString()===req.user._id.toString()){
// 400 kuch empty bheja bad request
if(req.body.commentId==undefined){
return res.status(400).json({
success:false,
message:"Comment Id is required",
})}    
let check=true;
post.comments.forEach((item,ind)=>{
if(item._id.toString()===req.body.commentId.toString()){
check=false;
    return post.comments.splice(ind,1);}
})
if(check){
res.status(404).json({
success:true,
message:"Comment not found"})}

await post.save();
return res.status(200).json({
success:true,
message:"Selected Comment Deleted",})    
}
else{
post.comments.forEach((item,ind)=>{
if(item.user.toString()===req.user._id.toString()){
return post.comments.splice(ind,1);

}

}
)
await post.save();
return res.status(200).json({
success:true,
message:" Your Comment Deleted",})

}
}
catch(error){
return res.status(500).json({
success:false,
message:error.message,



})






}









}
exports.getMyPost=async(req,res)=>{
  
try{
const user=await User.findById(req.user._id);
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
