import dotenv from "dotenv";
dotenv.config();
import express from "express";
import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import Post from "./models/Post";
import User from "./models/User";
import path from "path";

const app = express();

app.use(express.json());
console.log("Current directory:", __dirname);
console.log("Serving static files from:", path.join(__dirname, "..", "dist"));
app.use(express.static(path.join(__dirname, "..", "dist")));

app.get("/api/", (request, response) => {
  response.send("hola");
});

app.post("/api/auth/login", (request, response, next) => {
  const username = String(request.body?.username ?? "").trim();
  const password = String(request.body?.password ?? "");

  if (!username || !password) {
    response.status(400).json({ error: "username and password are required" });
    return;
  }

  User.findOne({ username: new RegExp(`^${username}$`, "i") })
    .then(async (user) => {
      if (!user) {
        response.status(404).json({ error: "account not found" });
        return;
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        response.status(401).json({ error: "invalid credentials" });
        return;
      }

      response.json({ username: user.username });
    })
    .catch((error) => next(error));
});

app.post("/api/auth/register", (request, response, next) => {
  const username = String(request.body?.username ?? "").trim();
  const email = String(request.body?.email ?? "").trim().toLowerCase();
  const password = String(request.body?.password ?? "");

  if (!username || !email || !password) {
    response.status(400).json({ error: "username, email and password are required" });
    return;
  }

  User.findOne({ $or: [{ username: new RegExp(`^${username}$`, "i") }, { email }] })
    .then(async (existing) => {
      if (existing) {
        response.status(409).json({ error: "account already exists" });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = new User({ username, email, passwordHash });
      const savedUser = await user.save();
      response.status(201).json({ username: savedUser.username });
    })
    .catch((error) => next(error));
});

app.get("/api/threads", (request, response) => {
  Post.find({thread: null}).then((posts) => {
    response.json(posts);
  });
});

app.post("/api/threads", (request, response, next) => {
  const body = request.body;
  if (!body.content) {
    response.status(400).json({
      error: "content missing",
    });
  } else {
    const post = {
      content: body.content,
      author: body.author || "Anonymous",
      thread: body.thread || null,
      parent: body.parent || null,
      createdAt: body.createdAt,
      updatedAt: body.updatedAt,
      likes: body.likes || 0,
      dislikes: body.dislikes || 0
    };

    const postDocument = new Post(post);
    postDocument
      .save()
      .then((savedPost) => {
        response.status(201).json(savedPost);
      })
      .catch((error) => next(error));
  }
});

app.get("/api/threads/:id", (request, response, next) => {
  const id = request.params.id;
  Post.findById(id)
    .then((thread) => {
      if (!thread) {
        response.status(404).end();
        return null;
      }

      return Post.find({ thread: id }).then((comments) => {
        response.json({ thread, comments });
      });
    })
    .catch((error) => {
      next(error);
    });
});

app.put("/api/threads/:id", (request, response, next) => {
  const { content, author } = request.body;

  Post.findById(request.params.id)
    .then((post) => {
      if (post) {
        post.content = content;
        post.author = author;
        post.updatedAt = new Date();

        post.save().then((updatedPost) => {
          response.json(updatedPost);
        });
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.post("/api/threads/:id/reactions", (request, response, next) => {
  const username = String(request.body?.username ?? "").trim().toLowerCase();
  const type = String(request.body?.type ?? "").trim();

  if (!username) {
    response.status(401).json({ error: "login required" });
    return;
  }

  if (type !== "like" && type !== "dislike") {
    response.status(400).json({ error: "invalid reaction type" });
    return;
  }

  User.findOne({ username: new RegExp(`^${username}$`, "i") })
    .then((user) => {
      if (!user) {
        response.status(401).json({ error: "account required" });
        return null;
      }

      return Post.findById(request.params.id).then((post) => {
        if (!post) {
          response.status(404).json({ error: "post not found" });
          return null;
        }

        type ReactionValue = "like" | "dislike";
        type ReactionItem = { username: string; value: ReactionValue };

        const reactions = post.reactions as ReactionItem[];
        const existingReactionIndex = reactions.findIndex(
          (reaction) => reaction.username === username
        );
        const existingReaction =
          existingReactionIndex >= 0 ? reactions[existingReactionIndex] : undefined;

        if (existingReaction?.value === type) {
          if (type === "like") {
            post.likes = Math.max(0, (post.likes ?? 0) - 1);
          } else {
            post.dislikes = Math.max(0, (post.dislikes ?? 0) - 1);
          }

          reactions.splice(existingReactionIndex, 1);
          post.updatedAt = new Date();

          return post.save().then((updatedPost) => {
            response.json(updatedPost);
            return null;
          });
        }

        if (existingReaction) {
          if (existingReaction.value === "like") {
            post.likes = Math.max(0, (post.likes ?? 0) - 1);
          } else {
            post.dislikes = Math.max(0, (post.dislikes ?? 0) - 1);
          }
          existingReaction.value = type;
        } else {
          reactions.push({ username, value: type as ReactionValue });
        }

        if (type === "like") {
          post.likes = (post.likes ?? 0) + 1;
        } else {
          post.dislikes = (post.dislikes ?? 0) + 1;
        }

        post.updatedAt = new Date();

        return post.save().then((updatedPost) => {
          response.json(updatedPost);
          return null;
        });
      });
    })
    .catch((error) => next(error));
});

// Endpoint para comentar un thread
app.post("/api/threads/:id", (request, response, next) => {
  const body = request.body;
  if (!body.content) {
    response.status(400).json({
      error: "content missing",
    });
  } else {
    const post = {
      content: body.content,
      author: body.author || "Anonymous",
      thread: request.params.id,
      parent: body.parent || null,
      createdAt: body.createdAt,
      updatedAt: body.updatedAt,
      likes: body.likes || 0,
      dislikes: body.dislikes || 0
    };

    const postDocument = new Post(post);
    postDocument
      .save()
      .then((savedPost) => {
        response.status(201).json(savedPost);
      })
      .catch((error) => next(error));
  }
});

app.get('{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, "..", 'dist', 'index.html'));
});

const requestLogger = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

app.use(requestLogger);

const errorHandler = (
  error: { name: string; message: string },
  request: Request,
  response: Response,
  next: NextFunction
) => {
  console.error(error.message);

  console.error(error.name);
  if (error.name === "CastError") {
    response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    response.status(400).json({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);

const unknownEndpoint = (request: Request, response: Response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);


const PORT = process.env.PORT;
const HOST = process.env.HOST || "localhost";

app.listen(Number(PORT), HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});