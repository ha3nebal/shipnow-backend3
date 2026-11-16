
import { unlink } from 'node:fs/promises'
import { usersRepository } from '../repositories/users.repository.js'
import { storesRepository } from '../repositories/stores.repository.js'
import { CustomError } from '../errors/CustomError.js'
import { USER_ROLES, DOCUMENT_TYPES } from '../constants/index.js'
import { logger } from '../logger/logger.js'

const removeUploadedFile = async (file) => {
  if (!file?.path) return

  try {
    await unlink(file.path)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }
}

export const usersService = {
  createUser: async (data) => {
    const email =
      typeof data?.email === 'string'
        ? data.email.trim().toLowerCase()
        : ''

    if (!email) {
      throw new CustomError('EMAIL_REQUIRED')
    }

    const existingUser = await usersRepository.findByEmail(email)

    if (existingUser) {
      throw new CustomError('USER_EMAIL_ALREADY_EXISTS')
    }

    return usersRepository.create({
      ...data,
      email,
      role: USER_ROLES.CUSTOMER,
    })
  },

  uploadUserDocument: async (id, file, documentType) => {
    try {
      // Comprobar que se haya adjuntado un archivo.
      if (!file) {
        throw new CustomError('FILE_REQUIRED')
      }

      // Validar el tipo de documento.
      if (!Object.values(DOCUMENT_TYPES).includes(documentType)) {
        throw new CustomError('INVALID_DOCUMENT_TYPE')
      }

      // Comprobar que el usuario exista.
      const user = await usersRepository.findById(id)

      if (!user) {
        throw new CustomError('USER_NOT_FOUND')
      }

      // Preparar los metadatos del archivo.
      const document = {
        originalName: file.originalname,
        generatedName: file.filename,
        path: file.path.replace(/\\/g, '/'),
        mimeType: file.mimetype,
        size: file.size,
        documentType,
        uploadedAt: new Date(),
      }

      // Guardar los metadatos en MongoDB.
      const updatedUser = await usersRepository.addDocument(id, document)

      if (!updatedUser) {
        throw new CustomError('USER_NOT_FOUND')
      }

      logger.info(`Documento asociado correctamente al usuario ${id}`)

      return updatedUser
    } catch (error) {
      // Eliminar el archivo si falló alguna operación.
      try {
        await removeUploadedFile(file)
      } catch (cleanupError) {
        logger.error(`No se pudo eliminar el archivo ${file?.path}: ${cleanupError.message}`)
      }

      throw error
    }
  },

  getUsers: () => usersRepository.findAll(),

  createStore: (data) => storesRepository.create(data),
}
