import express from 'express'
import mongoose from 'mongoose'
import { config } from './config/index.js'
import ordersRouter from './routes/orders.router.js'
import usersRouter from './routes/users.router.js'
import productsRouter from './routes/products.router.js'

const app = express()
app.use(express.json())

await mongoose.connect(config.mongoUri)
console.log('Mongo conectado')

app.use('/api/orders', ordersRouter)
app.use('/api/users', usersRouter)
app.use('/api/products', productsRouter)


 // Middleware de errores provisorio. En el Módulo 3 se reemplaza por la capa centralizada.
app.use((error, req, res, next) => {
  // Error por ID con formato inválido
  if (error.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'INVALID_ID',
        message: 'El id no es válido',
      },
    })
  }

  // Error de validación del modelo de Mongoose
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
      },
    })
  }

  // Otros errores
  const status = error.status || 500
  const code = status === 500 ? 'INTERNAL_ERROR' : error.message

  if (status === 500) {
    console.error(error)
  }

  return res.status(status).json({
    status: 'error',
    error: {
      code,
      message: error.message,
    },
  })
})

app.listen(config.port, () => {
  console.log(`ShipNow en puerto ${config.port} (${config.nodeEnv})`)
})
