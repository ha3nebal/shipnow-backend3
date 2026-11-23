import { Router } from 'express'
import {
  createOrder,
  getOrders,
  getOrderById,
  deliverOrder,
  uploadOrderReceipt,
} from '../controllers/orders.controller.js'
import { upload } from '../config/multer.config.js'

const router = Router()

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Crear un pedido
 *     description: Crea un pedido asociado a un usuario y una tienda. El total se calcula automáticamente y el estado inicial es pending.
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - storeId
 *               - address
 *               - items
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 64f1a2b3c4d5e6f789012346
 *               storeId:
 *                 type: string
 *                 example: 64f1a2b3c4d5e6f789012347
 *               address:
 *                 type: string
 *                 example: Av. Libertad 123, Viña del Mar
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/OrderItem'
 *     responses:
 *       201:
 *         description: Pedido creado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Identificador inválido o datos que no cumplen las validaciones.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario o tienda no encontrados.
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
router.post('/', createOrder)


/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Obtener pedidos con paginación y filtros
 *     description: Devuelve los pedidos registrados, ordenados desde el más reciente. Permite filtrar por estado y prioridad.
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Número de página.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: Cantidad de pedidos por página (máximo 100).
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: status
 *         description: Filtrar pedidos por estado.
 *         schema:
 *           type: string
 *           enum: [pending, assigned, in_transit, delivered, cancelled]
 *       - in: query
 *         name: priority
 *         description: Filtrar pedidos por prioridad.
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Pedidos obtenidos correctamente.
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
 *                         $ref: '#/components/schemas/Order'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         currentPage:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *       400:
 *         description: Parámetros de paginación o filtros inválidos.
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
router.get('/', getOrders)

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obtener un pedido por ID
 *     description: Busca y devuelve un pedido utilizando su identificador de MongoDB.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador MongoDB del pedido.
 *         schema:
 *           type: string
 *         example: 64f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: Pedido encontrado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: El identificador proporcionado no es válido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Pedido no encontrado.
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
router.get('/:id', getOrderById)

/**
 * @swagger
 * /api/orders/{id}/deliver:
 *   patch:
 *     summary: Marcar un pedido como entregado
 *     description: Actualiza el estado del pedido a delivered. No permite entregar nuevamente un pedido que ya fue entregado.
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador MongoDB del pedido.
 *         schema:
 *           type: string
 *         example: 64f1a2b3c4d5e6f789012345
 *     responses:
 *       200:
 *         description: Pedido marcado como entregado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Identificador inválido o pedido que ya fue entregado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Pedido no encontrado.
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
router.patch('/:id/deliver', deliverOrder)

// Carga de comprobantes asociados a un pedido.
/**
 * @swagger
 * /api/orders/{id}/receipt:
 *   post:
 *     summary: Cargar comprobante de un pedido
 *     description: Recibe un archivo y lo asocia a un pedido existente. Se permiten archivos PDF, JPG, JPEG y PNG de hasta 5 MB.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador MongoDB del pedido.
 *         schema:
 *           type: string
 *         example: 64f1a2b3c4d5e6f789012345
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Comprobante en formato PDF, JPG, JPEG o PNG.
 *     responses:
 *       200:
 *         description: Comprobante cargado y asociado correctamente.
 *       400:
 *         description: Archivo obligatorio o tipo de archivo no permitido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Pedido no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       413:
 *         description: El archivo supera el límite de 5 MB.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error al guardar el comprobante.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/:id/receipt',
  (req, res, next) => {
    req.uploadCategory = 'orders'
    next()
  },
  upload.single('file'),
  uploadOrderReceipt,
)

export default router