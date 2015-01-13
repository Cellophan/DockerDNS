'use strict';

var dns = require('native-dns');
var util = require('util');
var exec = require('child_process').exec;

var os = require('os');
var ifaces = os.networkInterfaces();
var ipaddresses = [];

// Getting the Ips of the OS
Object.keys(ifaces).forEach(function (name) {
  ifaces[name].forEach(function (connection) {
    if ('IPv4' !== connection.family || connection.internal !== false) {
      return;
    }

    ipaddresses.push(connection.address);
  });
});


var server = dns.createServer();

server.on('request', function (request, response) {
	// Printing the requests received
	request.question.forEach( function (q) {
		console.log('docker-dns.js: question: ' + q.name + ' ' + dns.consts.QTYPE_TO_NAME[q.type]);
	})

	// Extractingthe name from the DNS request
	var domain = request.question[0].name
	var regex = /([-_.a-z]*).docker.?/i;
	var name = domain.match(regex);
	if (name) {
		// TODO: Should detect ns here.
		// Asking docker to know what is the IP the container with this name
		exec("docker inspect -f '{{.NetworkSettings.IPAddress}}' " + name[1].trim(), function (error, stdout, stderr) {
			// Error cases not managed
			if (stdout) {
				// Responding IP asked
				response.answer.push(dns.A({
					name: domain,
					ttl: 30,
					address: stdout.trim() }))
				//To be clean, responding authority
				response.authority.push(dns.NS({
					name: "docker.",
					ttl: "30",
					data: "ns.docker." }))
				// All IP of the OS are responded as possible IP to reach ns.docker.
				ipaddresses.forEach( function (ip) {
					response.additional.push(dns.A({
						name: "ns.docker.",
						ttl: "30",
						address: ip }))
				})
			}
			response.send(); });
	} else {
		response.send(); }
});

server.on('error', function (err, buff, req, res) {
  console.log(err.stack);
});

// TODO: use a variable ionstead of 5353
console.log('Listening on 0.0.0.0:' + 5353);
server.serve(5353);
