const mongoose=require("mongoose");
const bookingSchema= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
    },
    room:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"room",
        required:true,
    },
    pg:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"pg",
        required:true,
    },
    checkInDate:{
        type:Date,
        required:true,
    },
    message:{
        type:String,
        trim:true,
        default:"",
    },
    bookingStatus:{
        type:String,
        enum:["pending","approved","rejected","cancelled"],
        default:"pending",

    },
    actionBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        default:null,

    },
    actionDate:{
        type:Date,
        default:null,
    },
}, {timestamps:true},);

module.exports = mongoose.model("booking",bookingSchema);