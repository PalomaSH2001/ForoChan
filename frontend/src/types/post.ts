export type PostData = {
    id: string
    content: string
    author: string | null
    thread: string | null // null si es thread, un id si es comentario
    parent: string | null // null si no responde a nadie o el id del respondido
    createdAt: Date
    updatedAt: Date
    likes: number
    dislikes: number
    clickable?: boolean
}