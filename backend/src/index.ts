import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import Post from "./models/Post";

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.static("dist"));


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

app.get("/", (request, response) => {
  response.send("hola");
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