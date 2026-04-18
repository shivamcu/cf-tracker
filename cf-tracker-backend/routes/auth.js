import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

router.post('/register', async (req, res, next) => {
  const { email, password, cfHandle } = req.body
  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'Email already in use' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ email, password: hashed, cfHandle })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, email: user.email, cfHandle: user.cfHandle } })
  } catch (err) {
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body
  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, email: user.email, cfHandle: user.cfHandle } })
  } catch (err) {
    next(err)
  }
})

export default router