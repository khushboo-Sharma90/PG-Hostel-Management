const mongoose=require("mongoose");
const userSchema= new mongoose.Schema({
    fullName:{
        type:String,
        required:true,
        trim:true,},
        email:{
            type:String,
            trim:true,
            unique:true,

        },
        password:{
            type:String,
            required:true,
            

        },
        phone:{
            type:String,
            required:true,
            trim:true,
            unique:true,
        },
        role:{
            type:String,
            enum:["user","owner","admin"],
            default:"user",
        }
},{timestamps:true},)
module.exports=mongoose.model("user",userSchema);