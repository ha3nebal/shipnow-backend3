
import UserModel from '../models/user.model.js'

export const usersRepository = {
  create: (data) => UserModel.create(data),

  findById: (id) => UserModel.findById(id).lean(),

  findByEmail: (email) =>
    UserModel.findOne({ email }).lean(),

  addDocument: (id, document) =>
    UserModel.findByIdAndUpdate(
      id,
      { $push: { documents: document } },
      { new: true, runValidators: true },
    ).lean(),

  findAll: () => UserModel.find().lean(),
}
