
import { Router } from 'express'
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/products.controller.js'

const router = Router()

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear un producto
 *     description: Registra un producto. Si no se especifica stock, se establece en cero. El estado se calcula automáticamente según el stock.
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pizza familiar
 *               description:
 *                 type: string
 *                 example: Pizza familiar de cuatro ingredientes
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 8500
 *               stock:
 *                 type: number
 *                 minimum: 0
 *                 default: 0
 *                 example: 20
 *     responses:
 *       201:
 *         description: Producto creado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos inválidos o stock menor que cero.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno o de base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', createProduct)

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener productos
 *     description: Devuelve los productos registrados. Por defecto excluye los productos sin stock.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         description: Filtra productos por estado.
 *         schema:
 *           type: string
 *           enum: [available, out_of_stock]
 *         example: available
 *       - in: query
 *         name: includeOutOfStock
 *         required: false
 *         description: Permite incluir productos sin stock cuando su valor es true.
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         example: 'true'
 *     responses:
 *       200:
 *         description: Productos obtenidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *       400:
 *         description: El estado del producto proporcionado no es válido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno o de base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getProducts)

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     description: Busca un producto mediante su identificador de MongoDB.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador MongoDB del producto.
 *         schema:
 *           type: string
 *         example: 64f1a2b3c4d5e6f789012349
 *     responses:
 *       200:
 *         description: Producto encontrado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: El identificador proporcionado no es válido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Producto no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno o de base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getProductById)

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar un producto
 *     description: Actualiza los datos de un producto existente. Si cambia el stock, el estado se recalcula automáticamente.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador MongoDB del producto.
 *         schema:
 *           type: string
 *         example: 64f1a2b3c4d5e6f789012349
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pizza familiar actualizada
 *               description:
 *                 type: string
 *                 example: Nueva descripción del producto
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 9500
 *               stock:
 *                 type: number
 *                 minimum: 0
 *                 example: 15
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: Identificador inválido, datos incorrectos o stock no válido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Producto no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno o de base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', updateProduct)

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     description: Elimina un producto utilizando su identificador de MongoDB.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador MongoDB del producto.
 *         schema:
 *           type: string
 *         example: 64f1a2b3c4d5e6f789012349
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Producto eliminado correctamente
 *                     payload:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: El identificador proporcionado no es válido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Producto no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno o de base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', deleteProduct)

export default router
