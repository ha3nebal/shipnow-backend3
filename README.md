# ShipNow Backend

API backend para la gestión de usuarios, tiendas, productos, pedidos y
entregas de ShipNow. Desarrollado con Node.js, Express y MongoDB
mediante Mongoose, con arquitectura por capas.

Repositorio: https://github.com/ha3nebal/shipnow-backend3

## Tecnologías

-   Node.js y Express
-   MongoDB y Mongoose
-   Multer para carga de archivos
-   dotenv para variables de entorno
-   Winston y winston-daily-rotate-file para logging
-   Swagger UI para documentación de la API
-   Mocha y Chai para pruebas automatizadas
-   Docker para ejecución en contenedores

## Requisitos

-   Node.js y npm.
-   MongoDB local o MongoDB Atlas.
-   Docker Desktop, si se desea ejecutar la aplicación en un contenedor.

## Instalación y ejecución local

1.  Clonar el repositorio:

    ``` bash
    git clone https://github.com/ha3nebal/shipnow-backend3.git
    cd shipnow-backend3
    ```

2.  Instalar dependencias:

    ``` bash
    npm install
    ```

3.  Crear `.env` en la raíz, tomando como referencia `.env.example`:

    ``` env
    PORT=8080
    MONGODB_URI=mongodb://127.0.0.1:27017/shipnow
    NODE_ENV=development
    LOG_LEVEL=debug
    UPLOADS_DIR=./uploads
    ```

    Ajustar `MONGODB_URI` según la instancia local o MongoDB Atlas
    utilizada.

      -----------------------------------------------------------------------
      Variable                            Descripción
      ----------------------------------- -----------------------------------
      `PORT`                              Puerto del servidor.

      `MONGODB_URI`                       Cadena de conexión a MongoDB.

      `NODE_ENV`                          Entorno: `development`, `test` o
                                          `production`.

      `LOG_LEVEL`                         Nivel de logging: `fatal`, `error`,
                                          `warning`, `info`, `http` o
                                          `debug`.

      `UPLOADS_DIR`                       Directorio de almacenamiento de
                                          archivos.
      -----------------------------------------------------------------------

    `PORT`, `MONGODB_URI` y `NODE_ENV` son obligatorias. `LOG_LEVEL` y
    `UPLOADS_DIR` tienen valores predeterminados si no se configuran. En
    producción, las variables se deben proporcionar desde el entorno de
    despliegue. No subir ni compartir `.env`.

4.  Iniciar en desarrollo:

    ``` bash
    npm run dev
    ```

5.  Iniciar en modo normal:

    ``` bash
    npm start
    ```

La API queda disponible en `http://localhost:8080` cuando `PORT=8080`.

## Arquitectura y estructura

La aplicación utiliza una arquitectura por capas. Las rutas reciben
solicitudes HTTP, los controladores coordinan la interacción HTTP, los
servicios contienen reglas de negocio y los repositorios encapsulan el
acceso a MongoDB.

``` text
src/
├── app.js
├── config/
│   ├── env.config.js
│   └── multer.config.js
├── constants/
├── controllers/
├── errors/
│   ├── CustomError.js
│   └── error.dictionary.js
├── logger/
│   └── logger.js
├── middlewares/
│   └── error.middleware.js
├── models/
├── repositories/
├── routes/
├── services/
└── utils/
```

