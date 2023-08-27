const app=require('./app');
const {connectDatabase}=require('./config/database');
const cloudinary=require("cloudinary");
const port=process.env.PORT;
connectDatabase();
cloudinary.config({
cloud_name:"dtef5nxa3",
api_key:"541153986816228",
api_secret:"RO-K74Z2AzVYgfELUcUylNnj8_s",
})

app.listen(port,()=>{
console.log(`server started on ${port}`);})