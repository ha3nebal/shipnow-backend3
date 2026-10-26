
import { mockGenerator } from '../utils/mock.generator.js'
import { mocksRepository } from '../repositories/mocks.repository.js'
import { storesRepository } from '../repositories/stores.repository.js'
import { ORDER_STATUS } from '../constants/index.js'

const badRequest = (message) =>
  Object.assign(new Error(message), { status: 400 })

const validateQty = (qty) => {
  const parsedQty = Number(qty)

  if (
    !Number.isInteger(parsedQty) ||
    parsedQty < 1 ||
    parsedQty > 100
  ) {
    throw badRequest(
      'INVALID_QTY: qty debe ser un entero entre 1 y 100'
    )
  }

  return parsedQty
}

export const mocksService = {
  // Genera usuarios ficticios sin guardarlos en MongoDB.
  generateUsers: (qty = 1) => {
    const count = validateQty(qty)

    return mockGenerator.generateUsers(count)
  },

  // Genera pedidos ficticios sin guardarlos en MongoDB.
  generateOrders: async (qty = 1) => {
    const count = validateQty(qty)
    const users = mockGenerator.generateUsers(count)
    const stores = await storesRepository.findAll()

    if (stores.length === 0) {
      throw badRequest(
        'NO_STORES: primero debes crear al menos una tienda'
      )
    }

    return mockGenerator.generateOrders({
      qty: count,
      users,
      stores,
    })
  },

  // Genera entregas ficticias sin guardarlas en MongoDB.
  generateDeliveries: async (qty = 1) => {
    const count = validateQty(qty)
    const users = mockGenerator.generateUsers(count)
    const drivers = mockGenerator.generateDrivers(count)
    const stores = await storesRepository.findAll()

    if (stores.length === 0) {
      throw badRequest(
        'NO_STORES: primero debes crear al menos una tienda'
      )
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
  },

  // Genera e inserta datos de prueba relacionados en MongoDB.
  seed: async (qty = 10) => {
    const count = validateQty(qty)

    // Generar usuarios y conductores ficticios.
    const users = mockGenerator.generateUsers(count)
    const drivers = mockGenerator.generateDrivers(count)

    // Consultar tiendas existentes.
    let stores = await storesRepository.findAll()

    // Crear una tienda de prueba si no existen tiendas.
    if (stores.length === 0) {
      stores = await mocksRepository.insertStores([
        {
          name: 'Tienda de Prueba 1',
          address: 'Viña del Mar',
        },
      ])
    }

    // Generar pedidos con referencias válidas.
    const orders = mockGenerator.generateOrders({
      qty: count,
      users,
      stores,
    }).map((order) => ({
      ...order,
      status: ORDER_STATUS.PENDING,
    }))

    // Generar entregas relacionadas con los pedidos.
    const deliveries = mockGenerator.generateDeliveries({
      orders,
      drivers,
    }).map((delivery) => ({
      ...delivery,
      status: ORDER_STATUS.PENDING,
    }))

    // Insertar primero usuarios y conductores.
    await mocksRepository.insertUsers([
      ...users,
      ...drivers,
    ])

    // Insertar pedidos antes de las entregas.
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
  },
}
