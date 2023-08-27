const express=require("express");
const app=express();
const cookieParser=require("cookie-parser");
app.use(express.json());
if(process.env.NODE_ENV!=="PRODUCTION"){
    require("dotenv").config({path:"backend/config/config.env"});
}
// using middlewares

app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({limit:'50mb',extended:true}));
app.use(cookieParser()); 
// importing Routes
const post=require("./Routes/post");
const user=require("./Routes/user");
app.use("/api/v1",post);
app.use("/api/v1",user);

// api/v1 is kind of like a prefix for all routes




module.exports=app;