import { useParams } from "react-router-dom";
import type { PostData } from "../types/post";
import { useEffect, useState } from "react";
import Post from "../components/Post";
import postService from "../services/post";
import PostForm from "../components/PostForm";

function Thread() {
  const { id } = useParams(); 
  const [thread, setThread] = useState<PostData | null>(null);
  const [comments, setComments] = useState<PostData[]>([]);
  const [replyTo, setReplyTo] = useState<PostData | null>(null);

  const handleLike = (post: PostData) => {
    const updatedPost: PostData = {
      ...post,
      likes: (post.likes ?? 0) + 1,
      dislikes: post.dislikes ?? 0,
      updatedAt: new Date()
    };

    postService.update(post.id, updatedPost).then((savedPost) => {
      if (savedPost.thread === null) {
        setThread({ ...savedPost, clickable: false });
        return;
      }

      setComments((prevComments) => prevComments.map((item) => (item.id === savedPost.id ? { ...savedPost, clickable: false } : item)));
    });
  };

  const handleDislike = (post: PostData) => {
    const updatedPost: PostData = {
      ...post,
      likes: post.likes ?? 0,
      dislikes: (post.dislikes ?? 0) + 1,
      updatedAt: new Date()
    };

    postService.update(post.id, updatedPost).then((savedPost) => {
      if (savedPost.thread === null) {
        setThread({ ...savedPost, clickable: false });
        return;
      }

      setComments((prevComments) => prevComments.map((item) => (item.id === savedPost.id ? { ...savedPost, clickable: false } : item)));
    });
  };

  useEffect(() => {
    if (id) {
      postService.getThreadById(id).then(data => {
        setThread(data.thread);
        setComments(data.comments);
      });
    }
  }, [id]);

  if (!thread) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Thread #{thread.id}</h1>
      <PostForm
        replyToId={replyTo?.id}
        onClearReply={() => setReplyTo(null)}
        onSubmit={(content, author) => {
          const postObject: Omit<PostData, "id"> = {
            content,
            author: author || "Anónimo",
            thread: replyTo? thread.id : null,
            parent: replyTo ? replyTo.id : null,
            createdAt: new Date(),
            updatedAt: new Date(),
            likes: 0,
            dislikes: 0,
            clickable: false
          };
            postService.createComment(thread.id, postObject).then((data) => {
            setComments(comments.concat(data));
            setReplyTo(null);
          });
        }}
      />
      <Post
        post={{ ...thread, clickable: false }}
        onReply={setReplyTo}
        onLike={handleLike}
        onDislike={handleDislike}
      />

      <h3>Comentarios</h3>
      {comments.map(comment => (
        <Post
          key={comment.id}
          post={{ ...comment, clickable: false }}
          onReply={setReplyTo}
          onLike={handleLike}
          onDislike={handleDislike}
        />
      ))}
    </div>
  );
}

export default Thread