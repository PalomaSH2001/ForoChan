import { useEffect, useState } from "react";

interface PostFormProps {
    onSubmit: (content: string, author: string) => void
    replyToId?: string | null
    onClearReply?: () => void
    currentUser?: string | null
}

function PostForm(props: PostFormProps) {
    const [newPostContent, setNewPostContent] = useState<string>("");
    const [newPostAuthor, setNewPostAuthor] = useState<string>("");

    useEffect(() => {
        if (props.currentUser) {
            setNewPostAuthor(props.currentUser);
            return;
        }

        setNewPostAuthor("");
    }, [props.currentUser]);

    const addPost = (e: React.FormEvent) => {
        e.preventDefault();

        const content = newPostContent.trim();
        if (!content) {
            return;
        }

        props.onSubmit(content, props.currentUser || newPostAuthor.trim());
        setNewPostContent("");
        if (!props.currentUser) {
            setNewPostAuthor("");
        }
    };

    const handlePostContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPostContent(e.target.value);
    };

    const handlePostAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPostAuthor(e.target.value);
    };

    return (
        <>
            {props.replyToId && (
                <div className="replying-to">
                    Respondiendo a #{props.replyToId}
                    {props.onClearReply && (
                        <button type="button" onClick={props.onClearReply}>Cancelar</button>
                    )}
                </div>
            )}
            <form className="post-form" onSubmit={addPost}>
            {props.currentUser ? (
                <span className="session-author">Publicando como: {props.currentUser}</span>
            ) : (
                <input
                type="text"
                value={newPostAuthor}
                placeholder="Type your name here..."
                onChange={handlePostAuthorChange}
                />
            )}
            <input
            type="text"
            value={newPostContent}
            placeholder="Type your post here..."
            onChange={handlePostContentChange}
            />
            { props.replyToId ? 
            <button type="submit">Comment</button>
            :
            <button type="submit">Add Post</button>}
            
            </form>
        </>
    )
}

export default PostForm