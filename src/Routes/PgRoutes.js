const router = require("express").Router();

const { addPg, getAllPgs, getPgDetails,updatePg,deletePg } = require("../Controllers/pgController");
const { authentication, authorization } = require("../Middlewares/auth");

router.post("/add", authentication, authorization("owner"), addPg);
router.get("/all-pgs", authentication, getAllPgs);
router.get("/pg-details/:id" , authentication,getPgDetails);
router.put("/update/:id",authentication,authorization("owner"),updatePg);
router.delete("/delete/:id",authentication,authorization("owner"),deletePg);

module.exports = router;