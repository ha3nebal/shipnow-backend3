import { ordersService } from '../services/orders.service.js'

export const createOrder = async (req, res, next) => {
  try {
    const order = await ordersService.createOrder(req.body)
    res.status(201).json({ status: 'success', payload: order })
  } catch (error) {
    next(error)
  }
}


export const getOrders = async (req, res, next) => {
  try {
    const result = await ordersService.getOrders(req.query)

    res.status(200).json({
      status: 'success',
      payload: result.orders,
      pagination: result.pagination,
    })
  } catch (error) {
    next(error)
  }
}


export const getOrderById = async (req, res, next) => {
  try {
    const order = await ordersService.getOrderById(req.params.id)
    res.json({ status: 'success', payload: order })
  } catch (error) {
    next(error)
  }
}

export const deliverOrder = async (req, res, next) => {
  try {
    const order = await ordersService.deliverOrder(req.params.id)
    res.json({ status: 'success', payload: order })
  } catch (error) {
    next(error)
  }
}

export const uploadOrderReceipt = async (req, res, next) => {
  try {
    const order = await ordersService.uploadOrderReceipt(
      req.params.id,
      req.file,
    )

    res.status(200).json({
      status: 'success',
      message: 'Comprobante cargado correctamente',
      payload: order,
    })
  } catch (error) {
    next(error)
  }
}
