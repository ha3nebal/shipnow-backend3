
import express from 'express'
import mongoose from 'mongoose'
import { config } from './config/env.config.js'

import ordersRouter from './routes/orders.router.js'
import usersRouter from './routes/users.router.js'
import productsRouter from './routes/products.router.js'
import mocksRouter from './routes/mocks.router.js'

import { errorMiddleware } from './middlewares/error.middleware.js'
import { logger } from './logger/logger.js'
import loggerRouter from './routes/logger.router.js'

import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './docs/swagger.js'

const app = express()

app.use(express.json())

// Conexión a MongoDB.
try {
  await mongoose.connect(config.mongoUri)
  logger.info('Conexión a MongoDB establecida')
} catch (error) {
  logger.fatal('No fue posible conectar con MongoDB: %s', error.message)
  process.exit(1)
}

// Documentación interactiva de la API.
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Rutas de la API.
app.use('/api/orders', ordersRouter)
app.use('/api/users', usersRouter)
app.use('/api/products', productsRouter)
app.use('/api/mocks', mocksRouter)
app.use('/api/logger', loggerRouter)

// Middleware global de errores.
app.use(errorMiddleware)

// Iniciar servidor.
app.listen(config.port, () => {
  logger.info(
    `Servidor ShipNow escuchando en el puerto ${config.port} (${config.nodeEnv})`,
  )
})
