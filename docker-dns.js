//'use strict';

var dns = require('native-dns');
var util = require('util');
var exec = require('child_process').exec;

var os = require('os');
var interfaces = os.networkInterfaces();
var mainIP;

Object.keys(interfaces).forEach(function (name) {
  interfaces[name].forEach(function (connection) {
    if ('IPv4' !== connection.family || connection.internal !== false) {
      return;
    }

    mainIP = connection.address;
  });
});


console.log("mainIP: " + mainIP);


var server = dns.createServer();

server.on('request', function (request, response) {
	request.question.forEach( function (q) {
		console.log('docker-dns.js: question: ' + q.name + ' ' + dns.consts.QTYPE_TO_NAME[q.type]);
	})
	domain = request.question[0].name
	regex = /([-_.a-z]*).docker.?/i;
	name = domain.match(regex);
	if (name) {
		exec("docker inspect -f '{{.NetworkSettings.IPAddress}}' " + name[1].trim(), function (error, stdout, stderr) {
			if (stdout) {
				//var date = new Date();
				response.answer.push(dns.A({
					name: domain,
					address: stdout.trim(),
					ttl: 30
				}))
/*				response.answer.push(dns.SOA({
					primary: "ns.docker.",
					admin: "fake.fake.docker.",
					serial: 1,
					refresh: 30,
					retry: 10,
					expiration: 30,
					minimum: 30
				}))
*/			}
			response.send();
		});
	} else {
		response.send(); }
});

server.on('error', function (err, buff, req, res) {
  console.log(err.stack);
});

console.log('Listening on ' + 5353);
server.serve(5353);

