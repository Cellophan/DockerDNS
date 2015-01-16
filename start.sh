#!/bin/bash -e

node /app/docker-dns.js &
named -fc /etc/bind/named.conf

