
import { ERROR_DICTIONARY } from './error.dictionary.js'

export class CustomError extends Error {
  constructor(code, details = null) {
    const errorDefinition = ERROR_DICTIONARY[code]

    if (!errorDefinition) {
      throw new Error(`Código de error no definido: ${code}`)
    }

    super(errorDefinition.message)

    this.name = 'CustomError'
    this.code = code
    this.statusCode = errorDefinition.statusCode
    this.details = details
    this.isOperational = true

    Error.captureStackTrace?.(this, CustomError)
  }
}
