
import ProductModel from '../models/product.model.js'

export const productsRepository = {
  create: (data) => ProductModel.create(data),

  findById: (id, projection = {}) =>
    ProductModel.findById(id, projection).lean(),

  findAll: (filter = {}, projection = {}) =>
    ProductModel.find(filter, projection)
      .sort({ createdAt: -1 })
      .lean(),

  updateById: (id, data) =>
    ProductModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean(),

  deleteById: (id) => ProductModel.findByIdAndDelete(id).lean(),
}
