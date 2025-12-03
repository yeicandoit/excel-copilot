FROM nginx:trixie-perl
COPY ./build /var/excel-copilot
COPY ./startup.sh /var/excel-copilot
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
WORKDIR /var/excel-copilot
RUN chmod 755 startup.sh
ENTRYPOINT ["sh", "./startup.sh"]
