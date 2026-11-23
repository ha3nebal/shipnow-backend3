
import { expect } from 'chai'
import request from 'supertest'
import app from '../src/app.js'

describe('Logger API - Pruebas funcionales', () => {
  describe('GET /api/loggerTest', () => {
    it('Debe ejecutar Winston y validar status, keys y message', async () => {
      const response = await request(app)
        .get('/api/loggerTest')

      expect(response.status).to.equal(200)

      expect(response.body).to.have.all.keys(
        'status',
        'message'
      )

      expect(response.body.status).to.equal('success')

      expect(response.body.message).to.equal(
        'Prueba de los seis niveles de Winston ejecutada correctamente'
      )
    })
  })
})
