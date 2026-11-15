# ShipNow API

API backend para la gestión de usuarios, tiendas, pedidos y productos de
ShipNow. Desarrollado con Node.js, Express y MongoDB mediante Mongoose.
Incluye documentación interactiva con Swagger UI y pruebas
automatizadas.

## Tecnologías

-   Node.js y Express
-   MongoDB y Mongoose
-   Swagger / OpenAPI 3.0
-   `swagger-jsdoc` y `swagger-ui-express`
-   Winston para registros de eventos y errores
-   Mocha, Chai y Supertest para testing

## Requisitos

-   Node.js y npm
-   Una instancia de MongoDB local o MongoDB Atlas
-   Git

## Instalación

``` bash
git clone https://github.com/ha3nebal/shipnow-backend3.git
cd shipnow-backend3
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto usando `.env.example`
como referencia.

``` env
PORT=8080
MONGODB_URI=tu_cadena_de_conexion_mongodb
JWT_SECRET=tu_secreto_jwt
NODE_ENV=development
```

No publiques `.env` ni credenciales reales en GitHub.

## Ejecución

``` bash
npm run dev
```

El servidor se inicia en el puerto configurado en `PORT` y establece
conexión con MongoDB.

## Swagger / OpenAPI

Con el servidor iniciado, abre:

``` text
http://localhost:8080/api/docs
```

La especificación utiliza OpenAPI 3.0.3 y se genera desde las
anotaciones `@swagger` de los archivos de rutas.

## Módulos y endpoints

Todas las rutas utilizan el prefijo `/api`.

### Users

  Método   Endpoint              Descripción
  -------- --------------------- ----------------------------------------
  POST     `/api/users`          Crea un usuario y normaliza el correo.
  GET      `/api/users`          Obtiene todos los usuarios.
  POST     `/api/users/stores`   Crea una tienda.

El registro público no permite asignar el rol desde el cuerpo de la
solicitud. El servicio establece siempre `customer`.

Ejemplo:

``` json
{
  "name": "Juan Pérez",
  "email": "juan@email.com"
}
```

### Orders

  ----------------------------------------------------------------------------
  Método                  Endpoint                     Descripción
  ----------------------- ---------------------------- -----------------------
  POST                    `/api/orders`                Crea un pedido y
                                                       calcula el total en el
                                                       servidor.

  GET                     `/api/orders`                Obtiene los pedidos
                                                       registrados.

  GET                     `/api/orders/{id}`           Obtiene un pedido por
                                                       su ID.

  PATCH                   `/api/orders/{id}/deliver`   Marca un pedido como
                                                       entregado.
  ----------------------------------------------------------------------------

Para crear un pedido se envían `userId`, `storeId`, `address` e `items`.
El estado inicial es `pending`.

Ejemplo:

``` json
{
  "userId": "ID_DEL_USUARIO",
  "storeId": "ID_DE_LA_TIENDA",
  "address": "Av. Libertad 123, Viña del Mar",
  "items": [
    {
      "name": "Pizza familiar",
      "price": 8500,
      "quantity": 2
    }
  ]
}
```

### Products

  Método   Endpoint               Descripción
  -------- ---------------------- ----------------------------------------------
  POST     `/api/products`        Crea un producto.
  GET      `/api/products`        Obtiene productos y permite aplicar filtros.
  GET      `/api/products/{id}`   Obtiene un producto por ID.
  PUT      `/api/products/{id}`   Actualiza un producto.
  DELETE   `/api/products/{id}`   Elimina un producto.

Parámetros de `GET /api/products`:

  -----------------------------------------------------------------------
  Parámetro                           Descripción
  ----------------------------------- -----------------------------------
  `status`                            Filtra por `available` o
                                      `out_of_stock`.

  `includeOutOfStock`                 Con valor `true`, permite incluir
                                      productos sin stock cuando no se
                                      utiliza `status`.
  -----------------------------------------------------------------------

### Mocks

  -------------------------------------------------------------------------------
  Método                  Endpoint                        Descripción
  ----------------------- ------------------------------- -----------------------
  GET                     `/api/mocks/users?qty=3`        Genera usuarios
                                                          ficticios sin
                                                          persistirlos.

  GET                     `/api/mocks/orders?qty=3`       Genera pedidos
                                                          ficticios sin
                                                          persistirlos.

  GET                     `/api/mocks/deliveries?qty=3`   Genera entregas
                                                          ficticias sin
                                                          persistirlas.

  POST                    `/api/mocks/seed`               Inserta datos de prueba
                                                          en MongoDB.
  -------------------------------------------------------------------------------

El parámetro `qty` acepta enteros entre 1 y 100. `seed` admite `qty` en
el cuerpo JSON o en la consulta; por defecto utiliza 10. Si no existe
una tienda, crea una para generar pedidos. Utiliza estos endpoints
únicamente en entornos de desarrollo o prueba.

### Deliveries

No existe un router independiente para administrar entregas reales.
`GET /api/mocks/deliveries` genera entregas ficticias para pruebas y no
las persiste en MongoDB.

### Logger

  -----------------------------------------------------------------------
  Método                  Endpoint                Descripción
  ----------------------- ----------------------- -----------------------
  GET                     `/api/logger/test`      Ejecuta una prueba de
                                                  los niveles de Winston.

  -----------------------------------------------------------------------

Este endpoint es una herramienta de validación técnica del sistema de
logs, no una funcionalidad de negocio.

## Testing - Pre-entrega 6

El proyecto incorpora pruebas funcionales y de integración con **Mocha,
Chai y Supertest**. Supertest realiza solicitudes HTTP directamente
sobre la aplicación Express, sin iniciar el servidor manualmente.

### Rama de trabajo

Los cambios de esta entrega se desarrollan en la rama:

``` bash
pre-entrega-6-testing
```

Para cambiar a la rama local:

``` bash
git checkout pre-entrega-6-testing
```

Para actualizarla desde el repositorio remoto, si ya fue publicada:

``` bash
git pull origin pre-entrega-6-testing
```

Los cambios de Swagger de la entrega anterior corresponden a
`pre-entrega-5-swagger`. Esta entrega se trabaja en
`pre-entrega-6-testing`, manteniendo separadas las ramas de trabajo.

### Tecnologías de testing

-   **Mocha:** organiza y ejecuta las pruebas.
-   **Chai:** proporciona aserciones para verificar resultados.
-   **Supertest:** realiza solicitudes HTTP contra Express.
-   **MongoDB:** utiliza una base de datos independiente para las
    pruebas.

### Configuración del entorno de pruebas

Las pruebas utilizan una base de datos separada llamada `shipnow_test`,
para evitar modificar los datos del entorno de desarrollo.

Crea `.env.test` en la raíz del proyecto utilizando `.env.test.example`
como referencia:

``` env
PORT=8081
MONGODB_URI=mongodb://127.0.0.1:27017/shipnow_test
NODE_ENV=test
```

Si utilizas otra instancia de MongoDB, ajusta `MONGODB_URI`, conservando
el nombre de base de datos `shipnow_test`.

`.env.test` contiene configuración local y no debe subirse al
repositorio. Se incluye `.env.test.example` como plantilla.

### Ejecución de las pruebas

``` bash
npm test
```

El script configura `NODE_ENV=test` y ejecuta los archivos de prueba
ubicados en `tests/`.

### Cobertura de las pruebas

-   **Users:** listado y creación, normalización de correos, protección
    del rol, campos obligatorios y correos duplicados.
-   **Orders:** listado, creación, cálculo de totales, validación de
    usuario y tienda, consulta por ID, identificadores inválidos y
    actualización del estado de entrega.
-   **Mocks:** generación de usuarios, pedidos y entregas ficticias;
    cantidades válidas e inválidas; disponibilidad de tiendas e
    inserción mediante `seed`.
-   **Logger:** respuesta del endpoint de prueba de Winston.
-   **Swagger:** disponibilidad de la documentación interactiva.
-   **Rutas inexistentes:** respuesta HTTP 404 y código
    `ROUTE_NOT_FOUND`.

### Estructura de los tests

``` text
tests/
├── users.test.js
├── orders.test.js
├── mocks.test.js
├── logger.test.js
├── swagger.test.js
└── routes.test.js
```

Los tests preparan los datos necesarios y limpian las colecciones
utilizadas para reducir la dependencia entre ejecuciones.

**Resultado observado durante el desarrollo:** 34 pruebas aprobadas
(`34 passing`). Ejecuta `npm test` en tu entorno para verificar el
estado actual de la suite.

## Respuestas y manejo de errores

Las respuestas exitosas utilizan `status: "success"` y pueden incluir
`payload`, `data` o `message`, según la operación.

Los errores utilizan una estructura común:

``` json
{
  "status": "error",
  "message": "Descripción del error",
  "code": "ERROR_CODE"
}
```

Cuando corresponde, también se incluye `details`.

Algunos códigos de error:

-   `INVALID_ID` (400): identificador no válido.
-   `VALIDATION_ERROR` (400): datos que no cumplen las validaciones.
-   `INVALID_MOCK_QTY` (400): cantidad fuera del rango permitido.
-   `USER_NOT_FOUND` (404): usuario no encontrado.
-   `STORE_NOT_FOUND` (404): tienda no encontrada.
-   `ORDER_NOT_FOUND` (404): pedido no encontrado.
-   `PRODUCT_NOT_FOUND` (404): producto no encontrado.
-   `DUPLICATE_RESOURCE` (409): recurso duplicado.
-   `DATABASE_ERROR` (500): error en una operación de base de datos.
-   `INTERNAL_ERROR` (500): error interno del servidor.
-   `ROUTE_NOT_FOUND` (404): ruta solicitada inexistente.

Consulta Swagger para ver parámetros, cuerpos, esquemas y respuestas
documentadas para cada operación.

## Estructura general

``` text
src/
├── app.js
├── config/
├── constants/
├── controllers/
├── docs/
│   └── swagger.js
├── errors/
├── logger/
├── middlewares/
├── models/
├── repositories/
├── routes/
└── services/

tests/
├── users.test.js
├── orders.test.js
├── mocks.test.js
├── logger.test.js
├── swagger.test.js
└── routes.test.js
```

La aplicación organiza la lógica por capas: las rutas reciben las
solicitudes, los controladores coordinan las operaciones, los servicios
implementan las reglas de negocio y los repositorios gestionan el acceso
a los datos.

## Autor

Proyecto académico desarrollado como parte del curso Backend de
Coderhouse.
