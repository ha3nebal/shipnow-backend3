
import { unlink } from 'node:fs/promises'
import { ordersRepository } from '../repositories/orders.repository.js'
import { usersRepository } from '../repositories/users.repository.js'
import { storesRepository } from '../repositories/stores.repository.js'
import { ORDER_STATUS, ORDER_PRIORITY } from '../constants/index.js'
import { CustomError } from '../errors/CustomError.js'
import { logger } from '../logger/logger.js'

// Eliminar el archivo físico si ocurre un error durante la carga.
const removeUploadedFile = async (file) => {
  if (!file?.path) return

  try {
    await unlink(file.path)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }
}

// Ocultar rutas internas de los comprobantes.
const sanitizeOrder = (order) => {
  if (!order) return order

  const sanitizedOrder = { ...order }

  if (sanitizedOrder.receipt) {
    const { path, ...safeReceipt } = sanitizedOrder.receipt
    sanitizedOrder.receipt = safeReceipt
  }

  return sanitizedOrder
}

export const ordersService = {
  // Crear un pedido.
  createOrder: async (data) => {
    if (
      !data?.userId ||
      !data?.storeId ||
      !data?.address ||
      !Array.isArray(data?.items) ||
      data.items.length === 0
    ) {
      throw new CustomError('VALIDATION_ERROR')
    }

    // Validar cada artículo antes de calcular el total.
    const validItems = data.items.every(
      (item) =>
        item &&
        typeof item.name === 'string' &&
        item.name.trim().length > 0 &&
        typeof item.price === 'number' &&
        Number.isFinite(item.price) &&
        item.price >= 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 1,
    )

    if (!validItems) {
      throw new CustomError('VALIDATION_ERROR')
    }

    const user = await usersRepository.findById(data.userId)

    if (!user) {
      throw new CustomError('USER_NOT_FOUND')
    }

    const store = await storesRepository.findById(data.storeId)

    if (!store) {
      throw new CustomError('STORE_NOT_FOUND')
    }

    // Calcular el total del pedido.
    const total = data.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    )

    const order = await ordersRepository.create({
      ...data,
      total,
      status: ORDER_STATUS.PENDING,
    })

    logger.info(`Pedido creado correctamente: ${order._id}`)

    return sanitizeOrder(order.toObject())
  },

  // Obtener pedidos con paginación y filtros.
  getOrders: async ({
    page = '1',
    limit = '10',
    status,
    priority,
  } = {}) => {
    const currentPage = Number(page)
    const currentLimit = Number(limit)

    if (!Number.isInteger(currentPage) || currentPage < 1) {
      throw new CustomError('VALIDATION_ERROR')
    }

    if (
      !Number.isInteger(currentLimit) ||
      currentLimit < 1 ||
      currentLimit > 100
    ) {
      throw new CustomError('VALIDATION_ERROR')
    }

    if (status && !Object.values(ORDER_STATUS).includes(status)) {
      throw new CustomError('VALIDATION_ERROR')
    }

    if (priority && !Object.values(ORDER_PRIORITY).includes(priority)) {
      throw new CustomError('VALIDATION_ERROR')
    }

    const result = await ordersRepository.findAll({
      page: currentPage,
      limit: currentLimit,
      status,
      priority,
    })

    return {
      orders: result.orders.map(sanitizeOrder),
      pagination: result.pagination,
    }
  },

  // Obtener un pedido por su ID.
  getOrderById: async (id) => {
    const order = await ordersRepository.findById(id)

    if (!order) {
      throw new CustomError('ORDER_NOT_FOUND')
    }

    return sanitizeOrder(order)
  },

  // Marcar un pedido como entregado.
  deliverOrder: async (id) => {
    const order = await ordersRepository.findById(id)

    if (!order) {
      throw new CustomError('ORDER_NOT_FOUND')
    }

    if (order.status === ORDER_STATUS.DELIVERED) {
      throw new CustomError('ORDER_ALREADY_DELIVERED')
    }

    const updatedOrder = await ordersRepository.updateStatus(
      id,
      ORDER_STATUS.DELIVERED,
    )

    logger.info(`Pedido entregado correctamente: ${id}`)

    return sanitizeOrder(updatedOrder)
  },

  // Cargar el comprobante de un pedido.
  uploadOrderReceipt: async (id, file) => {
    try {
      if (!file) {
        throw new CustomError('FILE_REQUIRED')
      }

      const order = await ordersRepository.findById(id)

      if (!order) {
        throw new CustomError('ORDER_NOT_FOUND')
      }

      // Guardar únicamente los metadatos del comprobante.
      const receipt = {
        originalName: file.originalname,
        generatedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      }

      const updatedOrder = await ordersRepository.addReceipt(id, receipt)

      if (!updatedOrder) {
        throw new CustomError('ORDER_NOT_FOUND')
      }

      logger.info(`Comprobante asociado correctamente al pedido ${id}`)

      return sanitizeOrder(updatedOrder)
    } catch (error) {
      // Eliminar el archivo físico si la operación falla.
      try {
        await removeUploadedFile(file)
      } catch (cleanupError) {
        logger.error(
          `No se pudo eliminar el archivo ${file?.path}: ${cleanupError.message}`,
        )
      }

      throw error
    }
  },
}
