const router = require("express").Router();
const{addRoom,updateRoom}= require("../Controllers/roomController");
const {authentication,authorization}= require("../Middlewares/auth");
router.post("/add-Room/:pgId",authentication,authorization("owner"),addRoom);
router.put("/update-Room/:pgId" , authentication,authorization("owner"),updateRoom);
module.exports=router;