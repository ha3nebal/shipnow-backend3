
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
    it('Debe devolver pedidos con paginación predeterminada', async function () {
      await OrderModel.create(
        Array.from({ length: 12 }, (_, index) => ({
          userId: user._id,
          storeId: store._id,
          address: `Dirección ${index + 1}`,
          items: [
            {
              name: 'Producto de prueba',
              price: 5000,
              quantity: 1,
            },
          ],
          total: 5000,
        })),
      )

      const response = await request(app)
        .get('/api/orders')

      expect(response.status).to.equal(200)
      expect(response.body.status).to.equal('success')
      expect(response.body.payload).to.be.an('array')
      expect(response.body.payload).to.have.lengthOf(10)

      expect(response.body.pagination).to.deep.equal({
        totalOrders: 12,
        totalPages: 2,
        currentPage: 1,
        limit: 10,
      })
    })

it('No debe exponer rutas internas de comprobantes antiguos', async function () {
  // Insertar directamente en MongoDB un pedido antiguo
  // que todavía contiene una ruta absoluta.
  const legacyOrder = {
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
    receipt: {
      originalName: 'comprobante.pdf',
      generatedName: 'comprobante-123.pdf',
      path: 'C:/Users/aniba/shipnow/uploads/orders/comprobante-123.pdf',
      mimeType: 'application/pdf',
      size: 25000,
      uploadedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const insertedOrder = await OrderModel.collection.insertOne(legacyOrder)

  // Consultar todos los pedidos.
  const listResponse = await request(app)
    .get('/api/orders')

  expect(listResponse.status).to.equal(200)

  const orderInList = listResponse.body.payload.find(
    (order) => order._id === insertedOrder.insertedId.toString(),
  )

  expect(orderInList).to.exist
  expect(orderInList.receipt).to.exist
  expect(orderInList.receipt).not.to.have.property('path')
  expect(orderInList.receipt.originalName).to.equal('comprobante.pdf')
  expect(orderInList.receipt.generatedName).to.equal('comprobante-123.pdf')

  // Consultar el mismo pedido individualmente.
  const detailResponse = await request(app)
    .get(`/api/orders/${insertedOrder.insertedId}`)

  expect(detailResponse.status).to.equal(200)
  expect(detailResponse.body.payload.receipt).to.exist
  expect(detailResponse.body.payload.receipt).not.to.have.property('path')
})

    it('Debe permitir consultar la segunda página', async function () {
      await OrderModel.create(
        Array.from({ length: 12 }, (_, index) => ({
          userId: user._id,
          storeId: store._id,
          address: `Dirección ${index + 1}`,
          items: [
            {
              name: 'Producto de prueba',
              price: 5000,
              quantity: 1,
            },
          ],
          total: 5000,
        })),
      )

      const response = await request(app)
        .get('/api/orders?page=2&limit=5')

      expect(response.status).to.equal(200)
      expect(response.body.payload).to.have.lengthOf(5)
      expect(response.body.pagination).to.deep.equal({
        totalOrders: 12,
        totalPages: 3,
        currentPage: 2,
        limit: 5,
      })
    })

    it('Debe filtrar pedidos por estado', async function () {
      await OrderModel.create([
        {
          userId: user._id,
          storeId: store._id,
          address: 'Dirección 1',
          items: [{ name: 'Producto', price: 5000, quantity: 1 }],
          total: 5000,
          status: ORDER_STATUS.PENDING,
        },
        {
          userId: user._id,
          storeId: store._id,
          address: 'Dirección 2',
          items: [{ name: 'Producto', price: 5000, quantity: 1 }],
          total: 5000,
          status: ORDER_STATUS.PENDING,
        },
        {
          userId: user._id,
          storeId: store._id,
          address: 'Dirección 3',
          items: [{ name: 'Producto', price: 5000, quantity: 1 }],
          total: 5000,
          status: ORDER_STATUS.DELIVERED,
        },
      ])

      const response = await request(app)
        .get(`/api/orders?status=${ORDER_STATUS.PENDING}`)

      expect(response.status).to.equal(200)
      expect(response.body.payload).to.have.lengthOf(2)
      expect(response.body.pagination.totalOrders).to.equal(2)

      response.body.payload.forEach((order) => {
        expect(order.status).to.equal(ORDER_STATUS.PENDING)
      })
    })

    it('Debe filtrar pedidos por prioridad', async function () {
      await OrderModel.create([
        {
          userId: user._id,
          storeId: store._id,
          address: 'Dirección 1',
          items: [{ name: 'Producto', price: 5000, quantity: 1 }],
          total: 5000,
          priority: ORDER_PRIORITY.HIGH,
        },
        {
          userId: user._id,
          storeId: store._id,
          address: 'Dirección 2',
          items: [{ name: 'Producto', price: 5000, quantity: 1 }],
          total: 5000,
          priority: ORDER_PRIORITY.HIGH,
        },
        {
          userId: user._id,
          storeId: store._id,
          address: 'Dirección 3',
          items: [{ name: 'Producto', price: 5000, quantity: 1 }],
          total: 5000,
          priority: ORDER_PRIORITY.LOW,
        },
      ])

      const response = await request(app)
        .get(`/api/orders?priority=${ORDER_PRIORITY.HIGH}`)

      expect(response.status).to.equal(200)
      expect(response.body.payload).to.have.lengthOf(2)
      expect(response.body.pagination.totalOrders).to.equal(2)

      response.body.payload.forEach((order) => {
        expect(order.priority).to.equal(ORDER_PRIORITY.HIGH)
      })
    })

    it('Debe devolver 400 si el límite supera los 100 pedidos', async function () {
      const response = await request(app)
        .get('/api/orders?limit=101')

      expect(response.status).to.equal(400)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('VALIDATION_ERROR')
    })

    it('Debe devolver 400 si el estado es inválido', async function () {
      const response = await request(app)
        .get('/api/orders?status=invalid')

      expect(response.status).to.equal(400)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('VALIDATION_ERROR')
    })

    it('Debe devolver 400 si la prioridad es inválida', async function () {
      const response = await request(app)
        .get('/api/orders?priority=invalid')

      expect(response.status).to.equal(400)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('VALIDATION_ERROR')
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

    it('Debe rechazar artículos sin precio', async function () {
      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: user._id.toString(),
          storeId: store._id.toString(),
          address: 'Avenida Libertad 123',
          items: [
            {
              name: 'Producto sin precio',
              quantity: 2,
            },
          ],
        })

      expect(response.status).to.equal(400)
      expect(response.body.code).to.equal('VALIDATION_ERROR')
    })

    it('Debe rechazar cantidades iguales a cero o negativas', async function () {
      for (const quantity of [0, -1]) {
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
                quantity,
              },
            ],
          })

        expect(response.status).to.equal(400)
        expect(response.body.code).to.equal('VALIDATION_ERROR')
      }
    })

    it('Debe rechazar precios que no sean números válidos', async function () {
      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: user._id.toString(),
          storeId: store._id.toString(),
          address: 'Avenida Libertad 123',
          items: [
            {
              name: 'Producto de prueba',
              price: 'precio inválido',
              quantity: 1,
            },
          ],
        })

      expect(response.status).to.equal(400)
      expect(response.body.code).to.equal('VALIDATION_ERROR')
    })

    it('Debe rechazar artículos sin nombre', async function () {
      const response = await request(app)
        .post('/api/orders')
        .send({
          userId: user._id.toString(),
          storeId: store._id.toString(),
          address: 'Avenida Libertad 123',
          items: [
            {
              name: '',
              price: 5000,
              quantity: 1,
            },
          ],
        })

      expect(response.status).to.equal(400)
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
