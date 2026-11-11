
import { mockGenerator } from '../utils/mock.generator.js'
import { mocksRepository } from '../repositories/mocks.repository.js'
import { storesRepository } from '../repositories/stores.repository.js'
import { ORDER_STATUS } from '../constants/index.js'
import { CustomError } from '../errors/CustomError.js'
import { logger } from '../logger/logger.js'

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
      const users = mockGenerator.generateUsers(count)

      logger.info(`Generación de ${users.length} usuarios ficticios completada`)

      return users
    } catch (error) {
      logger.error(`Error al generar usuarios ficticios: ${error.message}`)
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

      const orders = mockGenerator.generateOrders({
        qty: count,
        users,
        stores,
      })

      logger.info(`Generación de ${orders.length} pedidos ficticios completada`)

      return orders
    } catch (error) {
      if (error instanceof CustomError) throw error

      logger.error(`Error al generar pedidos ficticios: ${error.message}`)
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

      const deliveries = mockGenerator.generateDeliveries({
        orders,
        drivers,
      }).map((delivery) => ({
        ...delivery,
        status: ORDER_STATUS.PENDING,
      }))

      logger.info(`Generación de ${deliveries.length} entregas ficticias completada`)

      return deliveries
    } catch (error) {
      if (error instanceof CustomError) throw error

      logger.error(`Error al generar entregas ficticias: ${error.message}`)
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

      logger.info(
        `Seed completado: ${totalInsertados} registros insertados en MongoDB`,
      )

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

      logger.error(`Error durante la ejecución del Seed: ${error.message}`)
      throw new CustomError('MOCK_SEED_FAILED')
    }
  },
}
