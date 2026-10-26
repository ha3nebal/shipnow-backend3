# ShipNow Backend

API backend de ShipNow, desarrollado con Node.js, Express y MongoDB mediante Mongoose. El proyecto utiliza una arquitectura por capas para separar las rutas HTTP, los controladores, la lógica de negocio y el acceso a datos.

## Tecnologías

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- dotenv

## Requisitos

- Node.js instalado.
- Una cuenta y un clúster disponible en MongoDB Atlas (o una instancia local de MongoDB).
- Postman u otra herramienta para probar endpoints HTTP.

## Instalación

1. Clona el repositorio y entra en la carpeta del proyecto.
2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea un archivo `.env` a partir de `.env.example`:

   ```bash
   cp .env.example .env
   ```

   En Windows también puedes crear `.env` manualmente y copiar las variables de `.env.example`.

4. Configura las variables de entorno en `.env`.

   Ejemplo para MongoDB local:

   ```dotenv
   PORT=8080
   MONGODB_URI=mongodb://127.0.0.1:27017/shipnow
   NODE_ENV=development
   ```

   Para MongoDB Atlas, reemplaza `MONGODB_URI` por la cadena de conexión que proporciona Atlas. Mantén las credenciales privadas y no subas `.env` a Git. Si la contraseña contiene caracteres especiales, deben codificarse para URL.

5. Inicia el servidor:

   ```bash
   npm run dev
   ```

   Si la configuración y la conexión son correctas, la terminal mostrará mensajes equivalentes a:

   ```text
   Mongo conectado
   ShipNow en puerto 8080 (development)
   ```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto HTTP de la aplicación. |
| `MONGODB_URI` | Cadena de conexión a MongoDB. |
| `NODE_ENV` | Entorno de ejecución: `development`, `production` o `test`. |

La configuración se valida en `src/config/env.config.js`. La aplicación falla al iniciar si falta una variable obligatoria o si `PORT` no es válido.

## Arquitectura del proyecto

El código se organiza en capas:

- **Routes:** define los endpoints y conecta cada ruta con un controlador.
- **Controllers:** recibe la solicitud HTTP, invoca el servicio y construye la respuesta.
- **Services:** contiene la lógica de negocio y coordina las operaciones.
- **Repositories:** centraliza las consultas e inserciones en MongoDB mediante los modelos.
- **Models:** define los esquemas y las validaciones de Mongoose.
- **Constants:** reúne valores permitidos, como roles, estados y prioridades.
- **Utils:** contiene utilidades reutilizables, incluido el generador de datos ficticios.

Estructura principal:

```text
src/
├── app.js
├── config/
│   └── env.config.js
├── constants/
│   └── index.js
├── controllers/
│   ├── mocks.controller.js
│   ├── orders.controller.js
│   ├── products.controller.js
│   └── users.controller.js
├── models/
│   ├── delivery.model.js
│   ├── order.model.js
│   ├── product.model.js
│   ├── store.model.js
│   └── user.model.js
├── repositories/
│   ├── mocks.repository.js
│   ├── orders.repository.js
│   ├── products.repository.js
│   ├── stores.repository.js
│   └── users.repository.js
├── routes/
│   ├── mocks.router.js
│   ├── orders.router.js
│   ├── products.router.js
│   └── users.router.js
├── services/
│   ├── mocks.service.js
│   ├── orders.service.js
│   ├── products.service.js
│   └── users.service.js
└── utils/
    └── mock.generator.js
```

### Decisión de arquitectura: Service y Repository

El **Service** coordina las reglas de negocio. Por ejemplo, `orders.service.js` verifica que existan el usuario y la tienda antes de crear un pedido y calcula el total de los artículos.

El **Repository** encapsula el acceso a datos. Por ejemplo, `orders.repository.js` utiliza el modelo de Mongoose para crear, consultar y actualizar pedidos.

Esta separación evita mezclar consultas de base de datos con la lógica de negocio y facilita las pruebas y el mantenimiento.

## Endpoints principales

