# ShipNow API

API backend para la gestión de usuarios, tiendas, pedidos y productos de
ShipNow. Desarrollado con Node.js, Express y MongoDB mediante Mongoose.
Incluye documentación interactiva con Swagger UI.

## Tecnologías

-   Node.js y Express
-   MongoDB y Mongoose
-   Swagger / OpenAPI 3.0
-   `swagger-jsdoc`
-   `swagger-ui-express`
-   Winston para registros de eventos y errores

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

Reemplaza los valores de ejemplo por los de tu entorno. No publiques
`.env` ni credenciales reales en GitHub.

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

Si utilizas otro puerto, reemplaza `8080` por el valor configurado en
`PORT`.

La especificación utiliza OpenAPI 3.0.3 y se genera desde las
anotaciones `@swagger` de los archivos de rutas.

## Módulos y endpoints

Todas las rutas utilizan el prefijo `/api`.

### Users

  -----------------------------------------------------------------------
  Método                  Endpoint                Descripción
  ----------------------- ----------------------- -----------------------
  POST                    `/api/users`            Crea un usuario.
                                                  Normaliza el correo
                                                  eliminando espacios y
                                                  convirtiéndolo a
                                                  minúsculas.

  GET                     `/api/users`            Obtiene todos los
                                                  usuarios.

  POST                    `/api/users/stores`     Crea una tienda.
  -----------------------------------------------------------------------

**Protección del rol:** el registro público no permite asignar el rol
desde el cuerpo de la solicitud. El servicio establece siempre
`customer`, incluso si el cliente intenta enviar `role: "admin"`.

Ejemplo de creación:

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
  POST                    `/api/orders`                Crea un pedido asociado
                                                       a un usuario y una
                                                       tienda. El total se
                                                       calcula en el servidor.

  GET                     `/api/orders`                Obtiene los pedidos
                                                       registrados.

  GET                     `/api/orders/{id}`           Obtiene un pedido por
                                                       su ID.

  PATCH                   `/api/orders/{id}/deliver`   Marca un pedido como
                                                       entregado.
  ----------------------------------------------------------------------------

Para crear un pedido se envían `userId`, `storeId`, `address` e `items`.
El estado inicial es `pending`; el total se calcula a partir del precio
y la cantidad de cada ítem.

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

Parámetros de consulta de `GET /api/products`:

  -----------------------------------------------------------------------
  Parámetro                           Descripción
  ----------------------------------- -----------------------------------
  `status`                            Filtra por `available` o
                                      `out_of_stock`.

  `includeOutOfStock`                 Con valor `true`, permite incluir
                                      productos sin stock cuando no se
                                      utiliza el filtro `status`.
  -----------------------------------------------------------------------

El estado se calcula según el stock: `available` cuando existe stock y
`out_of_stock` cuando el stock es cero.

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

El parámetro `qty` acepta enteros entre 1 y 100. La operación `seed`
admite `qty` en el cuerpo JSON o en la consulta; si no se indica,
utiliza 10.

Ejemplo:

``` http
POST /api/mocks/seed
Content-Type: application/json
```

``` json
{
  "qty": 2
}
```

La operación `seed` inserta usuarios, conductores, pedidos y entregas de
prueba. Si no existe una tienda, crea una para poder generar pedidos.
Utiliza estos endpoints únicamente en entornos de desarrollo o prueba.

### Deliveries

No existe un router independiente para administrar entregas reales. La
operación documentada con la etiqueta **Deliveries** es
`GET /api/mocks/deliveries`, que genera entregas ficticias para pruebas
y no las persiste en MongoDB.

### Logger

  -----------------------------------------------------------------------
  Método                  Endpoint                Descripción
  ----------------------- ----------------------- -----------------------
  GET                     `/api/logger/test`      Ejecuta una prueba de
                                                  los niveles de Winston.

  -----------------------------------------------------------------------

Este endpoint es una herramienta de validación técnica del sistema de
logs, no una funcionalidad de negocio.

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

Algunos códigos de error documentados:

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
```

La aplicación organiza la lógica por capas: las rutas reciben las
solicitudes, los controladores coordinan las operaciones, los servicios
implementan las reglas de negocio y los repositorios gestionan el acceso
a los datos.

## Rama de la Pre-entrega 5

Los cambios de Swagger se encuentran en la rama:

``` text
pre-entrega-5-swagger
```

Para obtenerla:

``` bash
git checkout pre-entrega-5-swagger
git pull origin pre-entrega-5-swagger
```

## Autor

Proyecto académico desarrollado como parte del curso Backend de
Coderhouse.
