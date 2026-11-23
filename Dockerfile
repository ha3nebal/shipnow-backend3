
# Imagen base de Node.js
FROM node:22-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --omit=dev

# Copiar el código fuente
COPY . .

# Puerto utilizado por ShipNow
EXPOSE 8080

# Iniciar la aplicación
CMD ["npm", "start"]
