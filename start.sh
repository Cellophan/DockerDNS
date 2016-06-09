#!/bin/bash -e

service busybox-syslogd start
service bind9 start
/app/node_modules/forever/bin/forever -o /var/log/docker-dns.out.log -e /var/log/docker-dns.err.log /app/docker-dns.js

