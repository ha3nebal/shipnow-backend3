import { logger } from '../logger/logger.js'

export const testLogger = (req, res) => {
  logger.debug('Prueba del nivel DEBUG')
  logger.http('Prueba del nivel HTTP')
  logger.info('Prueba del nivel INFO')
  logger.warning('Prueba del nivel WARNING')
  logger.error('Prueba del nivel ERROR')
  logger.fatal('Prueba del nivel FATAL')

  return res.status(200).json({
    status: 'success',
    message: 'Prueba de los seis niveles de Winston ejecutada correctamente',
  })
}