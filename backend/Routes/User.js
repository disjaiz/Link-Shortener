import express from "express";
import User from '../Schema/UserSchema.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// const authenticate = require("../middlewares/Authentication.js");
// const Link = require('../Schema/LinkSchema.js');

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

    if (!username || !email || !mobilenum || !password || !confirmPassword) {
        return res.status(400).json({ msg: "All fields are required." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ msg: "User with this email already exists." });
    }
    const existingNum = await User.findOne({ mobileNo: mobilenum });
    if (existingNum) {
        return res.status(400).json({ msg: "User with this number already exists." });
    }  
    const existingUserName = await User.findOne({ name: username });
    if (existingUserName) {
        return res.status(400).json({ msg: "User with this name already exists." });
    }

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
        // console.log('token of signin', token);
        res.cookie('Token', token, {
            httpOnly: true,
            maxAge: 5 * 60 * 60 * 1000,
            sameSite: 'None',
            secure: true,
        });
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

    // compare password
    bcrypt.compare(password, existingUser.password, (err, isMatch) => { 
        if (err) {
            console.error('Error comparing passwords:', err); 
            return res.status(500).json({ msg: "An error occurred while checking the password." });
          }
        if (isMatch){
            // create token
            const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn:"5h"});
            // store token in cokkie
            res.cookie('Token', token, {
                httpOnly: false, 
                maxAge:5 * 60 * 60 * 1000,
                sameSite: 'None', 
                secure: true,
              });
          
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

export default router;