
import mongoose from 'mongoose'
import { CustomError } from '../errors/CustomError.js'
import { ERROR_DICTIONARY } from '../errors/error.dictionary.js'

export const errorMiddleware = (error, req, res, next) => {
  let statusCode = 500
  let code = 'INTERNAL_ERROR'
  let message = ERROR_DICTIONARY.INTERNAL_ERROR.message
  let details = null

  // Errores personalizados del dominio.
  if (error instanceof CustomError) {
    statusCode = error.statusCode
    code = error.code
    message = error.message
    details = error.details
  }

  // Identificador de MongoDB con formato inválido.
  else if (error instanceof mongoose.Error.CastError) {
    statusCode = ERROR_DICTIONARY.INVALID_ID.statusCode
    code = 'INVALID_ID'
    message = ERROR_DICTIONARY.INVALID_ID.message
  }

  // Error de validación de Mongoose.
  else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = ERROR_DICTIONARY.VALIDATION_ERROR.statusCode
    code = 'VALIDATION_ERROR'
    message = ERROR_DICTIONARY.VALIDATION_ERROR.message
    details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }))
  }

  // Error por clave duplicada en MongoDB.
  else if (error.code === 11000) {
    statusCode = ERROR_DICTIONARY.DUPLICATE_RESOURCE.statusCode
    code = 'DUPLICATE_RESOURCE'
    message = ERROR_DICTIONARY.DUPLICATE_RESOURCE.message
    details = {
      fields: Object.keys(error.keyPattern ?? {}),
    }
  }

  // Error de conexión u operación de MongoDB.
  else if (
    error instanceof mongoose.Error ||
    error.name === 'MongoServerError'
  ) {
    statusCode = ERROR_DICTIONARY.DATABASE_ERROR.statusCode
    code = 'DATABASE_ERROR'
    message = ERROR_DICTIONARY.DATABASE_ERROR.message
  }

  // Registrar errores inesperados del servidor.
  if (statusCode >= 500) {
    console.error('[ERROR]', error)
  }

  const response = {
    status: 'error',
    message,
    code,
  }

  if (details) {
    response.details = details
  }

  return res.status(statusCode).json(response)
}
