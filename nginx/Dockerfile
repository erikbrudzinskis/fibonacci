FROM nginx:latest
# Use our configuration instead of the one supplied with nginx
# The only difference between dev and prod config is that we don't route web-socket connections in prod
COPY ./prod-default.conf /etc/nginx/conf.d/default.conf