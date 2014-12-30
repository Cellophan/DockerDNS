FROM debian:stable

RUN apt-get update; apt-get install -qy python g++ make checkinstall fakeroot wget
RUN src=$(mktemp -d) && cd $src ;\
  wget -N http://nodejs.org/dist/node-latest.tar.gz ;\
  tar xzvf node-latest.tar.gz && cd node-v* ;\
  ./configure ;\
  fakeroot checkinstall -y --install=no --pkgversion $(echo $(pwd) | sed -n -re's/.+node-v(.+)$/\1/p') make -j$(($(nproc)+1)) install ;\
  dpkg -i node_*
RUN npm install -g native-dns

RUN apt-get install -qy curl
RUN curl -sSL https://get.docker.com/ | sh

#https://github.com/tjfontaine/node-dns
RUN mkdir /app
COPY docker-dns.js /app/
CMD node /app/docker-dns.js
VOLUME /var/run/docker.sock
EXPOSE 53

