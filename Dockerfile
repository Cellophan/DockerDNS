FROM debian:stable

#Install nodejs
RUN apt-get update; apt-get install -qy python g++ make checkinstall fakeroot wget
RUN src=$(mktemp -d) && cd $src ;\
  wget -N http://nodejs.org/dist/node-latest.tar.gz &&\
  tar xzvf node-latest.tar.gz && cd node-v* &&\
  ./configure &&\
  fakeroot checkinstall -y --install=no --pkgversion $(echo $(pwd) | sed -n -re's/.+node-v(.+)$/\1/p') make -j$(($(nproc)+0)) install &&\
  dpkg -i node_*

#Install docker
RUN apt-get install -qy curl
RUN curl -sSL https://get.docker.com/ | sh
#VOLUME /var/run/docker.sock

#Install bind9
RUN apt-get install -qy bind9 dnsutils
COPY named.conf.local /etc/bind/
RUN sed -i '/dnssec-validation/d' /etc/bind/named.conf.options
EXPOSE 53

#Install app
#app inspired from https://github.com/tjfontaine/node-dns
RUN mkdir /app
RUN cd /app; npm install native-dns
COPY docker-dns.js /app/

CMD node /app/docker-dns.js
