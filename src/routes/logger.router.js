
import { Router } from 'express'
import { testLogger } from '../controllers/logger.controller.js'

const router = Router()

/**
 * @swagger
 * /api/logger/test:
 *   get:
 *     summary: Probar los niveles de Winston
 *     description: Ejecuta una prueba de los seis niveles de registro de Winston (debug, http, info, warning, error y fatal). Este endpoint es una herramienta de validación técnica del sistema de logs y no representa una funcionalidad de negocio.
 *     tags: [Logger]
 *     responses:
 *       200:
 *         description: Prueba de los seis niveles de Winston ejecutada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - status
 *                 - message
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Prueba de los seis niveles de Winston ejecutada correctamente
 */

router.get('/test', testLogger)

export default router
