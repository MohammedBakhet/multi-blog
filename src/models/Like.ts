import mongoose, { Schema, models } from "mongoose";

const LikeSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default models.Like || mongoose.model("Like", LikeSchema); 