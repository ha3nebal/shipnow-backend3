
import { Router } from 'express'
import { mocksController } from '../controllers/mocks.controller.js'

const router = Router()

router.get('/users', mocksController.getUsers)
router.get('/orders', mocksController.getOrders)
router.post('/seed', mocksController.seed)
router.get('/deliveries', mocksController.getDeliveries)

export default router