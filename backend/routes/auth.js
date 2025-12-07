const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "NAKASHI_SECRET";

// Signup
router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.json({ success: false, msg: "Email already registered" });

    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPass });
    await newUser.save();

    res.json({ success: true, msg: "Signup successful" });
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, msg: "Incorrect password" });

    const token = jwt.sign({ id: user._id }, SECRET);

    res.json({ success: true, token });
});

module.exports = router;
