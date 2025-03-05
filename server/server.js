const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User"); // User Model
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb+srv://mohammadmujahiddin01:TlFz6aeda2V1kJmL@cluster0.subrd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// Register API
app.post("/register", async (req, res) => {
 try {
   console.log("Received Register Request:", req.body); // 🔍 Debugging

   const { firstName, lastName, email, mobile, password } = req.body;

   if (!email || !password) {
     return res.status(400).json({ message: "Email and password are required" });
   }

   const existingUser = await User.findOne({ email });
   if (existingUser) {
     return res.status(400).json({ message: "User already exists" });
   }

   const hashedPassword = await bcrypt.hash(password, 10);
   const newUser = new User({ firstName, lastName, email, mobile, password: hashedPassword });

   await newUser.save();
   res.status(201).json({ message: "Registration successful!" });

 } catch (error) {
   console.error("Server Error:", error);
   res.status(500).json({ message: "Internal Server Error" });
 }
});


// Login API
// Login API
app.post("/api/login", async (req, res) => {
 try {
   const { identifier, password } = req.body;

   // Find user by either email or mobile
   const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });

   if (!user) {
     return res.status(400).json({ success: false, message: "User not found" });
   }

   // Compare hashed password
   const isMatch = await bcrypt.compare(password, user.password);
   if (!isMatch) {
     return res.status(400).json({ success: false, message: "Invalid Credentials" });
   }

   res.json({ success: true, message: "Login Successful!", user });

 } catch (error) {
   console.error("Server Error:", error);
   res.status(500).json({ success: false, message: "Internal Server Error" });
 }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
