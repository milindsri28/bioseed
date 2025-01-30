import express from "express"
import { User } from "../models/User"
import jwt from "jsonwebtoken"
import { auth } from "../middleware/auth"

const router = express.Router()

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body
    const user = new User({ username, password })
    await user.save()

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET || "your-secret-key")

    res.status(201).json({ user, token })
  } catch (error) {
    res.status(400).json({ error: "Unable to register" })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })

    if (!user || !(await user.comparePassword(password))) {
      throw new Error("Invalid login credentials")
    }

    user.lastLogin = new Date()
    await user.save()

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET || "your-secret-key")

    res.json({ user, token })
  } catch (error) {
    res.status(400).json({ error: "Unable to login" })
  }
})

router.get("/me", auth, async (req: any, res) => {
  res.json(req.user)
})

router.patch("/preferences", auth, async (req: any, res) => {
  try {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["theme"]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
      return res.status(400).json({ error: "Invalid updates!" })
    }

    const user = req.user
    user.preferences = { ...user.preferences, ...req.body }
    await user.save()

    res.json(user)
  } catch (error) {
    res.status(400).json({ error: "Unable to update preferences" })
  }
})

export default router

