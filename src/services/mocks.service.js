
import { mockGenerator } from '../utils/mock.generator.js'
import { mocksRepository } from '../repositories/mocks.repository.js'
import { storesRepository } from '../repositories/stores.repository.js'
import { ORDER_STATUS } from '../constants/index.js'
import { CustomError } from '../errors/CustomError.js'

const validateQty = (qty) => {
  const parsedQty = Number(qty)

  if (
    !Number.isInteger(parsedQty) ||
    parsedQty < 1 ||
    parsedQty > 100
  ) {
    throw new CustomError('INVALID_MOCK_QTY')
  }

  return parsedQty
}

export const mocksService = {
  // Genera usuarios ficticios sin persistirlos.
  generateUsers: (qty = 1) => {
    const count = validateQty(qty)

    try {
      return mockGenerator.generateUsers(count)
    } catch (error) {
      throw new CustomError('MOCK_GENERATION_FAILED')
    }
  },

  // Genera pedidos ficticios sin persistirlos.
  generateOrders: async (qty = 1) => {
    const count = validateQty(qty)

    try {
      const users = mockGenerator.generateUsers(count)
      const stores = await storesRepository.findAll()

      if (stores.length === 0) {
        throw new CustomError('NO_STORES')
      }

      return mockGenerator.generateOrders({
        qty: count,
        users,
        stores,
      })
    } catch (error) {
      if (error instanceof CustomError) throw error

      throw new CustomError('MOCK_GENERATION_FAILED')
    }
  },

  // Genera entregas ficticias sin persistirlas.
  generateDeliveries: async (qty = 1) => {
    const count = validateQty(qty)

    try {
      const users = mockGenerator.generateUsers(count)
      const drivers = mockGenerator.generateDrivers(count)
      const stores = await storesRepository.findAll()

      if (stores.length === 0) {
        throw new CustomError('NO_STORES')
      }

      const orders = mockGenerator.generateOrders({
        qty: count,
        users,
        stores,
      }).map((order) => ({
        ...order,
        status: ORDER_STATUS.PENDING,
      }))

      return mockGenerator.generateDeliveries({
        orders,
        drivers,
      }).map((delivery) => ({
        ...delivery,
        status: ORDER_STATUS.PENDING,
      }))
    } catch (error) {
      if (error instanceof CustomError) throw error

      throw new CustomError('MOCK_GENERATION_FAILED')
    }
  },

  // Genera e inserta datos de prueba relacionados en MongoDB.
  seed: async (qty = 10) => {
    const count = validateQty(qty)

    try {
      const users = mockGenerator.generateUsers(count)
      const drivers = mockGenerator.generateDrivers(count)

      let stores = await storesRepository.findAll()

      if (stores.length === 0) {
        stores = await mocksRepository.insertStores([
          {
            name: 'Tienda de Prueba 1',
            address: 'Viña del Mar',
          },
        ])
      }

      const orders = mockGenerator.generateOrders({
        qty: count,
        users,
        stores,
      }).map((order) => ({
        ...order,
        status: ORDER_STATUS.PENDING,
      }))

      const deliveries = mockGenerator.generateDeliveries({
        orders,
        drivers,
      }).map((delivery) => ({
        ...delivery,
        status: ORDER_STATUS.PENDING,
      }))

      await mocksRepository.insertUsers([
        ...users,
        ...drivers,
      ])

      await mocksRepository.insertOrders(orders)
      await mocksRepository.insertDeliveries(deliveries)

      const totalInsertados =
        users.length +
        drivers.length +
        orders.length +
        deliveries.length

      return {
        insertados: {
          usuarios: users.length,
          conductores: drivers.length,
          pedidos: orders.length,
          entregas: deliveries.length,
          total: totalInsertados,
        },
        colecciones: [
          'users',
          'orders',
          'deliveries',
        ],
      }
    } catch (error) {
      if (error instanceof CustomError) throw error

      throw new CustomError('MOCK_SEED_FAILED')
    }
  },
}
