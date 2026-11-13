
import { Router } from 'express'
import { mocksController } from '../controllers/mocks.controller.js'

const router = Router()

/**
 * @swagger
 * /api/mocks/users:
 *   get:
 *     summary: Generar usuarios ficticios
 *     description: Genera usuarios de prueba sin guardarlos en MongoDB. La cantidad permitida es de 1 a 100.
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         description: Cantidad de usuarios que se desea generar. Por defecto es 1.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 1
 *         example: 5
 *     responses:
 *       200:
 *         description: Usuarios ficticios generados correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       400:
 *         description: Cantidad inválida. Debe ser un entero entre 1 y 100.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error durante la generación de usuarios ficticios.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/users', mocksController.getUsers)

/**
 * @swagger
 * /api/mocks/orders:
 *   get:
 *     summary: Generar pedidos ficticios
 *     description: Genera pedidos de prueba sin persistirlos en MongoDB. Requiere que exista al menos una tienda registrada.
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         description: Cantidad de pedidos que se desea generar. Por defecto es 1.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 1
 *         example: 5
 *     responses:
 *       200:
 *         description: Pedidos ficticios generados correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cantidad inválida o no existen tiendas disponibles.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error durante la generación de pedidos ficticios.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/orders', mocksController.getOrders)


/**
 * @swagger
 * /api/mocks/deliveries:
 *   get:
 *     summary: Generar entregas ficticias
 *     description: Genera entregas ficticias para pruebas sin persistirlas en MongoDB. Requiere que exista al menos una tienda registrada. No administra entregas reales.
 *     tags: [Deliveries]
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         description: Cantidad de entregas ficticias que se desea generar. Por defecto es 1.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 1
 *         example: 5
 *     responses:
 *       200:
 *         description: Entregas ficticias generadas correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Delivery'
 *       400:
 *         description: Cantidad inválida o no existen tiendas disponibles.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error durante la generación de entregas ficticias.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.get('/deliveries', mocksController.getDeliveries)


/**
 * @swagger
 * /api/mocks/seed:
 *   post:
 *     summary: Insertar datos de prueba
 *     description: Genera e inserta usuarios, conductores, pedidos y entregas en MongoDB. Si no existen tiendas, crea una tienda de prueba automáticamente. La cantidad puede enviarse mediante body JSON o query string. Por defecto se utiliza 10.
 *     tags: [Mocks]
 *     requestBody:
 *       required: false
 *       description: Cantidad de registros de prueba que se desea generar.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qty:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 10
 *                 example: 5
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         description: Cantidad de usuarios, conductores, pedidos y entregas que se generarán. Por defecto es 10.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         example: 5
 *     responses:
 *       201:
 *         description: Datos de prueba insertados correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Datos de prueba insertados correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     insertados:
 *                       type: object
 *                       properties:
 *                         usuarios:
 *                           type: integer
 *                           example: 5
 *                         conductores:
 *                           type: integer
 *                           example: 5
 *                         pedidos:
 *                           type: integer
 *                           example: 5
 *                         entregas:
 *                           type: integer
 *                           example: 5
 *                         total:
 *                           type: integer
 *                           example: 20
 *                     colecciones:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [users, orders, deliveries]
 *       400:
 *         description: Cantidad inválida. Debe ser un entero entre 1 y 100.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error durante la inserción de datos de prueba.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post('/seed', mocksController.seed)

export default router
