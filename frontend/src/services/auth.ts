import axios from "axios";

interface AuthResponse {
  username: string;
}

const login = async (username: string, password: string): Promise<string> => {
  const response = await axios.post<AuthResponse>("/api/auth/login", {
    username,
    password,
  });

  return response.data.username;
};

const register = async (
  username: string,
  email: string,
  password: string
): Promise<string> => {
  const response = await axios.post<AuthResponse>("/api/auth/register", {
    username,
    email,
    password,
  });

  return response.data.username;
};

export default {
  login,
  register,
};
