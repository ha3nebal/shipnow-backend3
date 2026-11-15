
import { expect } from 'chai'
import request from 'supertest'
import app from '../src/app.js'

describe('Swagger API - Documentación', () => {

  describe('GET /api/docs/', () => {

    it('Debe mostrar la documentación Swagger correctamente', async () => {
      const response = await request(app)
        .get('/api/docs/')

      expect(response.status).to.equal(200)
      expect(response.headers['content-type']).to.include('text/html')
      expect(response.text).to.include('swagger-ui')
    })

  })

})
