import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

const url = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

mongoose.set("strictQuery", false);
if (url) {
  mongoose.connect(url, { dbName }).catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });
}

const forbiddenNames = [
  "Huevito rey",
  "Mat�as Toro",
  "Memes es mal ramo"
];

const reactionSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    value: {
      type: String,
      required: true,
      enum: ["like", "dislike"],
    },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    minLength: 1,
    maxLength: 300,
    required: true,
  },

  author: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => !forbiddenNames.includes(value),
      message: "Author name is forbidden",
    },
  },

  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    default: null
  },

  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  likes: {
    type: Number,
    default: 0
  },

  dislikes: {
    type: Number,
    default: 0
  },

  reactions: {
    type: [reactionSchema],
    default: []
  }
});

const Post = mongoose.model("Post", postSchema);

postSchema.set("toJSON", {
  transform: (
    document,
    returnedObject: { id?: string; _id?: mongoose.Types.ObjectId; __v?: number }
  ) => {
    returnedObject.id = returnedObject._id?.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export default Post;