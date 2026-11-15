import dotenv from 'dotenv'

// Seleccionar el archivo de entorno según NODE_ENV.
const envFile = process.env.NODE_ENV === 'test'
  ? '.env.test'
  : '.env'

const result = dotenv.config({ path: envFile })

// En testing, el archivo .env.test debe existir.
if (process.env.NODE_ENV === 'test' && result.error) {
  throw new Error(
    '[CONFIG ERROR] No se pudo cargar el archivo .env.test'
  )
}

// Validar variables obligatorias.
const required = ['MONGODB_URI', 'PORT', 'NODE_ENV']

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

const mongoUri = process.env.MONGODB_URI

// Evitar que las pruebas se conecten a la base de datos de desarrollo.
if (process.env.NODE_ENV === 'test') {
  const databaseName = new URL(mongoUri).pathname
    .replace(/^\/+/, '')
    .split('/')[0]

  if (databaseName !== 'shipnow_test') {
    throw new Error(
      '[CONFIG ERROR] Las pruebas deben utilizar la base de datos shipnow_test'
    )
  }
}

export const config = Object.freeze({
  port,
  mongoUri,
  nodeEnv: process.env.NODE_ENV,
})