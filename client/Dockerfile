FROM node:21-alpine AS builder
WORKDIR '/app'
COPY ./package.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:latest
# Since it is not our main nginx server, we only need to expose port 3000 in order for main nginx server to be able to access this
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html