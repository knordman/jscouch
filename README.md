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
jscouch -- utility for pushing docs containing js to CouchDB

Usage:
 jscouch <command> <directory> http://mycouch:5984/dbname

Commands:
  help   : Show this help
  push   : Push docs to server.

Config file config [read from .jscouch.json]:
{
  "filter": "include filter for files in directory",
  "auth": {
    "tls": {
      "cert": "path to tls client cert",
      "key": "path to tls client cert private key",
      "passphrase": "tls client cert passphrase",
      "ca": "path to CA cert for database tls server cert"
    },
    "basic": {
      "user": "basic auth user",
      "pass": "basic auth password"
    },
    "headers": {
      "x-header-name": "one entry for each extra header"
    }
  },
  "overrides": {
    "http://mycouch:5984": {
      "auth": {
        "same as": "above"
      }
    }
  }
}
</pre>
