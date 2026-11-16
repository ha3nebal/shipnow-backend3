
import { Router } from 'express'
import {
  createUser,
  getUsers,
  createStore,
  uploadUserDocument,
} from '../controllers/users.controller.js'
import { upload } from '../config/multer.config.js'

const router = Router()

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear un usuario
 *     description: Registra un usuario nuevo. El correo se normaliza convirtiéndolo a minúsculas y eliminando espacios.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@email.com
 *     responses:
 *       201:
 *         description: Usuario creado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Correo obligatorio o datos inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: El correo electrónico ya está registrado.
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
router.post('/', createUser)

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     description: Devuelve el listado completo de usuarios registrados.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Usuarios obtenidos correctamente.
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
 *                         $ref: '#/components/schemas/User'
 *       500:
 *         description: Error interno o de base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getUsers)

/**
 * @swagger
 * /api/users/stores:
 *   post:
 *     summary: Crear una tienda
 *     description: Registra una nueva tienda en el sistema.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tienda Central
 *               address:
 *                 type: string
 *                 example: Av. Libertad 123, Viña del Mar
 *     responses:
 *       201:
 *         description: Tienda creada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Store'
 *       400:
 *         description: Datos inválidos o campos obligatorios ausentes.
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
router.post('/stores', createStore)

// Carga de documentos asociados a un usuario.
/**
 * @swagger
 * /api/users/{id}/documents:
 *   post:
 *     summary: Cargar documento de un usuario
 *     description: Permite cargar un documento y asociarlo a un usuario existente. Se aceptan archivos PDF, JPG, JPEG y PNG de hasta 5 MB.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador MongoDB del usuario.
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
 *               - documentType
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Documento en formato PDF, JPG, JPEG o PNG.
 *               documentType:
 *                 type: string
 *                 enum:
 *                   - identity
 *                   - driver_license
 *                   - vehicle_registration
 *                   - other
 *                 description: Tipo de documento.
 *     responses:
 *       200:
 *         description: Documento cargado correctamente.
 *       400:
 *         description: Archivo obligatorio, tipo de archivo o tipo de documento inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado.
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
 *         description: Error al guardar el documento.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/:id/documents',
  (req, res, next) => {
    req.uploadCategory = 'users'
    next()
  },
  upload.single('file'),
  uploadUserDocument,
)

export default router
