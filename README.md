DockerDNS
=========
Resolve IP address of containers

*Not tested.*

docker-dns.js listens on port 5353 and resolves DNS name <container name>.docker to the IP.

* Build it with: docker build -t dockerdns https://github.com/Cellophan/DockerDNS.git
* Run it with: docker run --rm -ti --publish-all -v /var/run/docker.sock:/var/run/docker.sock dockerdns

To Do
=========
Add bind for true DNS server and just add the .docker zone.

