const bookingModel = require("../Models/bookingModel");
const BookingModel= require("../Models/bookingModel");
const RoomModel= reequire("../Models/roomModel");
const PgModel = require("../Models/pgModel");
const roomModel = require("../Models/roomModel");
const {isvalid,isValidObjectId, isValid} = require("../utils/validator");
//create Booking (user)
const createBooking = async (req,res)=>{
    try {
        let data = req.body;
        if(!data || Object.keys(data).length===0){
            return res.status(400).json({msg:"Bad Request ! No data Provided"});

        }
        let {roomId,checkInDate,message}=data;
        if(!isValid(roomId)){
            return res.status(400).json({msg:"Room Id is required"});
        }
        if(!isValidObjectId(roomId)){
            return res.status(400).json({msg:"Invalid Room Id"});
        }
        if(!isValid(checkInDate)){
            return res.status(400).json({msg:"check-in Date is required"});
        }
        let checkIn = new  Date (checkInDate);
        if(isNaN (checkIn.getTime())){
            return res.status(400).json({msg:"Invalid Check in Date"});
        }
        let today = new Date ();
        today.setHours(0,0,0,0);
        if(checkIn<today){
            return res.status(400).json({msg:"Check-in Date cannot be in the past"});
        }
        if(message!==undefined){
            if(message.trim().length<10 || message.trim().length>200){
                return res.status(400).json({msg:"message must between 10 to 200 characters"});  
            }
        }
        let room = await BookingModel.findById(roomId);
        if(!room){
            return res.status(404).json({msg:"Room not found"});
        }
        if(!room.isAvailable || room.roomStatus=="occupied"){
            return res.status(400).json({msg:"room is not available for booking...."});
        }
        let alreadyBooked = await BookingModel.findOne({user:req.userId, room:roomId, bookingStatus:{$in:["pending","approved"]}});

       if(alreadyBooked){
        return res.status(400).json({msg:"You are Already have an active request for this room"});
       }
       const booking = await BookingModel.create({user:req.userId,room:roomId,pg:room.pg,checkInDate:checkIn,message})
         return res.status(201).json({msg:"Booking request sent sucessfully " , booking});
    } catch (error) {
         console.log(error);
         return res.status(500).json({msg:"Internal server error"});
    }
}

//get my Bookings(user)
const getMyBookings = async (req,res)=>{
    try {
        let bookings = await BookingModel.find({user:req.userId}).populate("pg","name city address").populate("room" , "roomNumber roomType rent").sort({createdAt:-1});
        if(bookings.length===0){
            return res.status(404).json({msg:"No Bookings Found"});
        }
        return res.status(200).json({msg:"Bookings fetched successfully",totalBookings:bookings.length,bookings,});

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg:"Internal server error"});
        
    }
}

// get booking request of my pgs(owner)
const getOwnerRequests= async (req,res)=>{
    try {
        let filter={};
        if(req.query.status!==undefined){
            if(!["pending","approved","rejected","cancelled"].includes(
                req.query.status,)){
                    return res.status(400).json({msg:"Invalid status filter"});
                }
                filter.bookingStatus = req.query.status;
        }
        let mypgs = await PgModel.find({owner:req.userId}).select("_id");
        filter.pg= {$in: mypgs.map((pg)=>{
            pg._id
        })}
        let bookings = await BookingModel.find(filter).populate("user","fullname email phone").populate("pg","name city ").populate("romm","roomNumber roomType rent").sort({createdAt:-1});
        if(bookings.length===0){
            return res.status(404).json({msg:"No booking request found"});
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg:"Internal server error"});
        
    }
}

//Approve bookings
const approveBooking= async(req,res)=>{
    try {
        let bookingId = req.params.id;
        const isValidObjectId = (bookingId) => {
            return mongoose.Types.ObjectId.isValid(bookingId);
        };
        if(!isValidObjectId){
            return res.status(400).json({msg:"Invalid BookingId"});
        }
        let Booking = await BookingModel.findById(bookingId).populate("pg","owner");
        if(!Booking){
            return res.status(404).json({msg:"Booking not found"})
        } 
        if(Booking.pg.owner.toString()!==req.userId){
            return res.status(403).json({msg:"you can approve only your own pg bookings"});
        }
        if(Booking.bookingStatus!=="pending"){
            return res.status(400).json({msg:"Only pending request can be approved"});
        }
        let room = await roomModel.findById(Booking.room);
        if(!room){
            return res.status(404).json({msg:"Room not found"});
        }
        if(room.OccupiedBeds>=room.Capacity){
            return res.status(400).json({msg:"Room is already full"});
        }
        room.OccupiedBeds+=1;
        await room.save();
        Booking.bookingStatus="approved";
        Booking.actionBy=req.userId;
        Booking.actionDate=new Date();
        let updateBooking = await Booking.save();
        return res.status(200).json({msg:"Booking Approved Successfully"});

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg:"Internal Server error"});
        
    }
}

// reject bookings
const rejectBooking = async(req,res)=>{
    try {
        let bookingId= req.params.id;
        const isValidObjectId =(bookingId)=>{
            return Mongoose.Types.ObjectId.isValid(bookingId);
        }
        if(!isValidObjectId){
            return res.status(400).json({msg:"Invalid Booking Id"});
        }
        let booking = await bookingModel.findById(bookingId).populate("pg","owner");
        if(!booking){
            return res.status(404).json({msg:"booking not found"});
        }
        if(booking.pg.owner.toString!==req.userId){
            return res.status(403).json({msg:"you can reject only your pgs booking request"})
        };
        if(booking.bookingStatus!=="pending"){
            return res.status(400).json({msg:"only pending request can be rejected"});
        }
        booking.bookingStatus="rejected";
        booking.actionBy=req.userId;
        booking.actionDate= new Date();
        let updateBooking = await booking.save();
        return res.status(200).json({msg:"Booking rejected successfully"})

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg:"Internal Server Error"});
        
    }
}
// cancel Bookings
const cancelBooking = async (req,res)=>{
    try {
        let bookingId= req.params.id;
        if(!isValidObjectId){

            return res.status(400).json({msg:"Invalid booking id"});
        }
        let booking = await BookingModel.findById(bookingId);
        if(!booking){
            return res.status(404).json({msg:"Booking Not found"});
        }
        if(booking.user.toString()!== req.userId){

            return res.status(403).json({msg:"You can cancel only your own booking"})
        }
        if(booking.bookingStatus!=="pending" && booking.bookingStatus!=="approved"){
            return res.status(400).json({msg:"you can cancel only pending or approved bookings"})
        }
        if(booking.bookingStatus==="approved"){
            let room = await roomModel.findById(booking.room);
            if(!room){
                return res.status(404).json({msg:"room not found"});
            }
             room.OccupiedBeds=Math.max(0,room.OccupiedBeds-1);
            // let update = await booking.save();
            await room.save();

        }
        booking.bookingStatus=="cancelled";
        booking.actionBy=req.userId;
        booking.actionDate= new Date();
        return res.status(200).json({msg:"Booking cancelled successfully"});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg:"Internal server error"})
        
    }

}
module.exports={createBooking, getMyBookings, getOwnerRequests, approveBooking, rejectBooking,cancelBooking}

