
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from '../config/env.config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const logsDirectory = path.resolve(__dirname, '../../logs')

// Niveles personalizados de Winston.
// Cuanto menor sea el número, mayor es la prioridad.
const customLevels = {
  fatal: 0,
  error: 1,
  warning: 2,
  info: 3,
  http: 4,
  debug: 5,
}

// Colores para visualizar los niveles en consola.
winston.addColors({
  fatal: 'magenta',
  error: 'red',
  warning: 'yellow',
  info: 'green',
  http: 'cyan',
  debug: 'blue',
})

// Formato común: fecha, nivel y mensaje.
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}] ${stack || message}`
  }),
)

// Configuración del nivel según el entorno.
const consoleLevel =
  config.nodeEnv === 'development' ? 'debug' : 'info'

// Logger centralizado.
export const logger = winston.createLogger({
  levels: customLevels,
  level: 'debug',
  format: logFormat,
  transports: [
    // Salida por consola.
    new winston.transports.Console({
      level: consoleLevel,
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        logFormat,
      ),
    }),

    // Archivo general con rotación diaria.
    new DailyRotateFile({
      filename: path.join(logsDirectory, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '14d',
      level: 'debug',
    }),

    // Archivo exclusivo para errores y fallas críticas.
    new DailyRotateFile({
      filename: path.join(logsDirectory, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '30d',
      level: 'error',
    }),
  ],
  exitOnError: false,
})
