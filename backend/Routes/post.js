// function from controllers are used for request at routes

const express=require('express');
const { createPost, LikeandUnlikePost, deletePost, getPostOfFollowing, updatePost, commentOnPost, deleteCommentOnPost, getMyPost } = require('../controllers/post');
const { getUserPost } = require('../controllers/user');
const { isAuthenticated } = require('../middlewares/auth');
const router=express.Router();

router.route("/post/upload").post(isAuthenticated,createPost); 
// these routes use in app.js also 
router.route("/post/:id").get(isAuthenticated,LikeandUnlikePost);
router.route("/post/:id").delete(isAuthenticated,deletePost);
router.route("/posts").get(isAuthenticated,getPostOfFollowing);
router.route("/post/:id").put(isAuthenticated,updatePost)
router.route("/post/comment/:id").put(isAuthenticated,commentOnPost);
router.route("/post/comment/:id").delete(isAuthenticated,deleteCommentOnPost);
router.route("/my/posts").get(isAuthenticated,getMyPost);
router.route("/userposts/:id").get(isAuthenticated,getUserPost);
module.exports=router; 
