
import { expect } from 'chai'
import request from 'supertest'
import mongoose from 'mongoose'

import app from '../src/app.js'
import { config } from '../src/config/env.config.js'

import UserModel from '../src/models/user.model.js'
import StoreModel from '../src/models/store.model.js'
import OrderModel from '../src/models/order.model.js'

import { ORDER_STATUS, ORDER_PRIORITY } from '../src/constants/index.js'

describe('Pruebas de integración - Pedidos', function () {
  let user
  let store

  before(async function () {
    await mongoose.connect(config.mongoUri)
  })

  after(async function () {
    await OrderModel.deleteMany({})
    await UserModel.deleteMany({})
    await StoreModel.deleteMany({})
    await mongoose.disconnect()
  })

  beforeEach(async function () {
    await OrderModel.deleteMany({})
    await UserModel.deleteMany({})
    await StoreModel.deleteMany({})

    user = await UserModel.create({
      name: 'Usuario de prueba',
      email: 'orders-test@shipnow.cl',
    })

    store = await StoreModel.create({
      name: 'Tienda de prueba',
      address: 'Viña del Mar',
    })
  })

  describe('GET /api/orders', function () {
    it('Debe devolver 200 y un arreglo de pedidos', async function () {
      const response = await request(app)
        .get('/api/orders')

      expect(response.status).to.equal(200)
      expect(response.body.status).to.equal('success')
      expect(response.body.payload).to.be.an('array')
      expect(response.body.payload).to.have.lengthOf(0)
    })
  })

  describe('POST /api/orders', function () {
    it('Debe crear un pedido y calcular el total correctamente', async function () {
      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: user._id.toString(),
          storeId: store._id.toString(),
          address: 'Avenida Libertad 123',
          items: [
            {
              name: 'Producto de prueba',
              price: 5000,
              quantity: 2,
            },
          ],
        })

      expect(response.status).to.equal(201)
      expect(response.body.status).to.equal('success')
      expect(response.body.payload).to.have.property('_id')
      expect(response.body.payload.total).to.equal(10000)
      expect(response.body.payload.status).to.equal(ORDER_STATUS.PENDING)
      expect(response.body.payload.priority).to.equal(ORDER_PRIORITY.MEDIUM)
    })

    it('Debe devolver 404 si el usuario no existe', async function () {
      const fakeUserId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: fakeUserId.toString(),
          storeId: store._id.toString(),
          address: 'Avenida Libertad 123',
          items: [
            {
              name: 'Producto de prueba',
              price: 5000,
              quantity: 1,
            },
          ],
        })

      expect(response.status).to.equal(404)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('USER_NOT_FOUND')
    })

    it('Debe devolver 404 si la tienda no existe', async function () {
      const fakeStoreId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: user._id.toString(),
          storeId: fakeStoreId.toString(),
          address: 'Avenida Libertad 123',
          items: [
            {
              name: 'Producto de prueba',
              price: 5000,
              quantity: 1,
            },
          ],
        })

      expect(response.status).to.equal(404)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('STORE_NOT_FOUND')
    })

    it('Debe devolver 400 si faltan datos obligatorios', async function () {
      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: user._id.toString(),
          storeId: store._id.toString(),
        })

      expect(response.status).to.equal(400)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('VALIDATION_ERROR')
    })
  })

  describe('GET /api/orders/:id', function () {
    it('Debe devolver un pedido por su ID', async function () {
      const order = await OrderModel.create({
        userId: user._id,
        storeId: store._id,
        address: 'Avenida Libertad 123',
        items: [
          {
            name: 'Producto de prueba',
            price: 5000,
            quantity: 2,
          },
        ],
        total: 10000,
      })

      const response = await request(app)
        .get(`/api/orders/${order._id}`)

      expect(response.status).to.equal(200)
      expect(response.body.status).to.equal('success')
      expect(response.body.payload._id).to.equal(order._id.toString())
    })

    it('Debe devolver 404 si el pedido no existe', async function () {
      const fakeOrderId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .get(`/api/orders/${fakeOrderId}`)

      expect(response.status).to.equal(404)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('ORDER_NOT_FOUND')
    })

    it('Debe devolver 400 si el ID es inválido', async function () {
      const response = await request(app)
        .get('/api/orders/id-invalido')

      expect(response.status).to.equal(400)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('INVALID_ID')
    })
  })

  describe('PATCH /api/orders/:id/deliver', function () {
    it('Debe marcar un pedido como entregado', async function () {
      const order = await OrderModel.create({
        userId: user._id,
        storeId: store._id,
        address: 'Avenida Libertad 123',
        items: [
          {
            name: 'Producto de prueba',
            price: 5000,
            quantity: 1,
          },
        ],
        total: 5000,
        status: ORDER_STATUS.PENDING,
      })

      const response = await request(app)
        .patch(`/api/orders/${order._id}/deliver`)

      expect(response.status).to.equal(200)
      expect(response.body.status).to.equal('success')
      expect(response.body.payload.status).to.equal(ORDER_STATUS.DELIVERED)
    })

    it('Debe devolver 400 si el pedido ya fue entregado', async function () {
      const order = await OrderModel.create({
        userId: user._id,
        storeId: store._id,
        address: 'Avenida Libertad 123',
        items: [
          {
            name: 'Producto de prueba',
            price: 5000,
            quantity: 1,
          },
        ],
        total: 5000,
        status: ORDER_STATUS.DELIVERED,
      })

      const response = await request(app)
        .patch(`/api/orders/${order._id}/deliver`)

      expect(response.status).to.equal(400)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('ORDER_ALREADY_DELIVERED')
    })
  })
})
