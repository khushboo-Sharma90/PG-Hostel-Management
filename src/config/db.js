const mongoose=require("mongoose");
const connectDB = async(req,res)=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("mongodb connected...");
        
    } catch (error) {
        console.log("MongoDB connection Failed.....",error);
    
        
    }

}
module.exports=connectDB;