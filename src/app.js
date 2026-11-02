
import express from 'express'
import mongoose from 'mongoose'
import { config } from './config/env.config.js'

import ordersRouter from './routes/orders.router.js'
import usersRouter from './routes/users.router.js'
import productsRouter from './routes/products.router.js'
import mocksRouter from './routes/mocks.router.js'

import { errorMiddleware } from './middlewares/error.middleware.js'

const app = express()

app.use(express.json())

await mongoose.connect(config.mongoUri)
console.log('Mongo conectado')

// Rutas de la API
app.use('/api/orders', ordersRouter)
app.use('/api/users', usersRouter)
app.use('/api/products', productsRouter)
app.use('/api/mocks', mocksRouter)

// Middleware global de errores.
// Debe registrarse después de todas las rutas.
app.use(errorMiddleware)

app.listen(config.port, () => {
  console.log(`ShipNow en puerto ${config.port} (${config.nodeEnv})`)
})
