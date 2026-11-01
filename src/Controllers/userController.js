const UserModel = require("../Models/userModel");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");
const {
    isValid, isValidObjectId, isValidFullName, isValidEmail, isValidPassword, isValidPhone } = require("../utils/validator");
// const userModel = require("../Models/userModel");
//signup
const signupUser = async (req, res) => {
    try {
        let userData = req.body;
        if (!userData || Object.keys(userData).length == 0) {
            return res.status(400).json({ msg: "bad request or no data provided" });
        }
        let { fullName, email, password, phone, role } = userData;
        //full validation
        if (!isValid(fullName)) { 
            return res.status(400).json({ msg: "fullName is Required" });
        }
        if (fullName.trim().length < 2 || !isValidFullName(fullName)) {
            return res.status(400).json({ msg: "Invalid FullName" });
        }
        //email validation
        if (!isValid(email)) {
            return res.status(400).json({ msg: "email is required" })
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ msg: "Invalid email" });
        }
        let duplicateEmail = await UserModel.findOne({ email });
        if (duplicateEmail) {
            return res.status(400).json({ msg: "Email already Exists" });
        }
        // password validation
        if (!isValid(password)) {
            return res.status(400).json({ msg: "password is required" });
        }
        if (!isValidPassword(password)) {
            return res.status(400).json({ msg: "Invalid Password" });
        }
        //phone number validation
        if (!isValid(phone)) {
            return res.status(400).json({ msg: "Phone number is required" });
        }
        if (!isValidPhone(phone)) {
            return res.status(400).json({ msg: "Invalid phone number" });

        }
        let duplicatePhone = await UserModel.findOne({ phone });
        if (duplicatePhone) {
            return res.status(400).json({ msg: "Phone number Already Exists" });
        }
        //role validation
        if (role !== undefined) {
            if (!["user", "owner"].includes(role)) {
                return res.status(400).json({ msg: "Role must be user or owner" });
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        userData.password = hashedPassword;
        const user = await UserModel.create(userData);
        return res.status(201).json({ msg: "Registration complete successfully", user });





    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "internal server error " });


    }

}
//login
const loginUser = async (req, res) => {
    try {
        let data = req.body;
        if (!data || Object.keys(data).length == 0) {
            return res.status(400).json({ msg: "bad request or no data provided" });
        }
        let { email, password } = data;
        if (!isValid(email)) {
            return res.status(400).json({ msg: "email is required" })
        }
        if (!isValid(password)) {
            return res.status(400).json({ msg: "password is required" });
        }
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: "user not found" });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ msg: "Incorrect Password" });
        }
        const token = jwt.sign({ userId: user._id, role: user.role },
            process.env.JWT_SECRET_KEY, { expiresIn: "1d" },);
        return res.status(200).json({ msg: "Login successful...", token })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal Server Error" });

    }
}


//get my profile
const getmyProfile = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId).select("-password");
        if (!user) {
            return res.status(400).json({ msg: "User not found" });
        }
        return res.status(200).json({ msg: "Profile fetched successfully ",user });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Internal Server Error" });
    }

}

const deleteMyProfile = async (req, res) => {
  try {
    let deleteUser = await UserModel.findByIdAndDelete(req.userId);

    if (!deleteUser) {
      return res
        .status(404)
        .json({ msg: "User Not Found or already deleted." });
    }

    return res.status(200).json({ msg: "Profile Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
}

const updateProfile = async(req,res)=>{
    try {
        let userId=req.userId;
        let userData = req.body;
        if (!userData || Object.keys(userData).length == 0) {
            return res.status(400).json({ msg: "bad request ! enter data to update" });}
            let { fullName, email, password, phone, role } = userData;

         if(fullName!=="undefine"){
             if (!isValid(fullName)) {
            return res.status(400).json({ msg: "fullName is Required" });
        }
        if (fullName.trim().length < 2 || !isValidFullName(fullName)) {
            return res.status(400).json({ msg: "Invalid FullName" });
        }
         } 
         if(email !=="undefine"){

            if (!isValid(email)) {
            return res.status(400).json({ msg: "email is required" })
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ msg: "Invalid email" });
        }

         }  

         let duplicateEmail = await UserModel.findOne({
                 email,
                 _id: { $ne: userId },
               });
               if (duplicateEmail) {
                 return res.status(400).json({ msg: "Email Already Exists" });
               }
             if (password !== undefined) {
      if (!isValid(password)) {
        return res.status(400).json({ msg: "Password is Required" });
      }

      if (!isValidPassword(password)) {
        return res.status(400).json({ msg: "Invalid Password" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      userData.password = hashedPassword;
    } 
    if (phone !== undefined) {
          if (!isValid(phone)) {
            return res.status(400).json({ msg: "Phone Number is Required" });
          }
    
          if (!isValidPhone(phone)) {
            return res.status(400).json({ msg: "Invalid Phone Number" });
          }}
          let duplicatePhone = await UserModel.findOne({
                  phone,
                  _id: { $ne: userId },
                });
                if (duplicatePhone) {
                  return res.status(400).json({ msg: "Phone Number Already Exists" });
                }
              
          
              if (role !== undefined) {
                if (!["user", "owner"].includes(role)) {
                  return res.status(400).json({ msg: "Role must be user or owner" });
                }
              }
          
              let updatedUser = await UserModel.findByIdAndUpdate(userId, userData, {
                new: true,
              });
          
              if (!updatedUser) {
                return res.status(404).json({ msg: "User Not Found" });
              }
          
              return res
                .status(200)
                .json({ msg: "Profile Updated Successfully", updatedUser })


        
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg:"Internal server error"})
        
    }

}

const getallUser = async(req,res)=>{
    try {
        let filter={};
        if(req.query.role !==undefined){
            if(!["user","admin","owner"].includes(req.query.role)){
                return res.status(400).json({msg:"Invalid Role filter"})
            }
            filter.role=req.query.role;

        }
        let users= await userModel.find(filter).select("-password").sort({createdAt:-1});
        if(users.length==0){
            return res.status(404).json({msg:"user not found"});

        }
        return res.status(200).json({msg:"user fetched successfully", totalusers:users.length,users})

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg:"Internal server error"});
        
    }
}
//delete any user(admin)
const deleteUser = async(req,res)=>{
    try {
        let userId=req.params.id;
        if(!isValidObjectId(userId)){
            return res.status(400).json({msg:"Invalid User Id"});
        }
        let user=await UserModel.findById(userId);
        if(!user){
            return res.status(403).json({msg:"Admin Account cannot be deleted...."})
        }
        await userModel.findByIdAndDelete(userId);
        return res.status(200).json({msg:"profile deleted successfully"})
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg:"Internal server error"})
        
    }
}
module.exports = { signupUser, loginUser, getmyProfile,deleteMyProfile ,updateProfile,getallUser,deleteUser};

