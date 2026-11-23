
import OrderModel from '../models/order.model.js'

export const ordersRepository = {
  create: (data) => OrderModel.create(data),

  findById: (id) => OrderModel.findById(id).lean(),

  findAll: async ({ page, limit, status, priority }) => {
    const filter = {}

    if (status) {
      filter.status = status
    }

    if (priority) {
      filter.priority = priority
    }

    const skip = (page - 1) * limit

    const [orders, totalOrders] = await Promise.all([
      OrderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      OrderModel.countDocuments(filter),
    ])

    return {
      orders,
      pagination: {
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
        limit,
      },
    }
  },

  updateStatus: (id, status) =>
    OrderModel.findByIdAndUpdate(id, { status }, { new: true }).lean(),

  addReceipt: (id, receipt) =>
    OrderModel.findByIdAndUpdate(
      id,
      { receipt },
      { new: true, runValidators: true },
    ).lean(),
}
