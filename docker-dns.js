
var dns = require('native-dns');
var util = require('util');
var exec = require('child_process').exec;

var server = dns.createServer();

server.on('request', function (request, response) {
	domain = request.question[0].name
	regex = /([-_.a-z]*).docker.?/i;
	name = domain.match(regex);
	if (name) {
		exec("docker inspect -f '{{.NetworkSettings.IPAddress}}' " + name[1].trim(), function (error, stdout, stderr) {
			if (stdout) {
				response.answer.push(dns.A(
					{ name: domain, address: stdout.trim(), ttl: 30 }
				)) }
			response.send(); });
	} else {
		response.send(); }
});

server.on('error', function (err, buff, req, res) {
  console.log(err.stack);
});

console.log('Listening on ' + 5353);
server.serve(5353);

