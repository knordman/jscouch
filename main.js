"use strict";
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

var path = require('path')
    , fs = require('fs')
    , request = require('request')
    ;


function prepare_file(jsdoc, config) {
    let push_doc = {
        doc: jsdoc,
        config: config
    }

    let prepare = function (x) {
        for (let i in x) {
            if (i[0] != '_') {
                if (typeof x[i] == 'function') {
                    x[i] = x[i].toString()
                    x[i] = 'function '+x[i].slice(x[i].indexOf('('))
                }
                if (typeof x[i] == 'object') {
                    prepare(x[i])
                }
            }
        }
    }

    let request_options = function(url, method=null, body=null) {
        let options = {
            uri:url, 
            headers: {
                'content-type': 'application/json', 
                'accept-type': 'application/json',
            }
        }

        if (method) {
            options.method = method;
        }

        if (body) {
            options.body = body;
        }

        if (config.tls) {
            if (config.tls.cert) {
                options.key = fs.readFileSync(config.tls.key);
                options.cert = fs.readFileSync(config.tls.cert);
                if (config.tls.passphrase) {
                    options.passphrase = config.tls.passphrase;
                }
            }

            if (config.tls.ca) {
                options.ca = fs.readFileSync(config.tls.ca);
            }
        }

        if (config.auth) {
            options.auth = {
                user: config.auth.user,
                pass: config.auth.pass
            }
        }

        return options;
    };

    push_doc.do = function(command, database) {
        if (command === 'push') {
            let to_url = database + '/' + push_doc.doc._id;

            request(request_options(to_url), function (err, resp, body) {
                if (err) {
                    throw err;
                }
                else if (resp.statusCode == 404) {
                    /* Not found, then ok to PUT without _rev */
                }
                else if (resp.statusCode !== 200) {
                    throw new Error("Failed to get doc\n" + body);
                }
                else {
                    push_doc.current = JSON.parse(body);
                    push_doc.doc._rev = push_doc.current._rev;
                }

                prepare(push_doc.doc);
                let put_body = JSON.stringify(push_doc.doc);

                console.log('PUT ' + to_url.replace(/^(https?:\/\/[^@:]+):[^@]+@/, '$1:******@'))

                request(request_options(to_url, 'PUT', put_body), function (err, resp, body) {
                    if (err) {
                        throw err;
                    }
                    else if (resp.statusCode !== 201) {
                        throw new Error("Could not push document\nCode: " + resp.statusCode + "\n" + body)
                    }

                    push_doc.doc._rev = JSON.parse(body).rev;
                    console.log('Finished push: ', push_doc.doc._id, 'new rev: ' + push_doc.doc._rev);
                });
            });
        }
    };

    return push_doc;
}

exports.prepare_file = prepare_file;
exports.bin = require('./bin');
