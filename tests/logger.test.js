
import { expect } from 'chai'
import request from 'supertest'
import app from '../src/app.js'

describe('Logger API - Pruebas funcionales', () => {

  describe('GET /api/logger/test', () => {

    it('Debe ejecutar la prueba de Winston y responder HTTP 200', async () => {
      const response = await request(app)
        .get('/api/logger/test')

      expect(response.status).to.equal(200)
      expect(response.body.status).to.equal('success')
      expect(response.body.message).to.equal(
        'Prueba de los seis niveles de Winston ejecutada correctamente'
      )
    })

    it('Debe devolver una respuesta con status y message', async () => {
      const response = await request(app)
        .get('/api/logger/test')

      expect(response.body).to.have.all.keys('status', 'message')
    })

  })

})
