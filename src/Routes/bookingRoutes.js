const router = require("express").Router();
const { authentication, authorization } = require("../Middlewares/auth");
const {createBooking, getMyBookings, getOwnerRequests, approveBooking, rejectBooking,cancelBooking}=require("../Controllers/bookingController")
 
router.post("/creatBooking",authentication,authorization("user"), createBooking);
router.get("/myBooking",authentication,authorization("user"),getMyBookings);
router.patch("cancel/:id",authentication,authorization("owner"),cancelBooking);
router.get("/ownerRequest" , authentication,authorization("owner"),getOwnerRequests);
router.patch("/approve/:id",authentication,authorization("owner"),approveBooking);
router.patch("/rejectBooking/:id",authentication,authorization("owner"),rejectBooking);
module.exports=router;