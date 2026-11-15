
import { expect } from 'chai'
import request from 'supertest'
import mongoose from 'mongoose'

import app from '../src/app.js'
import { config } from '../src/config/env.config.js'
import UserModel from '../src/models/user.model.js'
import { USER_ROLES } from '../src/constants/index.js'

describe('Pruebas de integración - Usuarios', function () {
  before(async function () {
    await mongoose.connect(config.mongoUri)
  })

  after(async function () {
    await UserModel.deleteMany({})
    await mongoose.disconnect()
  })

  beforeEach(async function () {
    await UserModel.deleteMany({})
  })

  describe('GET /api/users', function () {
    it('Debe devolver 200 y un arreglo de usuarios', async function () {
      const response = await request(app)
        .get('/api/users')

      expect(response.status).to.equal(200)
      expect(response.body.status).to.equal('success')
      expect(response.body.payload).to.be.an('array')
      expect(response.body.payload).to.have.lengthOf(0)
    })
  })

  describe('POST /api/users', function () {
    it('Debe crear un usuario correctamente', async function () {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Usuario de prueba',
          email: 'test@shipnow.cl',
        })

      expect(response.status).to.equal(201)
      expect(response.body.status).to.equal('success')
      expect(response.body.payload).to.have.property('_id')
      expect(response.body.payload.name).to.equal('Usuario de prueba')
      expect(response.body.payload.email).to.equal('test@shipnow.cl')
      expect(response.body.payload.role).to.equal(USER_ROLES.CUSTOMER)
    })

    it('Debe normalizar el correo electrónico', async function () {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Usuario de prueba',
          email: '  TEST@SHIPNOW.CL  ',
        })

      expect(response.status).to.equal(201)
      expect(response.body.payload.email).to.equal('test@shipnow.cl')
    })

    it('No debe permitir modificar el rol desde el registro', async function () {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Usuario de prueba',
          email: 'test@shipnow.cl',
          role: USER_ROLES.ADMIN,
        })

      expect(response.status).to.equal(201)
      expect(response.body.payload.role).to.equal(USER_ROLES.CUSTOMER)
    })

    it('Debe devolver 400 si falta el correo electrónico', async function () {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Usuario sin correo',
        })

      expect(response.status).to.equal(400)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('EMAIL_REQUIRED')
    })

    it('Debe devolver 400 si falta el nombre', async function () {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@shipnow.cl',
        })

      expect(response.status).to.equal(400)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('VALIDATION_ERROR')
    })

    it('Debe devolver 409 si el correo ya está registrado', async function () {
      await request(app)
        .post('/api/users')
        .send({
          name: 'Primer usuario',
          email: 'test@shipnow.cl',
        })

      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Segundo usuario',
          email: 'test@shipnow.cl',
        })

      expect(response.status).to.equal(409)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('USER_EMAIL_ALREADY_EXISTS')
    })
  })
})
