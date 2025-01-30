import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const login = async (username: string, password: string) => {
  const response = await api.post("/auth/login", { username, password })
  localStorage.setItem("token", response.data.token)
  return response.data
}

export const register = async (username: string, password: string) => {
  const response = await api.post("/auth/register", { username, password })
  localStorage.setItem("token", response.data.token)
  return response.data
}

export const getProfile = async () => {
  const response = await api.get("/auth/me")
  return response.data
}

export const updatePreferences = async (preferences: { theme?: string }) => {
  const response = await api.patch("/auth/preferences", preferences)
  return response.data
}

export const createChat = async () => {
  const response = await api.post("/chats")
  return response.data
}

export const getChats = async () => {
  const response = await api.get("/chats")
  return response.data
}

export const getChat = async (id: string) => {
  const response = await api.get(`/chats/${id}`)
  return response.data
}

export const addMessage = async (chatId: string, message: { role: string; content: string }) => {
  const response = await api.post(`/chats/${chatId}/messages`, message)
  return response.data
}

export const uploadFile = async (chatId: string, file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  const response = await api.post(`/chats/${chatId}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data
}

