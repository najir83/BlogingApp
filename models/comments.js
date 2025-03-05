const { Schema, model } = require("mongoose");
const comentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "blog",
    },

    created_by: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const Comment = model("comment", comentSchema);
module.exports = Comment;
