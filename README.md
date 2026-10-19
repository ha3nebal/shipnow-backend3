
# ShipNow Backend

API REST para la gestión de usuarios, productos, tiendas y pedidos de ShipNow, desarrollada con Node.js, Express y MongoDB mediante Mongoose.

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- dotenv

## Requisitos

- Node.js instalado.
- MongoDB local o una instancia de MongoDB Atlas.
- Git (opcional, para clonar el repositorio).

## Instalación y ejecución

1. Clona el repositorio y entra en su carpeta.
2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea el archivo `.env` a partir del ejemplo:

   ```bash
   cp .env.example .env
   ```

4. Configura las variables de entorno en `.env`:

   ```env
   PORT=8080
   MONGODB_URI=mongodb://127.0.0.1:27017/shipnow
   NODE_ENV=development
   ```

   Cambia `MONGODB_URI` si utilizas MongoDB Atlas.

5. Inicia el servidor en desarrollo:

   ```bash
   npm run dev
   ```

   Para iniciar el servidor sin el modo de observación:

   ```bash
   npm start
   ```

La API estará disponible en `http://localhost:8080`, salvo que configures otro puerto.

## Arquitectura

El proyecto utiliza una arquitectura por capas:

- **Routes:** definen los endpoints HTTP y los vinculan con los controladores.
- **Controllers:** reciben las solicitudes, llaman a los servicios y construyen las respuestas HTTP.
- **Services:** contienen las reglas de negocio y coordinan las operaciones.
- **Repositories:** encapsulan las consultas y operaciones de persistencia con Mongoose.
- **Models:** definen los esquemas de MongoDB.
- **Config:** centraliza la configuración y valida las variables de entorno al iniciar la aplicación.
- **Constants:** contiene constantes inmutables del dominio.


### Decisiones de arquitectura: Service y Repository

La separación entre Service y Repository permite mantener las reglas de negocio independientes del acceso a la base de datos.

**Service — lógica de negocio**

En `src/services/products.service.js`, el servicio determina el estado de un producto según su stock: si es cero, el estado pasa a `out_of_stock`; si es mayor que cero, pasa a `available`. Esta decisión pertenece al servicio porque representa una regla de negocio y no una operación de persistencia.

**Repository — acceso a datos**

En `src/repositories/products.repository.js`, el repositorio encapsula las operaciones de Mongoose, como `findAll()`, `findById()` y `updateById()`. También centraliza los filtros y las proyecciones de las consultas, evitando que los controladores accedan directamente a MongoDB.

**¿Por qué separar ambas responsabilidades?**

Esta separación facilita el mantenimiento y las pruebas. Si cambia una regla de negocio, podemos modificar el servicio sin alterar las consultas de persistencia. Si cambia la forma de consultar la base de datos, podemos modificar el repositorio sin trasladar esa complejidad al controlador.

El controlador se limita a recibir la petición HTTP, invocar el servicio y devolver la respuesta correspondiente.


### Estructura del proyecto

```text
src/
├── app.js
├── config/
│   └── index.js
├── constants/
│   └── index.js
├── controllers/
├── models/
├── repositories/
├── routes/
└── services/
```

## Endpoints

### Products

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/products` | Crear un producto |
| GET | `/api/products` | Listar productos |
| GET | `/api/products/:id` | Consultar un producto |
| PUT | `/api/products/:id` | Actualizar un producto |
| DELETE | `/api/products/:id` | Eliminar un producto |

Los productos tienen nombre, descripción, precio, stock y estado. El servicio asigna `available` cuando el stock es mayor que cero y `out_of_stock` cuando es igual a cero.

### Users

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/users` | Crear un usuario |
| GET | `/api/users` | Listar usuarios |
| POST | `/api/users/stores` | Crear una tienda mediante el servicio de usuarios |

### Orders

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/orders` | Crear un pedido |
| GET | `/api/orders` | Listar pedidos |
| GET | `/api/orders/:id` | Consultar un pedido |
| PATCH | `/api/orders/:id/deliver` | Marcar un pedido como entregado |

## Variables de entorno

La configuración se centraliza en `src/config/env.config.js`. La aplicación valida `PORT`, `MONGODB_URI` y `NODE_ENV` al arrancar.

El archivo `.env` contiene la configuración local y no debe subirse al repositorio. `.env.example` sirve como plantilla para configurar el entorno.

## Pruebas

Los endpoints pueden probarse con Postman utilizando la URL base:

`http://localhost:8080`

Las respuestas utilizan una estructura común con `status` y `payload` para operaciones exitosas, o `status` y `error` para errores.

## Autor

Proyecto académico de Backend 3.
