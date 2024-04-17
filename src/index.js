import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Welcome!" });
});

const checkToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Access denied." });
  }

  try {
    const secret = process.env.SECRET; // Strong hash
    jwt.verify(token, secret);
    next();
  } catch (err) {
    res.status(400).json({ msg: "Invalid token." });
  }
};

app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  const user = await User.findById(id).select("-passwd");

  if (!user) {
    return res.status(404).json({ msg: "User not found." });
  }

  res.status(200).json({ user });
});

app.post("/auth/register", async (req, res) => {
  const { name, email, passwd } = req.body;

  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return res.status(422).json({ msg: "Please use another email." });
  }

  const salt = await bcrypt.genSalt(12);
  const passwdHash = await bcrypt.hash(passwd, salt);

  const user = new User({
    name,
    email,
    passwd: passwdHash,
  });

  try {
    await user.save();
    res.status(201).json({ msg: "User created successfully" });
  } catch (err) {
    console.log(err);

    res
      .status(500)
      .json({ msg: "A server error occurred, please try again later." });
  }
});

app.post("/auth/login", async (req, res) => {
  const { name, email, passwd } = req.body;

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ msg: "User not found." });
  }

  const checkPasswd = await bcrypt.compare(passwd, user.passwd);

  if (!checkPasswd) {
    return res.status(422).json({ msg: "Invalid password." });
  }

  try {
    const secret = process.env.SECRET; // Strong hash

    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    res.status(200).json({ msg: "Authentication success", token });
  } catch (err) {
    console.log(err);

    res
      .status(500)
      .json({ msg: "A server error occurred, please try again later." });
  }
});

const dbUser = process.env.DB_USER;
const dbPasswd = process.env.DB_PASS;

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPasswd}@cluster0.8oc5x28.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Listen... :${PORT}`);
    });
  })
  .catch((err) => console.log(err));
