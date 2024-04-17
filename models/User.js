import mongoose from "mongoose";

const User = mongoose.model("User", {
  name: String,
  email: String,
  passwd: String,
});

export default User;
