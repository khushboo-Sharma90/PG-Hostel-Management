const dns=require("dns");
dns.setServers(["8.8.8.8"]);
const userRoute=require("./Routes/userRoute");
const pgRoute = require("./Routes/PgRoutes");
const roomRoute= require("./Routes/RoomRoutes");
const bookingRoute = require("./Routes/bookingRoutes");
const express=require("express");

require("dotenv").config();
const connectDB=require("./config/db");
const app= express();
// middleware
app.use(express.json());
app.use("/users",userRoute);
app.use("/pgs", pgRoute);
app.use("/room",roomRoute);
app.use("/booking" , bookingRoute);
app.get("/",(req,res)=>{
   return res.status(200).json({msg:"hello from PG and Hostel Management server."})

})
connectDB();
let Port=process.env.PORT;
app.listen(Port,(err)=>err ? console.log(err):console.log(`server is running at Port ${Port}`),);

