FROM alpine:3.19

RUN apk add --no-cache curl jq

COPY connector.json /config/connector.json
COPY register.sh /register.sh
RUN chmod +x /register.sh

CMD ["/register.sh"]
