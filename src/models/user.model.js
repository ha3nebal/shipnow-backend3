
import mongoose from 'mongoose'
import { USER_ROLES, DOCUMENT_TYPES } from '../constants/index.js'

// Esquema para almacenar los metadatos de cada documento.
const documentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
    },
    generatedName: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    documentType: {
      type: String,
      enum: Object.values(DOCUMENT_TYPES),
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
)

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.CUSTOMER,
  },
  documents: {
    type: [documentSchema],
    default: [],
  },
})

export default mongoose.model('User', userSchema)
