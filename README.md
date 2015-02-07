DockerDNS
=========
Resolve IP address of container based on them names.

docker-dns.js listens on port 5353 and resolves DNS name <container name>.docker to the IP.
The target of this goal is just to provide the functionnality, not the performances. If your need some, the file named.conf.local will show you how to add a bind (as slave) for the caching of the hosts.

How to try
=========
The files Dockerfile, named.conf.local and start.sh are just there to show how to set up the environment of the program. For the dependencies, please take a look at the Dockerfile.

# Build it with: docker build -t dockerdns https://github.com/Cellophan/DockerDNS.git
# Run it with: docker run --rm -ti -v /var/run/docker.sock:/var/run/docker.sock dockerdns
# Test it with dig -p 5353 @$(docker inspect -f '{{.NetworkSettings.IPAddress}}' dockerdns) dockerdns.docker

Known limits
=========
Because of the DNS standard, the names with an _ are not provided in return of AXFR request (otherwise bind considers the reponse invalid). But those names can still be resolved directly (perhaps it's working in a forward configuration (here onlw the slave is provided)).

