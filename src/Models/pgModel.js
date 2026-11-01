const mongoose = require("mongoose");
const pgSchema = new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
        
    },
    name:{
      type:String,
      required:true,
      trim:true,
    },
    description:{
        type:String,
        trim:true,
        default:"",
    },
    address:{
        type:String,
        required:true,
        trim:true,
    },
    pgType:{
        type:String,
        required:true,
        trim:true,
    },
    city:{
        type:String,
        required:true,
        trim:true,
    },
    isActive:{
        type:Boolean,
        dafault:true,
    },

    
}, {timestamps:true},);

module.exports= mongoose.model("pg",pgSchema);