import express from "express";
import User from '../Schema/UserSchema.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Authenticate from '../Middleware/Authenticate.js';

const router = express.Router();

// =================================get all users==============================================================
router.get('/' , async(req, res)=>{
    const users = await User.find();
    try{
        res.json({UserList: users});
    }
    catch(err){
        res.send(err);
    }
})

// ========================delete all users==============================================================
router.delete('/deleteAll', async(req, res)=>{
    try{
        await User.deleteMany();
        res.json({msg: "All users deleted."});
    }
    catch(err){
        res.send(err);
    }
})

// ====================================== signup ==============================================================
router.post('/signup', async (req, res) => {
    const { username, email, mobilenum, password, confirmPassword } = req.body;

    if (!username || !email || !mobilenum || !password || !confirmPassword)  return res.status(400).json({ msg: "All fields are required." });
    
    const existingUser = await User.findOne({ email });
    if (existingUser)  return res.status(400).json({ msg: "User with this email already exists." });
    
    const existingNum = await User.findOne({ mobileNo: mobilenum });
    if (existingNum) return res.status(400).json({ msg: "User with this number already exists." });
    
    const existingUserName = await User.findOne({ name: username });
    if (existingUserName) return res.status(400).json({ msg: "User with this name already exists." });

    try {
        const hashPass = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: username,
            email,
            mobileNo: mobilenum,
            password: hashPass,
        });
        const payload = { id: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5h" });

        const isProd = process.env.NODE_ENV === "production";
            res.cookie("token", token, {
                maxAge:5 * 60 * 60 * 1000,
                httpOnly: true,
                secure: isProd,
                sameSite: isProd ? "none" : "lax",
            });
        
        // res.cookie('token', token, {
        //     httpOnly: true,
        //     maxAge: 5 * 60 * 60 * 1000,
        //     sameSite: 'None',
        //     secure: true,
        //     domain: '.onrender.com',
        //     path: '/',
        // });
        return res.status(200).json({ msg: "User registered and logged in!", user });
    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).json({ msg: "Server error during signup." });
    }
});


// ======================================login===============================================================
router.post('/login', async (req, res)=>{
    const { email, password } =   req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({msg:"User does not exists."});
    }

    const payload = { id: existingUser.id }

    bcrypt.compare(password, existingUser.password, (err, isMatch) => { 
        if (err) {
            console.error('Error comparing passwords:', err); 
            return res.status(500).json({ msg: "An error occurred while checking the password." });
          }
        if (isMatch){
            
            const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn:"5h"});

            const isProd = process.env.NODE_ENV === "production";
            res.cookie("token", token, {
                maxAge:5 * 60 * 60 * 1000,
                httpOnly: true,
                secure: isProd,
                sameSite: isProd ? "none" : "lax",
            });

            // store token in cokkie
            // res.cookie('Token', token, {
            //     httpOnly: true, 
            //     maxAge:5 * 60 * 60 * 1000,
            //     // domain: '.onrender.com',
            //     // path: '/',
            //     // sameSite: 'None', 
            //     // secure: true,
            //     sameSite: 'Lax',
            //     secure: false,
            //   });
           
            return res.status(200).json({msg: "You are logged in!" ,existingUser});
        } 
        else {
            // Password mismatch
            return res.status(400).json({ msg: "Incorrect password." });
          }
    });
})

// ================================logout===============================================================
router.post('/logout', (req, res) => {
    res.clearCookie('Token', {
        httpOnly: true, 
        secure: true,
        sameSite: 'None'
    });
    return res.status(200).json({ msg: "Logged out successfully." });
});

// ===============================delete account=============================================================
router.delete('/deleteAccount', Authenticate, async (req, res) => {
    const {username, email, mobilenum} =   req.body;
    try {
         const user = await User.findOne({
           name: username,
           email,
           mobileNo: mobilenum
         });


         if (!user) {
           return res.status(404).json({ msg: "Details do not match any account." });
         }

         await User.deleteOne({ _id: user._id });

        return res.status(200).json({ msg: "Account deleted successfully." });
    } catch (error) {
        console.error("Error deleting account:", error);
        return res.status(500).json({ msg: "Server error while deleting account." });
    }       
});

// ==============================update account details=============================================================
router.put('/updateAccount', Authenticate, async (req, res) => {
    const { username, email, mobilenum} = req.body;   
    const id = req.user.id;
    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ msg: "Details do not match any account." });
        }

        user.name = username;
        user.email = email;
        user.mobileNo = mobilenum;
        await user.save();

        return res.status(200).json({ msg: "Account details updated successfully.", user }); 
    } catch (error) {   
        console.error("Error updating account details:", error);
        return res.status(500).json({ msg: "Server error while updating account details." });
    }   
});



export default router;
