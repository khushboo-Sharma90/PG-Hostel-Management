const express= require("express");
const router=express.Router();
const {signupUser,loginUser,getmyProfile,deleteMyProfile,updateProfile,getallUser,deleteUser}=require("../Controllers/userController");
const{authentication,authorization}=require("../Middlewares/auth");
router.post("/signup",signupUser);
router.post("/login", loginUser);
router.get("/profile",authentication,getmyProfile,);
router.delete("/delete",authentication,deleteMyProfile)
router.put("/update",authentication,updateProfile);
router.get("/getalluser",authentication,authorization("admin"),getallUser);
router.delete("/delete/:id",authentication,authorization("admin"),deleteUser)


module.exports=router;