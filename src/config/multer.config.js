
import multer from 'multer'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { CustomError } from '../errors/CustomError.js'

// Directorio principal de almacenamiento.
const uploadsDirectory = path.resolve(process.cwd(), 'uploads')

// Carpetas permitidas para cada categoría.
const uploadDirectories = {
  users: path.join(uploadsDirectory, 'users'),
  orders: path.join(uploadsDirectory, 'orders'),
}

// Tipos MIME y extensiones permitidas.
const allowedMimeTypes = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
}

// Tamaño máximo: 5 MB.
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Configuración del almacenamiento físico.
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const directory = uploadDirectories[req.uploadCategory]

    if (!directory) {
      return callback(new CustomError('UPLOAD_SAVE_FAILED'))
    }

    try {
      mkdirSync(directory, { recursive: true })
      callback(null, directory)
    } catch (error) {
      callback(new CustomError('UPLOAD_SAVE_FAILED'))
    }
  },

  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase()
    const generatedName = `${randomUUID()}${extension}`

    callback(null, generatedName)
  },
})

// Validación del tipo de archivo.
const fileFilter = (req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase()
  const allowedExtensions = allowedMimeTypes[file.mimetype]

  if (!allowedExtensions || !allowedExtensions.includes(extension)) {
    return callback(new CustomError('INVALID_FILE_TYPE'))
  }

  callback(null, true)
}

// Instancia centralizada de Multer.
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
})

export { MAX_FILE_SIZE, allowedMimeTypes }
