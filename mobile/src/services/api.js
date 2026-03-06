import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/theme";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ───
export const authAPI = {
  register: (data) => api.post("/api/auth/register", data),
  login: (data) => api.post("/api/auth/login", data),
  getMe: () => api.get("/api/auth/me"),
  updateProfile: (data) => api.put("/api/auth/me", data),
  changePassword: (data) => api.post("/api/auth/change-password", data),
};

// ─── Games ───
export const gamesAPI = {
  create: (data) => api.post("/api/games/", data),
  list: (params) => api.get("/api/games/", { params }),
  get: (id) => api.get(`/api/games/${id}`),
  makeMove: (id, data) => api.post(`/api/games/${id}/move`, data),
  getMoves: (id) => api.get(`/api/games/${id}/moves`),
  getLegalMoves: (id) => api.get(`/api/games/${id}/legal-moves`),
  resign: (id) => api.post(`/api/games/${id}/resign`),
};

// ─── Puzzles ───
export const puzzlesAPI = {
  list: (params) => api.get("/api/puzzles/", { params }),
  categories: () => api.get("/api/puzzles/categories"),
  random: (difficulty) => api.get("/api/puzzles/random", { params: { difficulty } }),
  get: (id) => api.get(`/api/puzzles/${id}`),
  attempt: (id, data) => api.post(`/api/puzzles/${id}/attempt`, data),
};

// ─── Analysis ───
export const analysisAPI = {
  evaluate: (data) => api.post("/api/analysis/evaluate", data),
  suggest: (data) => api.post("/api/analysis/suggest-move", data),
};

// ─── Export ───
export const exportAPI = {
  pgn: (data) => api.post("/api/export/pgn", data),
  csv: (data) => api.post("/api/export/csv", data),
  pdf: (data) => api.post("/api/export/pdf", data, { responseType: "blob" }),
  formats: () => api.get("/api/export/formats"),
};

// ─── Leaderboard & Stats ───
export const statsAPI = {
  leaderboard: (limit) => api.get("/api/leaderboard", { params: { limit } }),
  myStats: () => api.get("/api/stats"),
  openings: (params) => api.get("/api/openings", { params }),
};

// ─── Achievements (v2.0) ───
export const achievementsAPI = {
  list: () => api.get("/api/achievements/"),
  summary: () => api.get("/api/achievements/summary"),
  check: () => api.post("/api/achievements/check"),
};

// ─── Daily Challenge & Game Review (v2.0) ───
export const dailyChallengeAPI = {
  today: () => api.get("/api/daily-challenge"),
  attempt: (id, data) => api.post(`/api/daily-challenge/${id}/attempt`, data),
};

export const reviewAPI = {
  getReview: (gameId) => api.get(`/api/games/${gameId}/review`),
  getSummary: (gameId) => api.get(`/api/games/${gameId}/review/summary`),
};

export default api;
