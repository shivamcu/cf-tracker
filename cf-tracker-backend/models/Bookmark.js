import mongoose from 'mongoose'

const bookmarkSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: String, required: true },
  note:      { type: String, default: '' },
  status:    { type: String, enum: ['todo', 'attempted', 'solved'], default: 'todo' },
}, { timestamps: true })

export default mongoose.model('Bookmark', bookmarkSchema)