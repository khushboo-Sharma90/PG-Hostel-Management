const RoomModel = require("../Models/roomModel");
const pgModel= require("../Models/pgModel");
const {isValid,isvalidObjectId,}=require("../utils/validator");
const { isValidObjectId } = require("mongoose");
const Room_Types =["single","double","triple","dormitory"];

//Add Room
const addRoom = async (req,res)=>{
    try {
        // let pgId = req.params.pgId;
        let data= req.body;
        if(!data || Object.keys(data).length===0){
            return res.status(400).json({msg:"Bad Request ! no data provided"});
        }
        let{pgId , roomNumber,roomType,rent,capacity}=data;
        // id validation
           if(isValid(pgId)){
            return res.status(400).json({msg:"Pg id is required"});
           }
        if(!isValidObjectId(pgId)){
            return res.status(400).json({msg:"Invalid Pg Id"});
        }
        if(!isValid(roomNumber)){
            return res.status(400).json({msg:"Room number is required"})
        }
        
        if(!Room_Types.includes(roomType)){
            return res.status(400).json({msg:"Room Type must be single,double,triple or dormitory"})
        }
        if(typeof rent != "number" || rent<=0){
            return res.status(400).json({msg:"Rent must be a number and greater than 0"});
        }

        if(!Number.isInteger(capacity)|| capacity <1 || capacity>20){
            return res.status(400).json({msg:"Capacity must be between 1 and 20"});
        }
        let pg= await pgModel.findById(pgId);
        if(!pg){
            return res.status(404).json({msg:"PG not found"});
        }
        //ownership
        if(pg.owner.toString()!==req.userId){
            return res.status(403).json({msg:"you can add romms only in your pg"})
        }
        let duplicateRoomNumber= await RoomModel.findOne({pg:pgId,roomNumber});
        if(duplicateRoomNumber){
            return res.status(400).json({msg:"Room Number Already Exists in this PG"});
        }
        const room = await RoomModel.create({
            pg:pgId,
            roomNumber,
            roomType,rent,capacity
        });
        return res.status(201).json({msg:"Room Added successfully"});

        
    } catch (error) {
        return res.status(500).json({msg:"Internal server error"});
        
    }
}
//update Room
const updateRoom = async (req,res)=>{
    try {
        let roomId = req.params.id;
        let data= req.body;
        if(!isValidObjectId(room)){
             return res.status(400).json({msg:"Invalid Room Id"});
        }
        if(!data || Object.keys(data).length===0){
            return res.status(400).json({msg:"Bad Requesst ! Enter data to update"});
        }
        let room = await RoomModel.findById(roomId).populate("pg","owner");
        if(!room){
            return res.status(403).json({msg:"Room not found"});
        }
        if(room.pg.owner.toString()!== req.userId){
            return res.status(403).json({msg:"You can update only your own rooms"})
        };
        let{roomType,rent,capacity,occupiedBeds,isAvailable,}= data;
        if(roomType!==undefined){
            if(!Room_Types.includes(roomType)){
                return res.status(400).json({msg:"Room Type must be single, double or dormitory"})
            }

        }
        if(rent !==undefined){
            if(typeof  rent!=="number" || rent <=0){
                return res.status(400).json({msg:"Rent must be a number and greater than 0"});
            }
        }

        if(capacity!==undefined){
            if(!Number .isInteger(occupiedBeds) || occupiedBeds<0){
                return res.status(400).json({msg:"Ocuppied beds must be 0 and more"})
            }
        }
         if(isAvailable!== undefined){
            if(typeof isAvailable!==boolean){
                return res.status(400).json({msg:"Occupied Beds cannot be more than capacity"});
            }
         }
         let updateRoom = await RoomModel.findByIdAndUpdate(roomId,data,{new:true,});
         return res.status(200).json({msg:"Room updated successfully",updateRoom});
        
    } catch (error) {
        console.log(erro);
        return res.status(500).json({msg:"Internal server error"});
        
    }
}

module.exports={addRoom,updateRoom}