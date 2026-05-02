import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes  from './routes/auth.js'
import cfRoutes    from './routes/codeforces.js'
import userRoutes  from './routes/user.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/cf',   cfRoutes)
app.use('/api/user', userRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation error', details: err.message })
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Resource already exists' })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' })
  }

  // Default server error
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  })
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    )
  })
  .catch(err => console.error('MongoDB error:', err))