# ShipNow Backend

API backend para la gestión de usuarios, tiendas, productos, pedidos y
entregas de ShipNow. Está desarrollado con Node.js, Express y MongoDB
mediante Mongoose, con una arquitectura por capas.

## Tecnologías

-   Node.js
-   Express
-   MongoDB
-   Mongoose
-   dotenv

## Requisitos

-   Node.js y npm.
-   Una instancia de MongoDB local o una base de datos en MongoDB Atlas.

## Instalación y ejecución

1.  Clonar el repositorio:

    ``` bash
    git clone https://github.com/ha3nebal/shipnow-backend3.git
    cd shipnow-backend3
    ```

2.  Instalar dependencias:

    ``` bash
    npm install
    ```

3.  Crear un archivo `.env` en la raíz, tomando como referencia
    `.env.example`:

    ``` env
    PORT=8080
    MONGODB_URI=tu_uri_de_mongodb
    JWT_SECRET=tu_clave_secreta
    NODE_ENV=development
    ```

    Reemplazar los valores de ejemplo por los de tu entorno. No
    compartir ni subir `.env` al repositorio.

4.  Iniciar el servidor:

    ``` bash
    npm run dev
    ```

## Estructura del proyecto

``` text
src/
├── app.js
├── config/
├── constants/
├── controllers/
├── errors/
│   ├── CustomError.js
│   └── error.dictionary.js
├── middlewares/
│   └── error.middleware.js
├── models/
├── repositories/
├── routes/
├── services/
└── utils/
```

