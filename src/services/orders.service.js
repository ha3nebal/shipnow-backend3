
import { unlink } from 'node:fs/promises'
import { ordersRepository } from '../repositories/orders.repository.js'
import { usersRepository } from '../repositories/users.repository.js'
import { storesRepository } from '../repositories/stores.repository.js'
import { ORDER_STATUS } from '../constants/index.js'
import { CustomError } from '../errors/CustomError.js'
import { logger } from '../logger/logger.js'

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

export const ordersService = {
  createOrder: async (data) => {
        // Validar los campos obligatorios antes de procesar el pedido.
    if (
      !data?.userId ||
      !data?.storeId ||
      !data?.address ||
      !Array.isArray(data?.items) ||
      data.items.length === 0
    ) {
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

    return order
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

    const updatedOrder = await ordersRepository.updateStatus(
      id,
      ORDER_STATUS.DELIVERED,
    )

    logger.info(`Pedido entregado correctamente: ${id}`)

    return updatedOrder
  },
  uploadOrderReceipt: async (id, file) => {
    try {
      // Comprobar que se haya adjuntado un archivo.
      if (!file) {
        throw new CustomError('FILE_REQUIRED')
      }

      // Comprobar que el pedido exista.
      const order = await ordersRepository.findById(id)

      if (!order) {
        throw new CustomError('ORDER_NOT_FOUND')
      }

      // Preparar los metadatos del comprobante.
      const receipt = {
        originalName: file.originalname,
        generatedName: file.filename,
        path: file.path.replace(/\\/g, '/'),
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      }

      // Guardar los metadatos en MongoDB.
      const updatedOrder = await ordersRepository.addReceipt(id, receipt)

      if (!updatedOrder) {
        throw new CustomError('ORDER_NOT_FOUND')
      }

      logger.info(`Comprobante asociado correctamente al pedido ${id}`)

      return updatedOrder
    } catch (error) {
      // Eliminar el archivo si falló alguna operación.
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
