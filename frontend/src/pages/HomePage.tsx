import { useEffect, useState } from 'react'
import Post from '../components/Post'
import type { PostData } from '../types/post.ts';
import postService from "../services/post";
import PostForm from '../components/PostForm.tsx';
import LoginModal from '../components/LoginModal.tsx';
import RegisterModal from '../components/RegisterModal.tsx';

interface HomePageProps {
  currentUser: string | null;
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  onOpenLogin: () => void;
  onCloseLogin: () => void;
  onOpenRegister: () => void;
  onCloseRegister: () => void;
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, email: string, password: string) => Promise<void>;
  onLogout: () => void;
}

function HomePage({
  currentUser,
  isLoginModalOpen,
  isRegisterModalOpen,
  onOpenLogin,
  onCloseLogin,
  onOpenRegister,
  onCloseRegister,
  onLogin,
  onRegister,
  onLogout,
}: HomePageProps) {
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
        <div className="top-bar">
          {currentUser ? (
            <>
              <span>Conectado como <strong>{currentUser}</strong></span>
              <button type="button" className="logoutButton" onClick={onLogout}>Cerrar sesion</button>
            </>
          ) : (
            <>
              <button type="button" className="registerButton" onClick={onOpenRegister}>Registrarse</button>
              <button type="button" className="loginButton" onClick={onOpenLogin}>Iniciar sesion</button>
            </>
          )}
        </div>

        <h1>ForoChan ✨</h1>
        <PostForm onSubmit={(content, author) => {
          const postObject: Omit<PostData, "id"> = {
            content,
            author: currentUser || author || "Anonimo",
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
        }} currentUser={currentUser} />

        <LoginModal isOpen={isLoginModalOpen} onClose={onCloseLogin} onLogin={onLogin} />
        <RegisterModal isOpen={isRegisterModalOpen} onClose={onCloseRegister} onRegister={onRegister} />

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