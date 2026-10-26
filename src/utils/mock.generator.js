
import mongoose from 'mongoose'
import { ORDER_STATUS, ORDER_PRIORITY, USER_ROLES } from '../constants/index.js'

const randomItem = (items) =>
  items[Math.floor(Math.random() * items.length)]

const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const createId = () => new mongoose.Types.ObjectId()

export const mockGenerator = {
  generateUsers: (qty = 1) =>
    Array.from({ length: qty }, (_, index) => ({
      _id: createId(),
      name: `Usuario Prueba ${index + 1}`,
      email: `usuario.prueba.${Date.now()}.${index}@example.com`,
      role: USER_ROLES.CUSTOMER,
    })),

  generateDrivers: (qty = 1) =>
    Array.from({ length: qty }, (_, index) => ({
      _id: createId(),
      name: `Conductor Prueba ${index + 1}`,
      email: `conductor.prueba.${Date.now()}.${index}@example.com`,
      role: USER_ROLES.DRIVER,
    })),

  generateOrders: ({ qty = 1, users, stores }) =>
    Array.from({ length: qty }, () => {
      const user = randomItem(users)
      const store = randomItem(stores)
      const item = {
        name: randomItem(['Pizza', 'Hamburguesa', 'Ensalada', 'Sándwich']),
        price: randomNumber(3000, 12000),
        quantity: randomNumber(1, 3),
      }

      return {
        _id: createId(),
        userId: user._id,
        storeId: store._id,
        address: `Calle Ficticia ${randomNumber(100, 999)}, Viña del Mar`,
        items: [item],
        total: item.price * item.quantity,
        status: randomItem(Object.values(ORDER_STATUS)),
        priority: randomItem(Object.values(ORDER_PRIORITY)),
      }
    }),

  generateDeliveries: ({ orders, drivers }) =>
    orders.map((order) => {
      const assigned = Math.random() < 0.7
      const driver =
      assigned && drivers.length > 0 ? randomItem(drivers) : null

      return {
        _id: createId(),
        orderId: order._id,
        driverId: driver?._id ?? null,
        status: order.status,
        address: order.address,
      }
    }),
}