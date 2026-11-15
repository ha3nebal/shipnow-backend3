
import mongoose from 'mongoose'

import app from './app.js'
import { config } from './config/env.config.js'
import { logger } from './logger/logger.js'

// Conexión a MongoDB e inicio del servidor.
try {
  await mongoose.connect(config.mongoUri)

  logger.info('Conexión a MongoDB establecida')

  app.listen(config.port, () => {
    logger.info(
      `Servidor ShipNow escuchando en el puerto ${config.port} (${config.nodeEnv})`,
    )
  })
} catch (error) {
  logger.fatal(
    'No fue posible conectar con MongoDB: %s',
    error.message,
  )

  process.exit(1)
}