-   **config/**: configuración general, validación de variables de
    entorno y Multer.
-   **constants/**: constantes compartidas, como estados y roles.
-   **controllers/**: reciben solicitudes HTTP, llaman a servicios y
    construyen respuestas.
-   **errors/**: clase `CustomError` y diccionario centralizado de
    errores.
-   **logger/**: configuración de Winston y sus transportes.
-   **middlewares/**: manejo global de errores y procesos transversales.
-   **models/**: esquemas y modelos de Mongoose.
-   **repositories/**: consultas y operaciones de persistencia.
-   **routes/**: definición de endpoints.
-   **services/**: lógica de negocio y validaciones.
-   **utils/**: funciones auxiliares y generación de datos de prueba.

### Diferencia entre Service y Repository

-   **Service:** aplica reglas de negocio, valida parámetros y coordina
    operaciones. Por ejemplo, `orders.service.js` valida los parámetros
    de consulta antes de solicitar los pedidos.
-   **Repository:** realiza consultas y operaciones de persistencia. Por
    ejemplo, `orders.repository.js` consulta `OrderModel`, aplica
    filtros, ordenamiento y paginación.

Flujo general:

``` text
Cliente HTTP → Route → Controller → Service → Repository → Model → MongoDB
```

Los controladores no deben concentrar consultas directas a MongoDB ni
reglas de negocio.

## Documentación Swagger

Swagger UI permite consultar los endpoints, parámetros, cuerpos de
solicitud y respuestas documentadas.

-   URL local: `http://localhost:8080/api/docs/`
-   `/api/docs` redirige a `/api/docs/`.
-   Swagger está habilitado fuera del entorno de producción.

## Health check

``` http
GET http://localhost:8080/api/health
```

Respuesta de ejemplo:

``` json
{
  "status": "success",
  "data": {
    "status": "ok",
    "environment": "development",
    "uptime": 66.88,
    "timestamp": "2026-11-23T03:59:37.267Z"
  }
}
```

Informa el estado de la API, el entorno, el tiempo de actividad y la
fecha de consulta. No debe incluir credenciales ni cadenas de conexión.

## Manejo centralizado de errores

Los servicios pueden lanzar `CustomError` utilizando códigos definidos
en `src/errors/error.dictionary.js`. Los controladores delegan los
errores mediante `next(error)`. El middleware global `errorMiddleware`,
registrado después de las rutas en `src/app.js`, determina el estado
HTTP y construye la respuesta.

Formato general:

``` json
{
  "status": "error",
  "message": "El correo electrónico ya está registrado",
  "code": "USER_EMAIL_ALREADY_EXISTS"
}
```

-   `status`: indica que la operación produjo un error.
-   `message`: descripción del problema.
-   `code`: identificador del error.
-   `details` (opcional): información adicional, por ejemplo, errores de
    validación de Mongoose.

Ejemplo de validación:

``` json
{
  "status": "error",
  "message": "Los datos enviados no cumplen las validaciones",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "price",
      "message": "El precio no cumple la validación del modelo."
    }
  ]
}
```

### Códigos de error principales

  --------------------------------------------------------------------------------
  Código                                                HTTP Situación
  ----------------------------- ---------------------------- ---------------------
  `EMAIL_REQUIRED`                                       400 No se proporcionó el
                                                             correo requerido.

  `INVALID_MOCK_QTY`                                     400 Cantidad de mocks
                                                             fuera del rango
                                                             entero de 1 a 100.

  `INVALID_PRODUCT_STATUS`                               400 Estado de producto no
                                                             permitido.

  `INVALID_PRODUCT_STOCK`                                400 Stock negativo o no
                                                             válido.

  `INVALID_ID`                                           400 Identificador con
                                                             formato no válido
                                                             para Mongoose.

  `VALIDATION_ERROR`                                     400 Datos que no cumplen
                                                             las validaciones del
                                                             esquema.

  `FILE_REQUIRED`                                        400 No se adjuntó un
                                                             archivo.

  `INVALID_FILE_TYPE`                                    400 Formato o combinación
                                                             MIME/extensión no
                                                             permitida.

  `INVALID_UPLOAD_FIELD`                                 400 Campo de archivo
                                                             distinto de `file`.

  `INVALID_DOCUMENT_TYPE`                                400 Tipo de documento no
                                                             permitido.

  `ORDER_NOT_FOUND`                                      404 Pedido inexistente.

  `PRODUCT_NOT_FOUND`                                    404 Producto inexistente.

  `USER_NOT_FOUND`                                       404 Usuario inexistente.

  `STORE_NOT_FOUND`                                      404 Tienda inexistente.

  `ROUTE_NOT_FOUND`                                      404 Ruta inexistente.

  `USER_EMAIL_ALREADY_EXISTS`                            409 Correo electrónico ya
                                                             registrado.

  `DUPLICATE_RESOURCE`                                   409 Recurso duplicado.

  `FILE_TOO_LARGE`                                       413 Archivo superior a 5
                                                             MB.

  `DATABASE_ERROR`                                       500 Error en operación de
                                                             base de datos.

  `MOCK_GENERATION_FAILED`                               500 No fue posible
                                                             generar datos de
                                                             prueba.

  `MOCK_SEED_FAILED`                                     500 No fue posible
                                                             insertar datos de
                                                             prueba.

  `UPLOAD_SAVE_FAILED`                                   500 No fue posible
                                                             guardar el archivo.

  `INTERNAL_ERROR`                                       500 Error interno no
                                                             clasificado.
  --------------------------------------------------------------------------------

Los errores internos se registran en el sistema de logging. La respuesta
al cliente utiliza mensajes genéricos para no exponer detalles internos.
El JSON malformado se responde como HTTP 400 y las rutas inexistentes
como HTTP 404 en formato JSON.

## Paginación y filtros

Los listados de usuarios y pedidos admiten paginación. El límite máximo
documentado es 100 registros por solicitud.

### Usuarios

``` http
GET http://localhost:8080/api/users?page=1&limit=10
GET http://localhost:8080/api/users?page=1&limit=10&role=customer
```

Parámetros: - `page`: número de página, entero positivo. - `limit`:
cantidad de registros, entre 1 y 100. - `role`: filtro opcional por rol
permitido.

La respuesta incluye `payload` y `pagination` con total de usuarios,
páginas, página actual y límite. El listado excluye el arreglo
`documents` para reducir el tamaño de la respuesta.

### Pedidos

``` http
GET http://localhost:8080/api/orders?page=1&limit=10
GET http://localhost:8080/api/orders?page=1&limit=10&status=pending&priority=high
```

Parámetros: - `page`: número de página, entero positivo. - `limit`:
cantidad de registros, entre 1 y 100. - `status`: filtro opcional por
estado permitido. - `priority`: filtro opcional por prioridad permitida.

La respuesta incluye `payload` y `pagination`. Los pedidos se ordenan
por fecha de creación descendente.

## Logging y monitoreo con Winston

El proyecto utiliza **Winston** como sistema centralizado de logging y
**winston-daily-rotate-file** para persistir registros con rotación
diaria. La configuración se encuentra en `src/logger/logger.js`.

### Niveles personalizados

  ------------------------------------------------------------------------
  Nivel                                    Prioridad Uso
  --------------------- ---------------------------- ---------------------
  `fatal`                                          0 Fallas críticas que
                                                     impiden continuar,
                                                     por ejemplo, una
                                                     conexión inicial
                                                     fallida a MongoDB.

  `error`                                          1 Errores de servidor y
                                                     operaciones fallidas.

  `warning`                                        2 Situaciones anómalas,
                                                     como recursos
                                                     inexistentes o
                                                     solicitudes
                                                     inválidas.

  `info`                                           3 Eventos relevantes y
                                                     operaciones exitosas.

  `http`                                           4 Información asociada
                                                     a solicitudes HTTP.

  `debug`                                          5 Información detallada
                                                     útil durante el
                                                     desarrollo.
  ------------------------------------------------------------------------

### Comportamiento por entorno

`LOG_LEVEL` selecciona el nivel de Winston. Su valor predeterminado es
`debug` en desarrollo e `info` en otros entornos. Los archivos de
aplicación registran desde `debug`; el archivo específico de errores
registra `error` y `fatal`.

### Archivos y rotación

Los registros se guardan en `logs/`:

``` text
logs/
├── application-YYYY-MM-DD.log
└── error-YYYY-MM-DD.log
```

-   `application-YYYY-MM-DD.log`: todos los niveles.
-   `error-YYYY-MM-DD.log`: niveles `error` y `fatal`.
-   Rotación diaria.
-   Tamaño máximo: `10m`.
-   Retención general: `14d`.
-   Retención de errores: `30d`.

Winston puede crear archivos `.audit.json` para mantener el estado de la
rotación. `logs/`, `*.log` y `*.audit.json` están excluidos de Git
mediante `.gitignore`.

### Endpoint de prueba del logger

``` http
GET http://localhost:8080/api/loggerTest
```

Respuesta esperada:

``` json
{
  "status": "success",
  "message": "Prueba de los seis niveles de Winston ejecutada correctamente"
}
```

El endpoint registra mensajes de prueba de `debug`, `http`, `info`,
`warning`, `error` y `fatal`. Está destinado a pruebas y solo se monta
fuera de producción.

El logger también se utiliza en el servidor, el middleware global de
errores y servicios como mocks y pedidos.

## Pruebas automatizadas

Ejecutar la suite con:

``` bash
npm test
```

La suite cubre, entre otros aspectos: - Health check y endpoint de
logging. - Listado, paginación y filtros de usuarios. - Creación y carga
de documentos de usuarios. - Listado, paginación y filtros de pedidos. -
Consulta de pedidos por identificador y entrega. - Carga de
comprobantes, validaciones y limpieza de archivos ante fallos.

**En la última ejecución registrada durante la preparación de esta
entrega se aprobaron 53 pruebas.** Ejecutar `npm test` nuevamente
después de cualquier modificación para confirmar el resultado vigente.

## Pruebas de errores con Postman

Con el servidor activo en `http://localhost:8080`, se pueden reproducir
los siguientes casos.

### Mocks: cantidades inválidas

``` http
GET http://localhost:8080/api/mocks/users?qty=-2
GET http://localhost:8080/api/mocks/users?qty=0
GET http://localhost:8080/api/mocks/users?qty=2.5
GET http://localhost:8080/api/mocks/users?qty=150
```

Se espera HTTP `400` y `INVALID_MOCK_QTY`.

### Pedidos inexistentes e identificadores inválidos

``` http
GET http://localhost:8080/api/orders/690000000000000000000001
```

Si el pedido no existe, se espera HTTP `404` y `ORDER_NOT_FOUND`.

``` http
GET http://localhost:8080/api/orders/123
```

Se espera HTTP `400` y `INVALID_ID`.

### Usuarios: correo duplicado y obligatorio

Enviar `POST http://localhost:8080/api/users` con un correo que ya
exista, utilizando el cuerpo requerido por Swagger. Se espera HTTP `409`
y `USER_EMAIL_ALREADY_EXISTS`.

Enviar un `POST` al mismo endpoint omitiendo el correo electrónico y
manteniendo los demás campos requeridos. Se espera HTTP `400` y
`EMAIL_REQUIRED`.

### Productos: estado y stock inválidos

``` http
GET http://localhost:8080/api/products?status=INVENTADO
```

Se espera HTTP `400` y `INVALID_PRODUCT_STATUS`.

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

Se espera HTTP `400` y `INVALID_PRODUCT_STOCK`.

### Validación Mongoose

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

Se espera HTTP `400`, `VALIDATION_ERROR` y un arreglo `details` que
identifique `price`.

### JSON malformado y rutas inexistentes

Enviar un cuerpo JSON inválido a un endpoint que espera JSON. Se espera
HTTP `400` en formato JSON.

Consultar una ruta inexistente. Se espera HTTP `404` y `ROUTE_NOT_FOUND`
en formato JSON.

## Mocks y Seed

Generar usuarios:

``` http
GET http://localhost:8080/api/mocks/users?qty=2
```

Generar pedidos:

``` http
GET http://localhost:8080/api/mocks/orders?qty=2
```

Generar entregas:

``` http
GET http://localhost:8080/api/mocks/deliveries?qty=2
```

Insertar datos de prueba:

``` http
POST http://localhost:8080/api/mocks/seed
```

Si no se envía cantidad, `seed` utiliza el valor predeterminado de 10.
Inserta usuarios, conductores, pedidos y entregas. La operación modifica
MongoDB; evitar repetirla innecesariamente.

Para crear un pedido de prueba desde Swagger: 1. Ejecutar el endpoint de
seed. 2. Identificar un `userId` y un `storeId` válidos entre los datos
generados o consultando MongoDB. 3. Abrir Swagger UI y localizar el
endpoint de creación de pedidos. 4. Seleccionar **Try it out** e
ingresar los identificadores existentes y los demás campos requeridos.
5. Ejecutar la solicitud y revisar la respuesta.

Los identificadores deben corresponder a registros existentes en la base
utilizada por la API.

## Carga de archivos con Multer

La API permite cargar documentos de usuarios y comprobantes de pedidos.
Multer utiliza almacenamiento en disco (`diskStorage`); MongoDB conserva
los metadatos, no el contenido binario.

### Configuración y almacenamiento

La configuración centralizada se encuentra en
`src/config/multer.config.js`:

-   `uploads/users/`: documentos de usuarios.
-   `uploads/orders/`: comprobantes de pedidos.
-   Nombres de archivo generados mediante UUID, conservando la
    extensión.
-   Tipos permitidos: PDF (`application/pdf`), JPG/JPEG (`image/jpeg`) y
    PNG (`image/png`), con correspondencia MIME/extensión.
-   Tamaño máximo: **5 MB**.
-   Un archivo por solicitud, recibido en el campo `file`.
-   Directorio base configurable mediante `UPLOADS_DIR`.

`uploads/` está excluido de Git. Los archivos se almacenan en el sistema
de archivos del servidor y no deben agregarse al repositorio.

### Endpoints de carga

Todas las solicitudes utilizan `multipart/form-data`.

  -----------------------------------------------------------------------------------
  Método            Endpoint                      Campos            Descripción
  ----------------- ----------------------------- ----------------- -----------------
  `POST`            `/api/users/{id}/documents`   `file` (File),    Carga un
                                                  `documentType`    documento para un
                                                  (Text)            usuario
                                                                    existente.

  `POST`            `/api/orders/{id}/receipt`    `file` (File)     Carga un
                                                                    comprobante para
                                                                    un pedido
                                                                    existente.
  -----------------------------------------------------------------------------------

Valores permitidos de `documentType`: - `identity` - `driver_license` -
`vehicle_registration` - `other`

Ejemplo de documento de usuario, en Postman seleccionar `POST` → `Body`
→ `form-data`:

  Key              Type   Value
  ---------------- ------ ------------------------------------
  `file`           File   PDF, JPG/JPEG o PNG de hasta 5 MB.
  `documentType`   Text   `identity` u otro valor permitido.

``` http
POST http://localhost:8080/api/users/ID_DEL_USUARIO/documents
```

Ejemplo de comprobante:

  Key      Type   Value
  -------- ------ ------------------------------------
  `file`   File   PDF, JPG/JPEG o PNG de hasta 5 MB.

``` http
POST http://localhost:8080/api/orders/ID_DEL_PEDIDO/receipt
```

No establecer manualmente `Content-Type`: Postman debe generar
`multipart/form-data` con su `boundary`.

### Metadatos y limpieza

Los metadatos almacenados incluyen: - `originalName`: nombre original. -
`generatedName`: nombre único generado por el servidor. - `mimeType`:
tipo MIME. - `size`: tamaño en bytes. - `uploadedAt`: fecha y hora de
carga. - `documentType`: categoría, solo para documentos de usuario.

La ruta física se utiliza internamente para almacenamiento y limpieza,
pero no se expone en las respuestas de la API ni forma parte de los
metadatos públicos de `Order.receipt`.

Si falla la asociación del archivo con el usuario o pedido, el servicio
intenta eliminar el archivo físico para evitar archivos huérfanos.

### Errores de carga

  ----------------------------------------------------------------------------
  Código                                            HTTP Situación
  ------------------------- ---------------------------- ---------------------
  `FILE_REQUIRED`                                    400 No se adjuntó un
                                                         archivo.

  `INVALID_FILE_TYPE`                                400 Tipo o combinación
                                                         MIME/extensión no
                                                         permitida.

  `INVALID_UPLOAD_FIELD`                             400 Campo de archivo
                                                         distinto de `file`.

  `INVALID_DOCUMENT_TYPE`                            400 Tipo de documento no
                                                         permitido.

  `USER_NOT_FOUND`                                   404 Usuario inexistente.

  `ORDER_NOT_FOUND`                                  404 Pedido inexistente.

  `FILE_TOO_LARGE`                                   413 Archivo superior a 5
                                                         MB.

  `UPLOAD_SAVE_FAILED`                               500 No fue posible
                                                         guardar el archivo.
  ----------------------------------------------------------------------------

Las pruebas automatizadas incluyen carga válida, extensión no permitida,
archivo superior a 5 MB y limpieza cuando falla la asociación del
archivo.

## Configuración de producción

La aplicación valida las variables críticas al iniciar. Si falta una
variable obligatoria o su valor no cumple las validaciones, el proceso
falla durante el inicio.

Variables obligatorias: - `PORT` - `MONGODB_URI` - `NODE_ENV`

Entornos admitidos: `development`, `test` y `production`.

`LOG_LEVEL` y `UPLOADS_DIR` permiten configurar logging y
almacenamiento; si no se proporcionan, se aplican valores
predeterminados.

En producción: - Proporcionar las variables desde el entorno de
despliegue. - No incluir credenciales ni archivos `.env` en la imagen o
el repositorio. - Utilizar una base de datos independiente de la base de
pruebas. - Mantener logs y archivos cargados fuera del control de
versiones. - `/api/docs`, `/api/mocks` y `/api/loggerTest` no se montan
cuando `NODE_ENV=production`. - `/api/health` permanece disponible para
comprobar el estado de la API.

## Docker

El proyecto incluye un `Dockerfile` basado en Node.js 22 Alpine. Instala
dependencias de producción, copia el código y expone el puerto `8080`.

### Construir imagen

Desde la raíz del proyecto:

``` bash
docker build -t shipnow-api .
```

### Ejecutar contenedor

El contenedor recibe variables desde `.env` y monta un volumen Docker
para persistir los archivos cargados:

``` bash
docker run -d --name shipnow-container -p 8080:8080 --env-file .env -v shipnow-uploads:/app/uploads shipnow-api
```

La API queda accesible en `http://localhost:8080`.

### Verificaciones

Estado del contenedor:

``` bash
docker ps --filter name=shipnow-container
```

Logs:

``` bash
docker logs shipnow-container
```

Health check:

``` bash
curl http://localhost:8080/api/health
```

Swagger, fuera de producción:

``` bash
curl -I http://localhost:8080/api/docs/
```

Debe responder HTTP `200` cuando el entorno no es producción.

### Volumen persistente

El volumen `shipnow-uploads` se monta en `/app/uploads`. Los archivos
almacenados en el volumen persisten aunque se elimine y se cree
nuevamente el contenedor.

Comprobar el montaje:

``` bash
docker inspect shipnow-container --format '{{json .Mounts}}'
```

Eliminar el contenedor no elimina el volumen. No eliminar el volumen si
se desea conservar los archivos cargados.

### Archivos excluidos de la imagen

`.dockerignore` excluye elementos que no deben incorporarse al contexto
de construcción, como: - `node_modules/` - `.env` y archivos de entorno
locales - `.git/` - `logs/` - `uploads/` - `coverage/` - archivos
temporales

Las variables se inyectan al iniciar el contenedor. Los logs y archivos
cargados deben gestionarse mediante almacenamiento persistente o la
solución de almacenamiento definida para el despliegue.

## Consideraciones finales

-   No subir `.env`, credenciales ni cadenas de conexión al repositorio.
-   No incluir `node_modules/` en Git.
-   No incluir `logs/`, `*.log` ni `*.audit.json` en Git.
-   No incluir `uploads/` ni los archivos cargados por Multer en Git.
-   Utilizar `.env.example` como referencia.
-   Las solicitudes que crean registros y la operación `seed` modifican
    MongoDB. Utilizar datos de prueba y revisar la base antes de repetir
    operaciones.
-   Los endpoints de documentación, mocks y prueba de logging son
    herramientas internas y no están habilitados en producción.
-   Ejecutar `npm test` antes de integrar cambios en la rama principal.
