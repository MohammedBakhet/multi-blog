import mongoose, { Schema, models } from "mongoose";

const CommentSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
}, { timestamps: true });

export default models.Comment || mongoose.model("Comment", CommentSchema); 