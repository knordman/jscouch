#!/usr/bin/env node
'use strict';
// Copyright 2017 Kristian Nordman, 2015 Mikeal Rogers 
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

var jscouch = require('./main.js');
var fs = require('fs');
var path = require('path');


if (require.main === module) {
    var node = process.argv.shift();
    var bin = process.argv.shift();
    var command = process.argv.shift();
    var dir = process.argv.shift();
    var database = process.argv.shift();

    if (command == 'help' || command == undefined) {
        console.log(
            [ "jscouch -- utility for pushing docs containing js to CouchDB"
            , ""
            , "Usage:"
            , " jscouch <command> <directory> http://mycouch:5984/dbname" 
            , ""
            , "Commands:"
            , "  help   : Show this help"
            , "  push   : Push docs to server."
            , ""
            , "Config file config [read from .jscouch.json]:"
            , JSON.stringify({
                'filter': 'include filter for files in directory',
                'auth': {
                    'tls': {
                        'cert': 'path to tls client cert',
                        'key': 'path to tls client cert private key',
                        'passphrase': 'tls client cert passphrase',
                        'ca': 'path to CA cert for database tls server cert'
                    },
                    'basic': {
                        'user': 'basic auth user',
                        'pass': 'basic auth password'
                    },
                    'headers': {
                        'x-header-name': 'one entry for each extra header'
                    }
                },
                'overrides': {
                    'http://mycouch:5984' : {
                        'auth': {
                            'same as': 'above'
                        }
                    }
                }
            }, null, 2)
            ]
            .join('\n')
        )
        process.exit();
    }

    // Default config
    var config = {
        filter: '.*_db\.js'
    }

    if (fs.existsSync('.jscouch.json')) {
        try {
            config = JSON.parse(fs.readFileSync('.jscouch.json'));
            log.info('using config file .jscouch.json');
        }
        catch(err) {
            throw new Error('cannot parse the .jscouch.json config file');
        }
    }

    var docs = fs.readdirSync(dir) || [];
    docs.filter(entry => {
        return entry.match(config.filter);
    }).forEach((doc, index) => {
        console.log(`Detected ${doc}`);
        let docPath = path.join(process.cwd(), dir, doc);
        jscouch.prepareFile(require(docPath).doc, config).do(command, database);
    });
}
