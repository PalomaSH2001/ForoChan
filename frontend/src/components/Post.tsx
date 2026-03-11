import { Link } from 'react-router-dom';
import type { PostData } from '../types/post.ts';

interface PostProps {
  post: PostData;
  onReply?: (post: PostData) => void;
  onLike?: (post: PostData) => void;
  onDislike?: (post: PostData) => void;
    canReact?: boolean;
}

const Post = ({ post, onReply, onLike, onDislike, canReact = false }: PostProps) => {
    const isClickable = post.clickable ?? true;
    const diff = post.likes - post.dislikes;

    const backgroundColor =
    diff > 0
        ? "#d4f8d4"
        : diff < 0
        ? "#f8d4d4"
        : "#f0f0f0";
    
    return (
        <div className="post" style={{ backgroundColor }}>
            {post.parent ?
                <div className="reply-target">Respondiendo a #{post.parent}</div>
            : null}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h4>{post.author ?? "Anónimo"}</h4>
                {isClickable ? 
                    <Link to={`posts/${post.id}`} style={{ fontSize: "12px", color: "blue" }}>
                    #{post.id}
                </Link>
                :
                <span style={{ fontSize: "12px", color: "gray" }}>
                    #{post.id}
                </span>
                }
            </div>

            <p>{post.content}</p>
            <p style={{ fontSize: "12px", color: "gray" }}>
                {new Date(post.createdAt).toLocaleString()}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {onReply && post.thread && (
                <button onClick={() => onReply(post)}>
                    Responder
                </button>
                )}

                <button
                    type="button"
                    className="like-button"
                    onClick={() => onLike?.(post)}
                >
                    👍 {post.likes ?? 0}
                </button>
                <button
                    type="button"
                    className="like-button"
                    onClick={() => onDislike?.(post)}
                >
                    👎 {post.dislikes ?? 0}
                </button>
                </div>
                {!canReact && (onLike || onDislike) && (
                    <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                        <em>Inicia sesión para reaccionar</em>
                    </p>
                )}

            
        </div>
    );
}


export default Post;