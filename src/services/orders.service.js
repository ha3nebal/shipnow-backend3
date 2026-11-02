
import { ordersRepository } from '../repositories/orders.repository.js'
import { usersRepository } from '../repositories/users.repository.js'
import { storesRepository } from '../repositories/stores.repository.js'
import { ORDER_STATUS } from '../constants/index.js'
import { CustomError } from '../errors/CustomError.js'

export const ordersService = {
  createOrder: async (data) => {
    const user = await usersRepository.findById(data.userId)

    if (!user) {
      throw new CustomError('USER_NOT_FOUND')
    }

    const store = await storesRepository.findById(data.storeId)

    if (!store) {
      throw new CustomError('STORE_NOT_FOUND')
    }

    const total = data.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    )

    return ordersRepository.create({
      ...data,
      total,
      status: ORDER_STATUS.PENDING,
    })
  },

  getOrders: () => ordersRepository.findAll(),

  getOrderById: async (id) => {
    const order = await ordersRepository.findById(id)

    if (!order) {
      throw new CustomError('ORDER_NOT_FOUND')
    }

    return order
  },

  deliverOrder: async (id) => {
    const order = await ordersRepository.findById(id)

    if (!order) {
      throw new CustomError('ORDER_NOT_FOUND')
    }

    if (order.status === ORDER_STATUS.DELIVERED) {
      throw new CustomError('ORDER_ALREADY_DELIVERED')
    }

    return ordersRepository.updateStatus(
      id,
      ORDER_STATUS.DELIVERED,
    )
  },
}
