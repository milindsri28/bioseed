import express from "express"
import cors from "cors"
import { connectDB } from "./config/database"
import authRoutes from "./routes/auth"
import chatRoutes from "./routes/chat"
import path from "path"

const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/chats", chatRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

