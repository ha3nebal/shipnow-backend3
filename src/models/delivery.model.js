
import mongoose from 'mongoose'
import { ORDER_STATUS } from '../constants/index.js'

const deliverySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  status: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.PENDING,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true })

export default mongoose.model('Delivery', deliverySchema)