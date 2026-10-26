
import UserModel from '../models/user.model.js'
import StoreModel from '../models/store.model.js'
import OrderModel from '../models/order.model.js'
import DeliveryModel from '../models/delivery.model.js'

export const mocksRepository = {
  insertUsers: (users) => UserModel.insertMany(users),
  insertStores: (stores) => StoreModel.insertMany(stores),
  insertOrders: (orders) => OrderModel.insertMany(orders),
  insertDeliveries: (deliveries) => DeliveryModel.insertMany(deliveries),
}