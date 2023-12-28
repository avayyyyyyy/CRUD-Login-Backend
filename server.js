const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const User = require("./Models/userModel");
const SECRET_KEY = "secretKey";
const jwt = require("jsonwebtoken");

// Connecting to DB

const URI = "mongodb+srv://Admin:admin@cluster0.itvhwu4.mongodb.net/MERN-Login";

mongoose.connect(URI).then(() => {
  console.log("Connected To DB");
});
// Middleware

app.use(express.json());
app.use(cors());

// Routes

app.get("/", async (req, res) => {
  try {
    let allUser = await User.find();
    res.json(allUser);
  } catch (err) {
    res.json({ err: "Internal server error!" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    console.log(email, username, password);
    let hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    let inserted = new User({
      email,
      username,
      password: hashedPassword,
    });
    await inserted.save();
    console.log(inserted);
    res.json({ msg: "User inserted Successfully!" });
  } catch (err) {
    res.json({ msg: "Internal Server Error!" });
  }
});
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      // Return a generic message to avoid exposing user existence
      return res.status(401).send("Invalid Credentials!");
    }

    const isPasswordVerified = await bcrypt.compare(password, user.password);

    if (!isPasswordVerified) {
      // Return a generic message to avoid exposing user existence
      return res.status(401).json({ msg: "Invalid Credentials!" });
    }

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: "1hr",
    });

    res.status(201).json({ msg: "Login Successful" });
  } catch (err) {
    return res.status(401).json({ msg: "Invalid Credentials!" });
  }
});

app.listen(3000, () => {
  console.log(`server started on port http://localhost:3000`);
});
