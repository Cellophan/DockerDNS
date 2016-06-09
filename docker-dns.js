'use strict';

var dns = require('native-dns');
var util = require('util');
var exec = require('child_process').exec;

var dateFormat = require('dateformat');

var os = require('os');
var ifaces = os.networkInterfaces();

var NSEntry = dns.NS({
  name: "docker.",
  ttl: "30",
  data: "ns.docker."
})

var Slaves = []
var NSAs = []
// Getting the Ips of the OS
Object.keys(ifaces).forEach(function (name) {
  ifaces[name].forEach(function (connection) {
    if ('IPv4' !== connection.family || connection.internal !== false) {
      return; }

    NSAs.push(dns.A({
      name: "ns.docker.",
      ttl: "30",
      address: connection.address }));
  });
});

//console.log(DNSEntries)

function serverOnRequest (request, response) {
  // Printing the requests received
  request.question.forEach( function (q) {
    console.log('docker-dns.js: question: ' + q.name + ' ' + dns.consts.QTYPE_TO_NAME[q.type]);
  })

  // Adding authority field
  response.authority.push(NSEntry)
  // Adding additional field
  response.additional.concat(NSAs)
  // This repsonse is authoritative
  response.header.aa = true;

  var SOAEntry = dns.SOA({
    name: "docker.",
    // This TTL could be more if the script notify the slave of an update, but it's not implemented
    ttl: 30,
    primary: "ns.docker.",
    admin: "postmaster.docker.",
    serial: dateFormat(new Date(), "mmddhhMMss"),
    refresh: 10,
    retry: 3,
    expiration: 30,
    minimum: 30
  })

  // This program responds to only the first question
  request.question.forEach( function (question) {
    if ("SOA" == dns.consts.QTYPE_TO_NAME[question.type]) {
      response.answer.push(SOAEntry)
      response.send();
    }

    if ("AXFR" == dns.consts.QTYPE_TO_NAME[question.type] || "IXFR" == dns.consts.QTYPE_TO_NAME[question.type]) {
      if (! Slaves.inArray(response.address))
        Slaves.push(response.address)

      response.answer.push(SOAEntry)
      response.answer.push(NSEntry)
      NSAs.forEach( function (entry) {
        response.answer.push(entry); })
      exec("docker inspect -f '{{.Name}} {{.NetworkSettings.IPAddress}}' $(docker ps -aq)", function (error, stdout, stderr) {
        // Error cases not managed
        if (stdout) {
          stdout.trim().split("\n").forEach( function (line) {
            var splitted = line.replace(/\//, '').split(/ /)
            //Filter out reponses which are empty or with a _
            if (String(splitted[1]).length > 0 && ! splitted[0].match(/_/)) {
              response.answer.push(dns.A({
                name: splitted[0] + '.docker.',
                ttl: 30,
                address: splitted[1] }))
            }
          })
          response.answer.push(SOAEntry);
          response.send();
        }
      })
    }

    if ("A" == dns.consts.QTYPE_TO_NAME[question.type]) {
      // Extractingthe name from the DNS request
      var domain = question.name
      var regex = /([-_.a-z]*).docker.?/i;
      var name = domain.match(regex);

      // TODO: Should detect ns here.
      if ('ns' == name) {
        NSAs.forEach( function (entry) {
          response.answer.push(entry); })
        response.send();
      } else {
        // Asking docker to know what is the IP the container with this name
        exec("docker inspect -f '{{.NetworkSettings.IPAddress}}' " + name[1].trim(), function (error, stdout, stderr) {
          // Error cases not managed
          if (stdout) {
            response.answer.push(dns.A({
              name: domain,
              ttl: 30,
              address: stdout.trim() }))
            response.send();
          }
        });
      }
    }
  });
};

function serverOnError (err, buff, req, res) {
  console.log(err.stack);
};

var serverUDP = dns.createUDPServer();
serverUDP.on('request', serverOnRequest);
serverUDP.on('error', serverOnError);
serverUDP.on('listening', function () { console.log("Listening on UDP") })

var serverTCP = dns.createTCPServer();
serverTCP.on('request', serverOnRequest);
serverTCP.on('error', serverOnError);
serverTCP.on('listening', function () { console.log("Listening on TCP") })

// TODO: use a variable ionstead of 5353
console.log('Listening on 0.0.0.0:' + 5353);
serverUDP.serve(5353);
serverTCP.serve(5353);
