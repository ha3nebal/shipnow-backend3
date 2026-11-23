
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

  findAll: async ({ page, limit, role }) => {
    const filter = {}

    if (role) {
      filter.role = role
    }

    const skip = (page - 1) * limit

    const [users, totalUsers] = await Promise.all([
      UserModel.find(filter)
        .select('-documents')
        .sort({ _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      UserModel.countDocuments(filter),
    ])

    return {
      users,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        limit,
      },
    }
  },
}
