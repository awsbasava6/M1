# ---------- BUILD STAGE ----------
FROM node:18-alpine AS build

WORKDIR /app

# Copy only dependency files first (cache optimization)
COPY package*.json ./

RUN npm ci

# Copy source
COPY . .

# Build static files
RUN npm run build


# ---------- RUNTIME STAGE ----------
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config (optional but best practice)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

