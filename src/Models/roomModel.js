const mongoose=require("mongoose");
const roomSchema = new mongoose.Schema({
    pg:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"pg",
        required:true,

    },
   roomNumber: {
    type:String,
    required:true,
    trim:true,

    },
    roomType:{
        type:String,
        enum:["single","double","triple","dormitory"],
        required:true,
    },
    rent:{
        type:Number,
        required:true,
        min:1,
    },
    Capacity:{
        type:Number,
        required:true,
        min:1,
    
} ,
  OccupiedBeds:{
     type:Number,
     default:0,
     min:0,

  },
  roomStatus:{
    type:String,
    enum:["vacant","occupied"],
    default:"vacant",
  },
  isAvailable:{
    type:Boolean,
    default:true,
  },

},{timestaps:true},);

module.exports=mongoose.model("room",roomSchema);