import dotenv from "dotenv";
dotenv.config();
import express from "express";
import type { NextFunction, Request, Response } from "express";
import Post from "./models/Post";
import path from "path";

const app = express();

type Account = {
  username: string;
  email: string;
  password: string;
};

const accounts: Account[] = [
  { username: "paloma", email: "paloma@forochan.local", password: "paloma123" },
  { username: "admin", email: "admin@forochan.local", password: "admin123" },
  { username: "forochan", email: "forochan@forochan.local", password: "foro1234" },
];

app.use(express.json());
console.log("Current directory:", __dirname);
console.log("Serving static files from:", path.join(__dirname, "..", "dist"));
app.use(express.static(path.join(__dirname, "..", "dist")));

app.get("/api/", (request, response) => {
  response.send("hola");
});

app.post("/api/auth/login", (request, response) => {
  const username = String(request.body?.username ?? "").trim();
  const password = String(request.body?.password ?? "");

  if (!username || !password) {
    response.status(400).json({ error: "username and password are required" });
    return;
  }

  const account = accounts.find(
    (item) => item.username.toLowerCase() === username.toLowerCase()
  );

  if (!account) {
    response.status(404).json({ error: "account not found" });
    return;
  }

  if (account.password !== password) {
    response.status(401).json({ error: "invalid credentials" });
    return;
  }

  response.json({ username: account.username });
});

app.post("/api/auth/register", (request, response) => {
  const username = String(request.body?.username ?? "").trim();
  const email = String(request.body?.email ?? "").trim().toLowerCase();
  const password = String(request.body?.password ?? "");

  if (!username || !email || !password) {
    response.status(400).json({ error: "username, email and password are required" });
    return;
  }

  const hasUsername = accounts.some(
    (item) => item.username.toLowerCase() === username.toLowerCase()
  );
  const hasEmail = accounts.some((item) => item.email === email);

  if (hasUsername || hasEmail) {
    response.status(409).json({ error: "account already exists" });
    return;
  }

  accounts.push({ username, email, password });
  response.status(201).json({ username });
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
  const { content, author, likes, dislikes } = request.body;

  Post.findById(request.params.id)
    .then((post) => {
      if (post) {
        post.content = content;
        post.author = author;
        post.likes = likes;
        post.dislikes = dislikes;

        post.save().then((updatedPost) => {
          response.json(updatedPost);
        });
      } else {
        response.status(404).end();
      }
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