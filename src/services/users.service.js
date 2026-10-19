
import { usersRepository } from '../repositories/users.repository.js'
import { storesRepository } from '../repositories/stores.repository.js'

const badRequest = (message) =>
  Object.assign(new Error(message), { status: 400 })

const conflict = (message) =>
  Object.assign(new Error(message), { status: 409 })

export const usersService = {
  createUser: async (data) => {
    const email =
      typeof data?.email === 'string'
        ? data.email.trim().toLowerCase()
        : ''

    if (!email) {
      throw badRequest('EMAIL_REQUIRED')
    }

    const existingUser = await usersRepository.findByEmail(email)

    if (existingUser) {
      throw conflict('USER_EMAIL_ALREADY_EXISTS')
    }

    return usersRepository.create({
      ...data,
      email,
    })
  },

  getUsers: () => usersRepository.findAll(),

  createStore: (data) => storesRepository.create(data),
}
