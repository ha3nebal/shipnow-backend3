
import { mocksService } from '../services/mocks.service.js'

export const mocksController = {
  getUsers: async (req, res, next) => {
    try {
      const qty = req.query.qty ?? 1
      const users = await mocksService.generateUsers(qty)

      return res.status(200).json({
        status: 'success',
        data: users,
      })
    } catch (error) {
      next(error)
    }
  },

  getOrders: async (req, res, next) => {
    try {
      const qty = req.query.qty ?? 1
      const orders = await mocksService.generateOrders(qty)

      return res.status(200).json({
        status: 'success',
        data: orders,
      })
    } catch (error) {
      next(error)
    }
  },

  
  getDeliveries: async (req, res, next) => {
    try {
      const qty = req.query.qty ?? 1
      const deliveries = await mocksService.generateDeliveries(qty)

      return res.status(200).json({
        status: 'success',
        data: deliveries,
      })
    } catch (error) {
      next(error)
    }
  },

  
  seed: async (req, res, next) => {
    try {
      const qty = req.query.qty ?? 10
      const result = await mocksService.seed(qty)

      return res.status(201).json({
        status: 'success',
        message: 'Datos de prueba insertados correctamente',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },
}
