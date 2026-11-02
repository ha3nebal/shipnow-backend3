
import { usersRepository } from '../repositories/users.repository.js'
import { storesRepository } from '../repositories/stores.repository.js'
import { CustomError } from '../errors/CustomError.js'

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
    })
  },

  getUsers: () => usersRepository.findAll(),

  createStore: (data) => storesRepository.create(data),
}