La API utiliza el prefijo `http://localhost:8080`.

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/users` | Consulta usuarios. |
| `POST` | `/api/users` | Crea un usuario según las validaciones del modelo y servicio. |
| `POST` | `/api/users/stores` | Crea una tienda. |
| `GET` | `/api/orders` | Consulta pedidos. |
| `POST` | `/api/orders` | Crea un pedido. |
| `GET` | `/api/orders/:id` | Consulta un pedido por identificador. |
| `PATCH` | `/api/orders/:id/deliver` | Marca un pedido como entregado, según la ruta implementada. |
| `GET` | `/api/products` | Consulta productos. |
| `POST` | `/api/products` | Crea un producto. |

> Nota: consulta los archivos `src/routes/` para ver los métodos y rutas exactos disponibles en la versión actual del proyecto.

## Módulo 2: Mocking y carga de datos de prueba

El sistema de mocking genera datos ficticios con una estructura compatible con los modelos de la aplicación. La lógica se distribuye por capas y se registra mediante un router dedicado en `/api/mocks`.

### Endpoints de mocking

| Método | Endpoint de ejemplo | ¿Guarda datos en MongoDB? |
|---|---|---|
| `GET` | `/api/mocks/users?qty=2` | No. Genera usuarios en memoria. |
| `GET` | `/api/mocks/orders?qty=2` | No. Genera pedidos ficticios en memoria. |
| `GET` | `/api/mocks/deliveries?qty=2` | No. Genera entregas ficticias en memoria. |
| `POST` | `/api/mocks/seed?qty=2` | Sí. Inserta datos de prueba en MongoDB. |

Todos los endpoints aceptan el parámetro `qty`, que debe ser un entero entre `1` y `100`. En las rutas `GET`, si no se especifica, la cantidad predeterminada es `1`. En `POST /api/mocks/seed`, la cantidad predeterminada es `10`.

### Ejemplos de uso en Postman

Para generar usuarios sin persistirlos:

```http
GET http://localhost:8080/api/mocks/users?qty=2
```

Para generar pedidos ficticios:

```http
GET http://localhost:8080/api/mocks/orders?qty=2
```

Para generar entregas ficticias:

```http
GET http://localhost:8080/api/mocks/deliveries?qty=2
```

Para insertar datos de prueba en la base de datos configurada en `MONGODB_URI`:

```http
POST http://localhost:8080/api/mocks/seed?qty=2
```

En Postman, usa el método indicado y selecciona **Body → none**. No se necesita un cuerpo JSON para estas solicitudes.

### Datos que genera `seed`

Con `qty=2`, la implementación genera e inserta:

- 2 usuarios con rol `customer`.
- 2 usuarios con rol `driver`.
- 2 pedidos con referencias a usuarios y tiendas, artículos, total, estado y prioridad.
- 2 entregas asociadas a pedidos y con conductor asignado o sin asignar.

La respuesta informa los conteos por tipo y el total de documentos generados. En este ejemplo, el total esperado es de 8 documentos, sin contar una tienda de prueba que se cree si no existe ninguna tienda en la base de datos.

El `seed` consulta las tiendas existentes y crea una tienda de prueba cuando no encuentra ninguna. Los datos se insertan en el MongoDB configurado en `MONGODB_URI`; si se cambia de MongoDB local a Atlas, los datos existentes no se migran automáticamente.

### Relaciones entre documentos

- Los usuarios y los conductores se guardan en la colección `users`; se distinguen mediante el campo `role`.
- Cada pedido referencia un usuario (`userId`) y una tienda (`storeId`).
- Cada entrega referencia un pedido (`orderId`) y puede referenciar un conductor (`driverId`).
- Los roles, estados y prioridades se definen mediante constantes del proyecto.

**Importante:** el `seed` realiza inserciones secuenciales y no usa una transacción. Si una inserción posterior falla, podrían quedar documentos insertados parcialmente. Para entornos de producción, se recomienda usar una transacción compatible con el clúster o implementar una estrategia de compensación.

## Manejo de errores

La aplicación tiene un middleware de errores en `src/app.js`. Entre otros casos, responde con:

- `400` para errores de validación de Mongoose, identificadores inválidos o cantidades `qty` incorrectas.
- `409` para claves únicas duplicadas.
- `404` para recursos no encontrados cuando el servicio genera ese error.
- `500` para errores inesperados.

## Pruebas realizadas del Módulo 2

Se probaron en Postman los siguientes endpoints:

- `GET /api/mocks/users?qty=2`: generación de dos usuarios ficticios.
- `GET /api/mocks/orders?qty=2`: generación de dos pedidos ficticios.
- `GET /api/mocks/deliveries?qty=2`: generación de dos entregas ficticias.
- `POST /api/mocks/seed?qty=2`: respuesta satisfactoria con 2 usuarios, 2 conductores, 2 pedidos y 2 entregas reportados.

La persistencia se verificó en MongoDB Atlas para la base de datos configurada en la URI de conexión.

## Seguridad

- No subir `.env` ni compartir la URI de conexión con credenciales.
- Usar `.env.example` para documentar los nombres de variables sin incluir secretos.
- Mantener la lista de IP permitidas de MongoDB Atlas limitada a las direcciones necesarias.
- Los endpoints de mocking están orientados a desarrollo y pruebas. No deben exponerse públicamente en producción sin controles de acceso apropiados.
