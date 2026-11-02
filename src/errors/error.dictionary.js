
export const ERROR_DICTIONARY = Object.freeze({
  // Usuarios
  EMAIL_REQUIRED: {
    statusCode: 400,
    message: 'El correo electrónico es obligatorio',
  },
  USER_NOT_FOUND: {
    statusCode: 404,
    message: 'Usuario no encontrado',
  },
  USER_EMAIL_ALREADY_EXISTS: {
    statusCode: 409,
    message: 'El correo electrónico ya está registrado',
  },

  // Tiendas
  STORE_NOT_FOUND: {
    statusCode: 404,
    message: 'Tienda no encontrada',
  },

  // Pedidos
  ORDER_NOT_FOUND: {
    statusCode: 404,
    message: 'Pedido no encontrado',
  },
  ORDER_ALREADY_DELIVERED: {
    statusCode: 400,
    message: 'El pedido ya fue entregado',
  },
  INVALID_ORDER_STATUS: {
    statusCode: 400,
    message: 'El estado del pedido no es válido',
  },

  // Productos
  PRODUCT_NOT_FOUND: {
    statusCode: 404,
    message: 'Producto no encontrado',
  },
  INVALID_PRODUCT_STATUS: {
    statusCode: 400,
    message: 'El estado del producto no es válido',
  },
  INVALID_PRODUCT_STOCK: {
    statusCode: 400,
    message: 'El stock debe ser un número mayor o igual a cero',
  },

  // Mocks
  INVALID_MOCK_QTY: {
    statusCode: 400,
    message: 'La cantidad debe ser un entero entre 1 y 100',
  },
  NO_STORES: {
    statusCode: 400,
    message: 'No existen tiendas disponibles para generar pedidos',
  },
  MOCK_GENERATION_FAILED: {
    statusCode: 500,
    message: 'No fue posible generar los datos de prueba',
  },
  MOCK_SEED_FAILED: {
    statusCode: 500,
    message: 'No fue posible insertar los datos de prueba',
  },

  // Errores generales
  INVALID_ID: {
    statusCode: 400,
    message: 'El identificador proporcionado no es válido',
  },
  VALIDATION_ERROR: {
    statusCode: 400,
    message: 'Los datos enviados no cumplen las validaciones',
  },
  DUPLICATE_RESOURCE: {
    statusCode: 409,
    message: 'El recurso ya existe',
  },
  DATABASE_ERROR: {
    statusCode: 500,
    message: 'Error al realizar una operación en la base de datos',
  },
  INTERNAL_ERROR: {
    statusCode: 500,
    message: 'Error interno del servidor',
  },
})
