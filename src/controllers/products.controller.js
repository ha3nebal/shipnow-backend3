
import { productsService } from '../services/products.service.js'

export const createProduct = async (req, res, next) => {
  try {
    const product = await productsService.createProduct(req.body)

    return res.status(201).json({
      status: 'success',
      payload: product,
    })
  } catch (error) {
    next(error)
  }
}

export const getProducts = async (req, res, next) => {
  try {
    const products = await productsService.getProducts(req.query)

    return res.status(200).json({
      status: 'success',
      payload: products,
    })
  } catch (error) {
    next(error)
  }
}

export const getProductById = async (req, res, next) => {
  try {
    const product = await productsService.getProductById(req.params.id)

    return res.status(200).json({
      status: 'success',
      payload: product,
    })
  } catch (error) {
    next(error)
  }
}

export const updateProduct = async (req, res, next) => {
  try {
    const product = await productsService.updateProduct(
      req.params.id,
      req.body,
    )

    return res.status(200).json({
      status: 'success',
      payload: product,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await productsService.deleteProduct(req.params.id)

    return res.status(200).json({
      status: 'success',
      message: 'Producto eliminado correctamente',
      payload: product,
    })
  } catch (error) {
    next(error)
  }
}
