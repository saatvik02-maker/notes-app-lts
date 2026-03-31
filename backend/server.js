const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// DB
if (process.env.NODE_ENV !== "test") {
  const connectDB = async () => {
    try {
      await mongoose.connect("mongodb://mongo:27017/notes");
      console.log("MongoDB connected");
    } catch (err) {
      console.log("DB retry...");
      setTimeout(connectDB, 3000);
    }
  };

  connectDB();
}

// Models
const User = mongoose.model("User", {
  username: String,
  password: String,
});

const Note = mongoose.model("Note", {
  userId: String,
  text: String,
  done: Boolean,
});

// Signup
app.post("/signup", async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);
  await User.create({ username: req.body.username, password: hashed });
  res.json({ message: "Signup successful" });
});

// Login
app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.status(400).json({ message: "User not found" });

  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign({ id: user._id }, "secret");
  res.json({ message: "Login successful", token });
});

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, "secret");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Add note
app.post("/notes", auth, async (req, res) => {
  await Note.create({
    userId: req.user.id,
    text: req.body.text,
    done: false,
  });
  res.json({ message: "Note added" });
});

// Get notes
app.get("/notes", auth, async (req, res) => {
  const notes = await Note.find({ userId: req.user.id });
  res.json(notes);
});

// Mark done
app.put("/notes/:id", auth, async (req, res) => {
  const note = await Note.findById(req.params.id);
  await Note.findByIdAndUpdate(req.params.id, { done: !note.done });
  res.json({ message: "Marked done" });
});

app.listen(5000, () => console.log("Backend running"));

// Delete note
app.delete("/notes/:id", auth, async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});
