import { useEffect, useState } from 'react'
import Post from '../components/Post'
import type { PostData } from '../types/post.ts';
import postService from "../services/post";
import PostForm from '../components/PostForm.tsx';

function HomePage() {
  const [posts, setPosts] = useState<PostData[]>([]);

  const handleLike = (post: PostData) => {
    const updatedPost: PostData = {
      ...post,
      likes: (post.likes ?? 0) + 1,
      dislikes: post.dislikes ?? 0,
      updatedAt: new Date()
    };

    postService.update(post.id, updatedPost).then((savedPost) => {
      setPosts((prevPosts) => prevPosts.map((item) => (item.id === savedPost.id ? { ...savedPost, clickable: true } : item)));
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
      setPosts((prevPosts) => prevPosts.map((item) => (item.id === savedPost.id ? { ...savedPost, clickable: true } : item)));
    });
  };

  useEffect(() => {
    postService.getAll().then((data) => {
    setPosts(data);
    });
  }, []);

  return (
    <>
      <div>
        <h1>Threads</h1>
        <PostForm onSubmit={(content, author) => {
          const postObject: Omit<PostData, "id"> = {
            content,
            author: author || "Anónimo",
            thread: null,
            parent: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            likes: 0,
            dislikes: 0,
            clickable: true
          };
          postService.create(postObject).then((data) => {
          setPosts(posts.concat(data));
          });
        }} />
            
        <div className="posts">
          {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            onLike={handleLike}
            onDislike={handleDislike}
          />
        ))}
        </div>
      </div>
    </>
  )
}

export default HomePage