
import dotenv from 'dotenv'

dotenv.config()

const required = ['MONGODB_URI', 'JWT_SECRET', 'PORT', 'NODE_ENV']

for (const name of required) {
  if (!process.env[name]?.trim()) {
    throw new Error(
      `[CONFIG ERROR] Falta la variable de entorno obligatoria: ${name}`
    )
  }
}

const port = Number(process.env.PORT)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(
    '[CONFIG ERROR] PORT debe ser un número entero entre 1 y 65535'
  )
}

const validEnvironments = ['development', 'production', 'test']

if (!validEnvironments.includes(process.env.NODE_ENV)) {
  throw new Error(
    '[CONFIG ERROR] NODE_ENV debe ser development, production o test'
  )
}

export const config = Object.freeze({
  port,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV,
})
