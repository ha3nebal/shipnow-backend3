
import { productsRepository } from '../repositories/products.repository.js'
import { PRODUCT_STATUS } from '../constants/index.js'
import { CustomError } from '../errors/CustomError.js'

const getProductStatus = (stock) =>
  stock === 0
    ? PRODUCT_STATUS.OUT_OF_STOCK
    : PRODUCT_STATUS.AVAILABLE

export const productsService = {
  createProduct: (data) => {
    const stock = data.stock ?? 0

    if (!Number.isFinite(stock) || stock < 0) {
      throw new CustomError('INVALID_PRODUCT_STOCK')
    }

    return productsRepository.create({
      ...data,
      stock,
      status: getProductStatus(stock),
    })
  },

  getProducts: ({ status, includeOutOfStock } = {}) => {
    const filter = {}

    if (status) {
      if (!Object.values(PRODUCT_STATUS).includes(status)) {
        throw new CustomError('INVALID_PRODUCT_STATUS')
      }

      filter.status = status
    } else if (includeOutOfStock !== 'true') {
      filter.stock = { $gt: 0 }
      filter.status = PRODUCT_STATUS.AVAILABLE
    }

    return productsRepository.findAll(filter)
  },

  getProductById: async (id) => {
    const product = await productsRepository.findById(id)

    if (!product) {
      throw new CustomError('PRODUCT_NOT_FOUND')
    }

    return product
  },

  updateProduct: async (id, data) => {
    const currentProduct = await productsRepository.findById(id)

    if (!currentProduct) {
      throw new CustomError('PRODUCT_NOT_FOUND')
    }

    if (
      data.stock !== undefined &&
      (!Number.isFinite(data.stock) || data.stock < 0)
    ) {
      throw new CustomError('INVALID_PRODUCT_STOCK')
    }

    const stock = data.stock ?? currentProduct.stock

    return productsRepository.updateById(id, {
      ...data,
      status: getProductStatus(stock),
    })
  },

  deleteProduct: async (id) => {
    const product = await productsRepository.deleteById(id)

    if (!product) {
      throw new CustomError('PRODUCT_NOT_FOUND')
    }

    return product
  },
}
