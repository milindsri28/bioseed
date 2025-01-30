import express from "express"
import { Chat } from "../models/Chat"
import { auth, type AuthRequest } from "../middleware/auth"
import multer from "multer"
import path from "path"

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx", ".txt"]
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedTypes.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type"))
    }
  },
})

// Create a new chat
router.post("/", auth, async (req: AuthRequest, res) => {
  try {
    const chat = new Chat({
      userId: req.user._id,
      title: req.body.title || "New Chat",
    })
    await chat.save()
    res.status(201).json(chat)
  } catch (error) {
    res.status(400).json({ error: "Unable to create chat" })
  }
})

// Get all chats for a user
router.get("/", auth, async (req: AuthRequest, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id }).sort({ lastMessageAt: -1 })
    res.json(chats)
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch chats" })
  }
})

// Get a specific chat
router.get("/:id", auth, async (req: AuthRequest, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" })
    }
    res.json(chat)
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch chat" })
  }
})

// Add a message to a chat
router.post("/:id/messages", auth, async (req: AuthRequest, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" })
    }

    chat.messages.push({
      role: req.body.role,
      content: req.body.content,
    })
    chat.lastMessageAt = new Date()
    await chat.save()

    res.json(chat)
  } catch (error) {
    res.status(400).json({ error: "Unable to add message" })
  }
})

// Upload a file for chat
router.post("/:id/upload", auth, upload.single("file"), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      throw new Error("No file uploaded")
    }

    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" })
    }

    res.json({
      filename: req.file.filename,
      path: req.file.path,
    })
  } catch (error) {
    res.status(400).json({ error: "Unable to upload file" })
  }
})

export default router

