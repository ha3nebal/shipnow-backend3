
import mongoose from 'mongoose'
import { ORDER_STATUS, ORDER_PRIORITY } from '../constants/index.js'

// Esquema para almacenar los metadatos del comprobante.
const receiptSchema = new mongoose.Schema(
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
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
)

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.PENDING,
  },
  priority: {
    type: String,
    enum: Object.values(ORDER_PRIORITY),
    default: ORDER_PRIORITY.MEDIUM,
  },
  receipt: {
    type: receiptSchema,
    default: null,
  },
}, { timestamps: true })

export default mongoose.model('Order', orderSchema)
