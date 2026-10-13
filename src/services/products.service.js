
import { productsRepository } from '../repositories/products.repository.js'
import { PRODUCT_STATUS } from '../constants/index.js'

const notFound = () =>
  Object.assign(new Error('PRODUCT_NOT_FOUND'), { status: 404 })

const badRequest = (message) =>
  Object.assign(new Error(message), { status: 400 })

const getProductStatus = (stock) =>
  stock === 0 ? PRODUCT_STATUS.OUT_OF_STOCK : PRODUCT_STATUS.AVAILABLE

export const productsService = {
  createProduct: (data) => {
    const stock = data.stock ?? 0

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
        throw badRequest('INVALID_PRODUCT_STATUS')
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
    if (!product) throw notFound()
    return product
  },

  updateProduct: async (id, data) => {
    const currentProduct = await productsRepository.findById(id)
    if (!currentProduct) throw notFound()

    if (data.stock !== undefined &&
        (!Number.isFinite(data.stock) || data.stock < 0)) {
      throw badRequest('INVALID_PRODUCT_STOCK')
    }

    const stock = data.stock ?? currentProduct.stock

    return productsRepository.updateById(id, {
      ...data,
      status: getProductStatus(stock),
    })
  },

  deleteProduct: async (id) => {
    const product = await productsRepository.deleteById(id)
    if (!product) throw notFound()
    return product
  },
}