-   **config/**: configuración y variables de entorno.
-   **constants/**: constantes compartidas, como estados y roles.
-   **controllers/**: reciben solicitudes HTTP y coordinan respuestas.
-   **errors/**: clase `CustomError` y diccionario centralizado de
    errores.
-   **middlewares/**: middleware global de manejo de errores.
-   **models/**: esquemas y modelos de Mongoose.
-   **repositories/**: acceso a la base de datos.
-   **routes/**: definición de endpoints.
-   **services/**: lógica de negocio y validaciones.
-   **utils/**: funciones auxiliares y generación de datos de prueba.

## Manejo centralizado de errores

Los servicios detectan situaciones inválidas y pueden lanzar una
instancia de `CustomError` utilizando un código definido en
`src/errors/error.dictionary.js`.

Los controladores delegan los errores mediante `next(error)`. El
middleware global `errorMiddleware`, registrado después de las rutas en
`src/app.js`, determina el código HTTP y construye la respuesta.

### Formato de respuesta

``` json
{
  "status": "error",
  "message": "El correo electrónico ya está registrado",
  "code": "USER_EMAIL_ALREADY_EXISTS"
}
```

-   `status`: indica que la operación produjo un error.
-   `message`: descripción del problema.
-   `code`: código identificador definido por la aplicación.
-   `details` (opcional): información adicional, por ejemplo, los campos
    que no superaron las validaciones de Mongoose.

Ejemplo de error de validación:

``` json
{
  "status": "error",
  "message": "Los datos enviados no cumplen las validaciones",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "price",
      "message": "Path `price` (-100) is less than minimum allowed value (0)."
    }
  ]
}
```

### Códigos de error principales

  --------------------------------------------------------------------------------
  Código                                                HTTP Situación
  ----------------------------- ---------------------------- ---------------------
  `EMAIL_REQUIRED`                                       400 No se proporcionó el
                                                             correo electrónico
                                                             requerido.

  `INVALID_MOCK_QTY`                                     400 La cantidad de mocks
                                                             no es un entero entre
                                                             1 y 100.

  `INVALID_PRODUCT_STATUS`                               400 Estado de producto no
                                                             permitido.

  `INVALID_PRODUCT_STOCK`                                400 Stock negativo o no
                                                             válido.

  `INVALID_ID`                                           400 Identificador con
                                                             formato no válido
                                                             para Mongoose.

  `VALIDATION_ERROR`                                     400 Los datos no cumplen
                                                             las validaciones del
                                                             esquema.

  `ORDER_NOT_FOUND`                                      404 No se encontró el
                                                             pedido.

  `PRODUCT_NOT_FOUND`                                    404 No se encontró el
                                                             producto.

  `USER_NOT_FOUND`                                       404 No se encontró el
                                                             usuario.

  `STORE_NOT_FOUND`                                      404 No se encontró la
                                                             tienda.

  `USER_EMAIL_ALREADY_EXISTS`                            409 El correo electrónico
                                                             ya está registrado.

  `DUPLICATE_RESOURCE`                                   409 Se intentó crear un
                                                             recurso duplicado.

  `DATABASE_ERROR`                                       500 Error en una
                                                             operación de base de
                                                             datos.

  `MOCK_GENERATION_FAILED`                               500 No fue posible
                                                             generar datos de
                                                             prueba.

  `MOCK_SEED_FAILED`                                     500 No fue posible
                                                             insertar datos de
                                                             prueba.

  `INTERNAL_ERROR`                                       500 Error interno no
                                                             clasificado.
  --------------------------------------------------------------------------------

Los errores internos se registran en la consola del servidor. La
respuesta al cliente utiliza un mensaje genérico para no exponer
detalles internos.

## Pruebas de errores con Postman

Con el servidor en ejecución en `http://localhost:8080`, se pueden
reproducir estos casos.

### Mocks: cantidades inválidas

El parámetro `qty` admite únicamente enteros entre 1 y 100. Probar:

``` http
GET http://localhost:8080/api/mocks/users?qty=-2
GET http://localhost:8080/api/mocks/users?qty=0
GET http://localhost:8080/api/mocks/users?qty=2.5
GET http://localhost:8080/api/mocks/users?qty=150
```

En todos los casos se espera HTTP `400 Bad Request` y el código
`INVALID_MOCK_QTY`.

### Pedidos: pedido inexistente e identificador inválido

``` http
GET http://localhost:8080/api/orders/690000000000000000000001
```

Si no existe un pedido con ese identificador, se espera HTTP
`404 Not Found` y el código `ORDER_NOT_FOUND`.

``` http
GET http://localhost:8080/api/orders/123
```

Se espera HTTP `400 Bad Request` y el código `INVALID_ID`.

### Usuarios: correo duplicado y correo obligatorio

Para probar el correo duplicado, enviar un `POST` a `/api/users` con un
correo que ya exista en la base de datos:

``` http
POST http://localhost:8080/api/users
Content-Type: application/json
```

``` json
{
  "name": "Usuario Duplicado",
  "email": "correo.ya.registrado@example.com",
  "role": "customer"
}
```

Se espera HTTP `409 Conflict` y el código `USER_EMAIL_ALREADY_EXISTS`.

Para probar el correo obligatorio:

``` http
POST http://localhost:8080/api/users
Content-Type: application/json
```

``` json
{
  "name": "Usuario Sin Correo",
  "role": "customer"
}
```

Se espera HTTP `400 Bad Request` y el código `EMAIL_REQUIRED`.

### Productos: estado y stock inválidos

Estado no permitido:

``` http
GET http://localhost:8080/api/products?status=INVENTADO
```

Se espera HTTP `400 Bad Request` y el código `INVALID_PRODUCT_STATUS`.

Stock negativo:

``` http
POST http://localhost:8080/api/products
Content-Type: application/json
```

``` json
{
  "name": "Producto de Prueba",
  "description": "Prueba de stock inválido",
  "price": 1000,
  "stock": -5
}
```

Se espera HTTP `400 Bad Request` y el código `INVALID_PRODUCT_STOCK`.

### Validación nativa de Mongoose

Para probar la validación `min: 0` del campo `price` en el modelo
`Product`:

``` http
POST http://localhost:8080/api/products
Content-Type: application/json
```

``` json
{
  "name": "Producto Validación Mongoose",
  "description": "Prueba de validación del modelo",
  "price": -100,
  "stock": 10
}
```

Se espera HTTP `400 Bad Request`, el código `VALIDATION_ERROR` y un
arreglo `details` que identifique el campo `price`.

## Mocks: generación de datos y Seed

Generar dos usuarios:

``` http
GET http://localhost:8080/api/mocks/users?qty=2
```

Generar dos pedidos:

``` http
GET http://localhost:8080/api/mocks/orders?qty=2
```

Generar dos entregas:

``` http
GET http://localhost:8080/api/mocks/deliveries?qty=2
```

Insertar datos de prueba:

``` http
POST http://localhost:8080/api/mocks/seed
```

Si no se envía una cantidad, `seed` utiliza el valor predeterminado de
10. La ejecución de ejemplo inserta usuarios, conductores, pedidos y
entregas. Esta operación modifica MongoDB; evitar repetirla
innecesariamente.

## Consideraciones

-   No subir `.env` ni credenciales al repositorio.
-   No incluir `node_modules` en Git.
-   Utilizar `.env.example` como referencia para configurar el entorno.
-   Las solicitudes que crean registros y la operación `seed` modifican
    la base de datos. Utilizar datos de prueba y revisar la base antes
    de repetir operaciones.
