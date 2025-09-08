# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Build admin
FROM node:20-alpine AS admin-build
WORKDIR /app/admin
COPY admin/package*.json ./
RUN npm install
COPY admin/ .
RUN npm run build

# Stage 3: Nginx to serve both
FROM nginx:alpine
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/frontend
COPY --from=admin-build /app/admin/dist /usr/share/nginx/admin
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
