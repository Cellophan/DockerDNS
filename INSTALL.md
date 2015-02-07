How I installed it
=========
This is not about best pratices or what ever. Just a note about... the title, read the title.

* `groupadd --gid 900 dockerdns`
* `useradd --uid 900 --gid 900 --system --shell /bin/false --base-dir /opt dockerdns`
* `usermod -aG docker dockerdns`
* `service docker restart`
* `npm install -g forever native-dns dateformat`
* `forever start -a -l /var/log/docker-dns.log -o /var/log/docker-dns.out.log -e /var/log/docker-dns.err.log docker-dns.js`

