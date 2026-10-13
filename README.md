# ShipNow v2 (refactorizada, red de seguridad de la demo)

Resultado esperado de la demo de la clase 1: capas Controller → Service → Repository,
configuración centralizada con validación al arranque y constantes del dominio.

## Correr

```bash
npm install
cp .env.example .env   # y completá los valores (el .env incluido es solo para la demo local)
npm run dev
```

Probá borrar `MONGODB_URI` del `.env` y correr: la app no arranca y dice qué falta.

## Estructura

```
src/
├── app.js
├── config/index.js          # único lugar que lee process.env
├── constants/index.js       # ORDER_STATUS, USER_ROLES con Object.freeze
├── controllers/             # traducen HTTP <-> servicios
├── services/                # reglas de negocio, sin req/res
├── repositories/            # únicos que conocen Mongoose
├── routes/                  # path + método del controller
└── models/                  # esquemas
```

Los mismos requests de Postman de v1 funcionan acá; cambia la forma de la respuesta
(`{ status, payload }` / `{ status, error }`) y los códigos HTTP pasan a ser correctos.
