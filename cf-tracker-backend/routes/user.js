import express from 'express'
import authMiddleware from '../middleware/auth.js'
import User from '../models/User.js'
import Bookmark from '../models/Bookmark.js'

const router = express.Router()

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) {
    next(err)
  }
})

router.put('/update', authMiddleware, async (req, res, next) => {
  try {
    const { cfHandle } = req.body
    if (!cfHandle) {
      return res.status(400).json({ message: 'cfHandle is required' })
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { cfHandle },
      { new: true }
    ).select('-password')

    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) {
    next(err)
  }
})

router.post('/bookmark', authMiddleware, async (req, res, next) => {
  try {
    const { problemId, status, note } = req.body
    if (!problemId) {
      return res.status(400).json({ message: 'problemId is required' })
    }

    const bookmark = await Bookmark.findOneAndUpdate(
      { userId: req.user.id, problemId },
      { status, note },
      { upsert: true, new: true }
    )
    res.json(bookmark)
  } catch (err) {
    next(err)
  }
})

router.get('/bookmarks', authMiddleware, async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user.id })
    res.json(bookmarks)
  } catch (err) {
    next(err)
  }
})

export default router