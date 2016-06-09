# DEPRECATED
This project was just a reason to play a bit with nodejs. Now that docker has an impeded DNS (and that some LB start to be interesting (look at traefik)), this repo is useless.

# README.md
Resolve IP address of container based on them names.

docker-dns.js listens on port 5353 and resolves DNS name <container name>.docker to the IP.
The target of this goal is just to provide the functionnality, not the performances. If your need some, the file named.conf.local will show you how to add a bind (as slave) for the caching of the hosts.

## Build
`docker build -t dockerdns https://github.com/Cellophan/DockerDNS.git`

## Run
`docker run -d -p 53:53/udp -v /var/run/docker.sock:/var/run/docker.sock --name dockerdns dockerdns`

## Test
`dig -p 5353 @$(docker inspect -f '{{.NetworkSettings.IPAddress}}' dockerdns) dockerdns.docker`

# Known limits
=========
Because of the DNS standard, the names with an _ are not provided in return of AXFR request (otherwise bind considers the reponse invalid). But those names can still be resolved directly (perhaps it's working in a forward configuration (here onlw the slave is provided)).

