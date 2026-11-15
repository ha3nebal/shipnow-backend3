
import { expect } from 'chai'
import request from 'supertest'
import app from '../src/app.js'

describe('Rutas inexistentes - Manejo de errores', () => {

  it('Debe devolver HTTP 404 cuando se solicita una ruta inexistente', async () => {
    const response = await request(app)
      .get('/api/ruta-inexistente')

    expect(response.status).to.equal(404)
    expect(response.body.status).to.equal('error')
    expect(response.body.code).to.equal('ROUTE_NOT_FOUND')
    expect(response.body.message).to.equal(
      'La ruta solicitada no existe'
    )
  })

})
