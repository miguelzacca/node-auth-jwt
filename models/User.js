import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    maxlength: 150,
  },
  passwd: {
    type: String,
    required: true,
    maxlength: 16,
    minlength: 6
  },
});

const User = mongoose.model("User", userSchema);

export default User;
