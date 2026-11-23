
import { expect } from 'chai'
import request from 'supertest'
import mongoose from 'mongoose'
import { mkdir, readdir, unlink } from 'node:fs/promises'
import path from 'node:path'

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
    it('Debe devolver usuarios con paginación predeterminada', async function () {
      const users = Array.from({ length: 12 }, (_, index) => ({
        name: `Usuario ${index + 1}`,
        email: `usuario${index + 1}@shipnow.cl`,
        role: USER_ROLES.CUSTOMER,
      }))

      await UserModel.insertMany(users)

      const response = await request(app)
        .get('/api/users')

      expect(response.status).to.equal(200)
      expect(response.body.status).to.equal('success')
      expect(response.body.payload).to.be.an('array')
      expect(response.body.payload).to.have.lengthOf(10)

      expect(response.body.pagination).to.deep.equal({
        totalUsers: 12,
        totalPages: 2,
        currentPage: 1,
        limit: 10,
      })
    })

    it('Debe permitir consultar la segunda página', async function () {
      const users = Array.from({ length: 12 }, (_, index) => ({
        name: `Usuario ${index + 1}`,
        email: `usuario${index + 1}@shipnow.cl`,
        role: USER_ROLES.CUSTOMER,
      }))

      await UserModel.insertMany(users)

      const response = await request(app)
        .get('/api/users?page=2&limit=5')

      expect(response.status).to.equal(200)
      expect(response.body.payload).to.have.lengthOf(5)
      expect(response.body.pagination.currentPage).to.equal(2)
      expect(response.body.pagination.limit).to.equal(5)
    })

    it('Debe filtrar usuarios por rol', async function () {
      await UserModel.insertMany([
        {
          name: 'Cliente 1',
          email: 'cliente1@shipnow.cl',
          role: USER_ROLES.CUSTOMER,
        },
        {
          name: 'Conductor 1',
          email: 'conductor1@shipnow.cl',
          role: USER_ROLES.DRIVER,
        },
        {
          name: 'Conductor 2',
          email: 'conductor2@shipnow.cl',
          role: USER_ROLES.DRIVER,
        },
      ])

      const response = await request(app)
        .get('/api/users?role=driver')

      expect(response.status).to.equal(200)
      expect(response.body.payload).to.have.lengthOf(2)

      response.body.payload.forEach((user) => {
        expect(user.role).to.equal(USER_ROLES.DRIVER)
      })

      expect(response.body.pagination.totalUsers).to.equal(2)
    })

    it('No debe exponer documentos privados en el listado', async function () {
      await UserModel.create({
        name: 'Usuario con documento',
        email: 'documento@shipnow.cl',
        role: USER_ROLES.CUSTOMER,
        documents: [
          {
            originalName: 'identidad.pdf',
            generatedName: 'archivo-generado.pdf',
            path: '/ruta/privada/identidad.pdf',
            mimeType: 'application/pdf',
            size: 1024,
            documentType: 'identity',
          },
        ],
      })

      const response = await request(app)
        .get('/api/users')

      expect(response.status).to.equal(200)
      expect(response.body.payload).to.have.lengthOf(1)
      expect(response.body.payload[0]).to.not.have.property('documents')
      expect(response.body.payload[0]).to.not.have.property('path')
    })

    it('Debe devolver 400 si el límite supera los 100 usuarios', async function () {
      const response = await request(app)
        .get('/api/users?limit=101')

      expect(response.status).to.equal(400)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('VALIDATION_ERROR')
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

  describe('POST /api/users/:id/documents', function () {
    it('Debe cargar correctamente un documento PDF', async function () {
      const user = await UserModel.create({
        name: 'Usuario con documento',
        email: 'upload@shipnow.cl',
        role: USER_ROLES.CUSTOMER,
      })

      const response = await request(app)
        .post(`/api/users/${user._id}/documents`)
        .field('documentType', 'identity')
        .attach('file', Buffer.from('%PDF-1.4 documento de prueba'), {
          filename: 'identidad.pdf',
          contentType: 'application/pdf',
        })

      expect(response.status).to.equal(200)
      expect(response.body.status).to.equal('success')
      expect(response.body.payload.documents).to.be.an('array')
      expect(response.body.payload.documents).to.have.lengthOf(1)
      expect(response.body.payload.documents[0].originalName)
        .to.equal('identidad.pdf')

      const uploadedPath = response.body.payload.documents[0].path
      await unlink(uploadedPath)
    })

    it('Debe rechazar archivos con extensiones no permitidas', async function () {
      const user = await UserModel.create({
        name: 'Usuario de prueba',
        email: 'invalid@shipnow.cl',
        role: USER_ROLES.CUSTOMER,
      })

      const response = await request(app)
        .post(`/api/users/${user._id}/documents`)
        .field('documentType', 'identity')
        .attach('file', Buffer.from('archivo no permitido'), {
          filename: 'documento.txt',
          contentType: 'text/plain',
        })

      expect(response.status).to.equal(400)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('INVALID_FILE_TYPE')
    })

    it('Debe rechazar archivos superiores a 5 MB', async function () {
      const user = await UserModel.create({
        name: 'Usuario de prueba',
        email: 'large@shipnow.cl',
        role: USER_ROLES.CUSTOMER,
      })

      const largeFile = Buffer.alloc(5 * 1024 * 1024 + 1)

      const response = await request(app)
        .post(`/api/users/${user._id}/documents`)
        .field('documentType', 'identity')
        .attach('file', largeFile, {
          filename: 'documento.pdf',
          contentType: 'application/pdf',
        })

      expect(response.status).to.equal(413)
      expect(response.body.status).to.equal('error')
      expect(response.body.code).to.equal('FILE_TOO_LARGE')
    })

    it('Debe eliminar el archivo si el usuario no existe', async function () {
      const uploadsDirectory = path.resolve(
        process.cwd(),
        config.uploadsDir,
        'users',
      )

      await mkdir(uploadsDirectory, { recursive: true })

      const filesBefore = await readdir(uploadsDirectory)

      const response = await request(app)
        .post(`/api/users/${new mongoose.Types.ObjectId()}/documents`)
        .field('documentType', 'identity')
        .attach('file', Buffer.from('%PDF-1.4 documento de prueba'), {
          filename: 'identidad.pdf',
          contentType: 'application/pdf',
        })

      const filesAfter = await readdir(uploadsDirectory)

      expect(response.status).to.equal(404)
      expect(response.body.code).to.equal('USER_NOT_FOUND')
      expect(filesAfter).to.have.lengthOf(filesBefore.length)
    })
  })
})
