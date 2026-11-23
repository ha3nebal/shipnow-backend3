
import { expect } from 'chai'
import request from 'supertest'
import app from '../src/app.js'

describe('Health Check API - Pruebas funcionales', () => {
  describe('GET /api/health', () => {
    it('Debe responder HTTP 200 con el estado y los datos del servidor', async () => {
      const response = await request(app)
        .get('/api/health')

      expect(response.status).to.equal(200)

      expect(response.body).to.have.all.keys(
        'status',
        'data'
      )

      expect(response.body.status).to.equal('success')

      expect(response.body.data).to.have.all.keys(
        'status',
        'environment',
        'uptime',
        'timestamp'
      )

      expect(response.body.data.status).to.equal('ok')
      expect(response.body.data.environment).to.equal('test')
      expect(response.body.data.uptime).to.be.a('number')
      expect(response.body.data.uptime).to.be.at.least(0)

      expect(
        new Date(response.body.data.timestamp).toISOString()
      ).to.equal(response.body.data.timestamp)
    })
  })
})
