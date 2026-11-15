
import { expect } from 'chai'
import request from 'supertest'
import mongoose from 'mongoose'

import app from '../src/app.js'
import { config } from '../src/config/env.config.js'

import UserModel from '../src/models/user.model.js'
import StoreModel from '../src/models/store.model.js'
import OrderModel from '../src/models/order.model.js'
import DeliveryModel from '../src/models/delivery.model.js'

describe('Pruebas de integración - Mocks', function () {
  before(async function () {
    await mongoose.connect(config.mongoUri)
  })

  after(async function () {
    await UserModel.deleteMany({})
    await StoreModel.deleteMany({})
    await OrderModel.deleteMany({})
    await DeliveryModel.deleteMany({})
    await mongoose.disconnect()
  })

  beforeEach(async function () {
    await UserModel.deleteMany({})
    await StoreModel.deleteMany({})
    await OrderModel.deleteMany({})
    await DeliveryModel.deleteMany({})
  })

  describe('GET /api/mocks/users', function () {
    it('Debe generar usuarios ficticios correctamente', async function () {
      const response = await request(app)
        .get('/api/mocks/users?qty=3')

      expect(response.status).to.equal(200)
      expect(response.body.status).to.equal('success')
      expect(response.body.data).to.be.an('array')
      expect(response.body.data).to.have.lengthOf(3)
    })

    it('Debe generar un usuario por defecto', async function () {
      const response = await request(app)
        .get('/api/mocks/users')

      expect(response.status).to.equal(200)
      expect(response.body.data).to.have.lengthOf(1)
    })

    it('No debe guardar los usuarios generados en MongoDB', async function () {
      await request(app)
        .get('/api/mocks/users?qty=3')

      const users = await UserModel.find()

      expect(users).to.have.lengthOf(0)
    })

    it('Debe devolver 400 si la cantidad es inválida', async function () {
      const response = await request(app)
        .get('/api/mocks/users?qty=0')

      expect(response.status).to.equal(400)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('INVALID_MOCK_QTY')
    })
  })

  describe('GET /api/mocks/orders', function () {
    it('Debe generar pedidos ficticios correctamente', async function () {
      await StoreModel.create({
        name: 'Tienda de prueba',
        address: 'Viña del Mar',
      })

      const response = await request(app)
        .get('/api/mocks/orders?qty=3')

      expect(response.status).to.equal(200)
      expect(response.body.status).to.equal('success')
      expect(response.body.data).to.be.an('array')
      expect(response.body.data).to.have.lengthOf(3)
    })

    it('Debe devolver 400 si no existen tiendas', async function () {
      const response = await request(app)
        .get('/api/mocks/orders?qty=2')

      expect(response.status).to.equal(400)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('NO_STORES')
    })

    it('Debe devolver 400 si la cantidad es inválida', async function () {
      const response = await request(app)
        .get('/api/mocks/orders?qty=101')

      expect(response.status).to.equal(400)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('INVALID_MOCK_QTY')
    })
  })

  describe('GET /api/mocks/deliveries', function () {
    it('Debe generar entregas ficticias correctamente', async function () {
      await StoreModel.create({
        name: 'Tienda de prueba',
        address: 'Viña del Mar',
      })

      const response = await request(app)
        .get('/api/mocks/deliveries?qty=2')

      expect(response.status).to.equal(200)
      expect(response.body.status).to.equal('success')
      expect(response.body.data).to.be.an('array')
      expect(response.body.data).to.have.lengthOf(2)
    })

    it('Debe devolver 400 si no existen tiendas', async function () {
      const response = await request(app)
        .get('/api/mocks/deliveries?qty=2')

      expect(response.status).to.equal(400)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('NO_STORES')
    })

    it('Debe devolver 400 si la cantidad es inválida', async function () {
      const response = await request(app)
        .get('/api/mocks/deliveries?qty=abc')

      expect(response.status).to.equal(400)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('INVALID_MOCK_QTY')
    })
  })

  describe('POST /api/mocks/seed', function () {
    it('Debe insertar datos de prueba correctamente', async function () {
      const response = await request(app)
        .post('/api/mocks/seed')
        .send({ qty: 2 })

      expect(response.status).to.equal(201)
      expect(response.body.status).to.equal('success')

      expect(response.body.data.insertados.usuarios).to.equal(2)
      expect(response.body.data.insertados.conductores).to.equal(2)
      expect(response.body.data.insertados.pedidos).to.equal(2)
      expect(response.body.data.insertados.entregas).to.equal(2)
      expect(response.body.data.insertados.total).to.equal(8)

      expect(response.body.data.colecciones).to.be.an('array')

      const users = await UserModel.countDocuments()
      const stores = await StoreModel.countDocuments()
      const orders = await OrderModel.countDocuments()
      const deliveries = await DeliveryModel.countDocuments()

      expect(users).to.equal(4)
      expect(stores).to.equal(1)
      expect(orders).to.equal(2)
      expect(deliveries).to.equal(2)
    })

    it('Debe aceptar la cantidad mediante query string', async function () {
      const response = await request(app)
        .post('/api/mocks/seed?qty=3')

      expect(response.status).to.equal(201)
      expect(response.body.data.insertados.total).to.equal(12)
    })

    it('Debe devolver 400 si la cantidad es inválida', async function () {
      const response = await request(app)
        .post('/api/mocks/seed')
        .send({ qty: 0 })

      expect(response.status).to.equal(400)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('INVALID_MOCK_QTY')
    })
  })
})
