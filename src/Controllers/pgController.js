const PgModel= require("../Models/pgModel");
const RoomModel=require("../Models/roomModel");
const BookingModel=require("../Models/bookingModel");
const {isValid,isValidObjectId}=require("../utils/validator");
// add pg(owner)
const addPg = async(req,res)=>{
    try{
        let data=req.body;
        if(!data || Object.keys(data).length===0){
            return res.status(400).json({msg:"Bad request !no data Provided"});
        }
        let {name,description,address, city,pgType}=data;
        if(!isValid(name)){
            return res.status(400).json({msg:"PG Name is Required"});

        }
        if(description !==undefined){
            if(description.trim().length<10 || description.trim().length>200){
                return res.status(200).json({msg:"description must be between 10 to 200 characters"})
            }
        }
        if(!isValid(address)){
            return res.status(400).json({msg:"Address is Required"});

        }
         if(!isValid(city)){
            return res.status(400).json({msg:"City Name is Required"});

        }
        if(!["boys","girls"].includes(pgType)){
            return res.status(400).json({msg:"PG Type must be boys and girls"});
        }

        data.owner = req.userId;
        const pg= await PgModel.create(data);
        return res.status(201).json({msg:"PG Added successfully"});
    
        
    }
        catch(error){
            console.log(error);
            return res.status(500).json({msg:"Internal server error"});


        }

    }

const getAllPgs = async (req, res) => {
  try {
    let filter = { isActive: true };

    if (req.query.city !== undefined) {
      filter.city = { $regex: `^${req.query.city.trim()}$`, $options: "i" };
    }

    if (req.query.pgType !== undefined) {
      if (!["boys", "girls"].includes(req.query.pgType)) {
        return res.status(400).json({ msg: "Invalid PG Type" });
      }
      filter.pgType = req.query.pgType;
    }

    let pgs = await PgModel.find(filter)
      .populate("owner", "fullName email phone")
      .sort({ createdAt: -1 });

    if (pgs.length === 0) {
      return res.status(404).json({ msg: "No PGs Found" });
    }

    return res
      .status(200)
      .json({ msg: "Pgs Fetched Successfully", totalPGs: pgs.length, pgs });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Get PG Details
const getPgDetails = async (req, res) => {
  try {
    let pgId = req.params.id;

    if (!isValidObjectId(pgId)) {
      return res.status(400).json({ msg: "Invalid PG Id" });
    }

    let pg = await PgModel.findById(pgId).populate(
      "owner",
      "fullName email phone",
    );

    if (!pg) {
      return res.status(404).json({ msg: "PG Not found" });
    }

    let rooms = await RoomModel.find({ pg: pgId }).sort({ roomNumber: 1 });

    return res.status(200).json({
      msg: "PG Details Fetched Successfully",
      pg,
      totalRooms: rooms.length,
      rooms,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};



// Update PG (Owner of that PG only)
const updatePg = async (req, res) => {
  try {
    let pgId = req.params.id;
    if (!isValidObjectId(pgId)) {
      return res.status(400).json({ msg: "Invalid PG Id" });
    }

    let data = req.body;
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ msg: "Bad Request! Enter Data to Update" });
    }

    let pg = await PgModel.findById(pgId);
    if (!pg) {
      return res.status(404).json({ msg: "PG Not found" });
    }

    // Ownership check
    if (pg.owner.toString() !== req.userId) {
      return res.status(403).json({ msg: "You can update only your own pg." });
    }

    let { name, description, address, city, pgType, isActive } = data;

    if (name !== undefined) {
      if (!isValid(name)) {
        return res.status(400).json({ msg: "PG Name is Required" });
      }
    }

    if (description !== undefined) {
      if (description.trim().length < 10 || description.trim().length > 200) {
        return res
          .status(400)
          .json({ msg: "Description Must be between 10 to 200 Characters." });
      }
    }

    if (address !== undefined) {
      if (!isValid(address)) {
        return res.status(400).json({ msg: "Address is Required" });
      }
    }

    if (city !== undefined) {
      if (!isValid(city)) {
        return res.status(400).json({ msg: "City Name is Required" });
      }
    }

    if (pgType !== undefined) {
      if (!["boys", "girls"].includes(pgType)) {
        return res.status(400).json({ msg: "PG Type must be boys and girls." });
      }
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ msg: "isActive must be true or false" });
      }
    }

    let updatedPg = await PgModel.findByIdAndUpdate(pgId, data, { new: true });

    return res.status(200).json({ msg: "Pg updated successfully", updatedPg });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Delete PG (Owner of that PG only)
const deletePg = async (req, res) => {
  try {
    let pgId = req.params.id;
    if (!isValidObjectId(pgId)) {
      return res.status(400).json({ msg: "Invalid PG Id" });
    }

    let pg = await PgModel.findById(pgId);
    if (!pg) {
      return res.status(404).json({ msg: "PG Not found" });
    }

    // Ownership check
    if (pg.owner.toString() !== req.userId) {
      return res.status(403).json({ msg: "You can delete only your own pg." });
    }

    let occupiedRoom = await RoomModel.findOne({
      pg: pgId,
      occupiedBeds: { $gt: 0 },
    });

    if (occupiedRoom) {
      return res
        .status(400)
        .json({ msg: "PG Cannot be Deleted! Some Rooms Are Occupied" });
    }

    await BookingModel.updateMany(
      { pg: pgId, bookingStatus: "pending" },
      {
        bookingStatus: "cancelled",
        actionBy: req.userId,
        actionDate: new Date(),
      },
    );

    await RoomModel.deleteMany({ pg: pgId });
    await PgModel.findByIdAndDelete(pgId);

    return res.status(200).json({ msg: "PG Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = { addPg, getAllPgs, getPgDetails,updatePg,deletePg };


