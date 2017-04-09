# Installation

Install node.

Install npm.

<pre>
$ git clone repo
$ cd jscouch
$ npm install
$ npm link .
</pre>

# Difference to node.couchapp.js

No attachments, less dependencies (only requests), more options for authenticating. 

# Running

<pre>
couchjs -- utility for pushing docs containing js to CouchDB

Usage:
 couchjs <command> <docsdirectory> http://localhost:5984/dbname

Commands:
  push   : Push docs to server.

Config file [.couchjs.json]:
{
  "tls": {
    "cert": "path to tls client cert",
    "key": "path to tls client cert private key",
    "passphrase": "tls client cert passphrase",
    "ca": "path to CA for database tls server cert"
  },
  "auth": {
    "user": "basic auth user",
    "pass": "basic auth password"
  },
  "filter": "include filter for docsdirectory"
}
</pre>
