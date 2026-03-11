import axios from "axios";
import type { PostData } from "../types/post.ts";
const baseUrl = "/api/threads";

export interface ThreadAnswer {
  thread: PostData
  comments: PostData[]
}

const getAll = () => {
  const request = axios.get(baseUrl);

  return request.then((response) => response.data);
};

const create = (newObject: Omit<PostData, "id">) => {
  return axios.post(baseUrl, newObject).then((request) => request.data);
};

const update = (id: string, newObject: PostData) => {
  console.log('Putting to:', `${baseUrl}/${id}`);
  return axios
    .put(`${baseUrl}/${id}`, newObject)
    .then((request) => request.data);
};

const getThreadById = (id: string) => {
  console.log("Fetching thread with id:", id);
  console.log("GET request URL:", `${baseUrl}/${id}`);
  return axios.get<ThreadAnswer>(`${baseUrl}/${id}`).then((request) => request.data);
}

const createComment = (id: string, newObject: Omit<PostData, "id">) => {
  return axios.post(`${baseUrl}/${id}`, newObject).then((request) => request.data);
};

const react = (id: string, username: string, type: "like" | "dislike") => {
  return axios
    .post(`${baseUrl}/${id}/reactions`, { username, type })
    .then((request) => request.data);
};

export default {
  getAll,
  create,
  update,
  getThreadById,
  createComment,
  react
};