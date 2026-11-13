
import swaggerJsdoc from 'swagger-jsdoc'
import { config } from '../config/env.config.js'

const swaggerOptions = {
  definition: {
    openapi: '3.0.3',

    info: {
      title: 'ShipNow API',
      version: '2.0.0',
      description:
        'Documentación interactiva de la API ShipNow. ' +
        'Sistema backend para la gestión de usuarios, pedidos, productos y entregas.',
    },

    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Servidor local de desarrollo',
      },
    ],

    tags: [
      {
        name: 'Users',
        description: 'Operaciones relacionadas con usuarios y tiendas',
      },
      {
        name: 'Orders',
        description: 'Operaciones para gestionar pedidos',
      },
      {
        name: 'Deliveries',
        description: 'Información y generación de entregas',
      },
      {
        name: 'Products',
        description: 'Operaciones relacionadas con productos',
      },
      {
        name: 'Mocks',
        description: 'Generación e inserción de datos de prueba',
      },
      {
        name: 'Logger',
        description: 'Herramientas para validar los niveles de Winston',
      },
    ],

    components: {
      schemas: {
        // Schema de usuario.
        User: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            _id: {
              type: 'string',
              example: '64f1a2b3c4d5e6f789012345',
            },
            name: {
              type: 'string',
              example: 'Juan Pérez',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'juan@email.com',
            },
            role: {
              type: 'string',
              enum: ['admin', 'user', 'customer', 'driver', 'store'],
              example: 'customer',
            },
          },
        },

        // Schema de tienda.
        Store: {
          type: 'object',
          required: ['name'],
          properties: {
            _id: {
              type: 'string',
              example: '64f1a2b3c4d5e6f789012350',
            },
            name: {
              type: 'string',
              example: 'Tienda Central',
            },
            address: {
              type: 'string',
              example: 'Av. Libertad 123, Viña del Mar',
            },
          },
        },

        // Item individual de un pedido.
        OrderItem: {
          type: 'object',
          required: ['name', 'price', 'quantity'],
          properties: {
            name: {
              type: 'string',
              example: 'Producto de prueba',
            },
            price: {
              type: 'number',
              minimum: 0,
              example: 5000,
            },
            quantity: {
              type: 'number',
              minimum: 1,
              example: 2,
            },
          },
        },

        // Schema de pedido.
        Order: {
          type: 'object',
          required: ['userId', 'storeId', 'address', 'total'],
          properties: {
            _id: {
              type: 'string',
              example: '64f1a2b3c4d5e6f789012345',
            },
            userId: {
              type: 'string',
              example: '64f1a2b3c4d5e6f789012346',
            },
            storeId: {
              type: 'string',
              example: '64f1a2b3c4d5e6f789012347',
            },
            address: {
              type: 'string',
              example: 'Av. Libertad 123, Viña del Mar',
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem',
              },
            },
            total: {
              type: 'number',
              minimum: 0,
              example: 10000,
            },
            status: {
              type: 'string',
              enum: [
                'pending',
                'assigned',
                'in_transit',
                'delivered',
                'cancelled',
              ],
              example: 'pending',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              example: 'medium',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // Schema de entrega.
        Delivery: {
          type: 'object',
          required: ['orderId', 'address'],
          properties: {
            _id: {
              type: 'string',
              example: '64f1a2b3c4d5e6f789012348',
            },
            orderId: {
              type: 'string',
              example: '64f1a2b3c4d5e6f789012345',
            },
            driverId: {
              type: 'string',
              nullable: true,
              example: '64f1a2b3c4d5e6f789012346',
            },
            status: {
              type: 'string',
              enum: [
                'pending',
                'assigned',
                'in_transit',
                'delivered',
                'cancelled',
              ],
              example: 'pending',
            },
            address: {
              type: 'string',
              example: 'Av. Libertad 123, Viña del Mar',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // Schema de producto.
        Product: {
          type: 'object',
          required: ['name', 'price', 'stock'],
          properties: {
            _id: {
              type: 'string',
              example: '64f1a2b3c4d5e6f789012349',
            },
            name: {
              type: 'string',
              example: 'Pizza familiar',
            },
            description: {
              type: 'string',
              example: 'Pizza familiar de cuatro ingredientes',
            },
            price: {
              type: 'number',
              minimum: 0,
              example: 8500,
            },
            stock: {
              type: 'number',
              minimum: 0,
              example: 20,
            },
            status: {
              type: 'string',
              enum: ['available', 'out_of_stock'],
              example: 'available',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // Respuesta de error del middleware global.
        ErrorResponse: {
          type: 'object',
          required: ['status', 'message', 'code'],
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Pedido no encontrado',
            },
            code: {
              type: 'string',
              example: 'ORDER_NOT_FOUND',
            },
            details: {
             description: 'Información adicional del error. Se incluye únicamente cuando existen detalles.',
             oneOf: [
               {
                 type: 'object',
                 additionalProperties: true,
               },
               {
                 type: 'array',
                 items: {
                   type: 'object',
                   additionalProperties: true,
                  },
                },
              ],
            },
          },
        },

        // Respuesta exitosa reutilizable.
        SuccessResponse: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['success'],
              example: 'success',
            },
            message: {
              type: 'string',
              example: 'Operación realizada correctamente',
            },
            payload: {
              oneOf: [
                {
                  type: 'object',
                  additionalProperties: true,
                },
                {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: true,
                  },
                },
              ],
            },
            data: {
              oneOf: [
                {
                  type: 'object',
                  additionalProperties: true,
                },
                {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: true,
                  },
                },
              ],
            },
          },
        },
      },
    },
  },

  // Swagger buscará las anotaciones OpenAPI en los archivos de rutas.
  apis: ['./src/routes/*.js'],
}

export const swaggerSpec = swaggerJsdoc(swaggerOptions)
