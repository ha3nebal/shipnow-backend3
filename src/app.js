
import express from 'express'

import ordersRouter from './routes/orders.router.js'
import usersRouter from './routes/users.router.js'
import productsRouter from './routes/products.router.js'
import mocksRouter from './routes/mocks.router.js'
import loggerRouter from './routes/logger.router.js'

import { errorMiddleware } from './middlewares/error.middleware.js'

import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './docs/swagger.js'

import { CustomError } from './errors/CustomError.js'
import { config } from './config/env.config.js'

const app = express()

// Middleware para interpretar solicitudes JSON.
app.use(express.json())

// Health check de la API.
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      status: 'ok',
      environment: config.nodeEnv,
      uptime: Number(process.uptime().toFixed(2)),
      timestamp: new Date().toISOString(),
    },
  })
})

// Documentación y herramientas internas.
// Solo disponibles en desarrollo y testing.
if (config.nodeEnv !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

  app.use('/api/mocks', mocksRouter)
  app.use('/api/loggerTest', loggerRouter)
}

// Rutas principales de la API.
app.use('/api/orders', ordersRouter)
app.use('/api/users', usersRouter)
app.use('/api/products', productsRouter)

// Middleware para rutas inexistentes.
app.use((req, res, next) => {
  next(new CustomError('ROUTE_NOT_FOUND'))
})

// Middleware global de errores.
app.use(errorMiddleware)

export default app
