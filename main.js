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

var fs = require('fs');
var request = require('request');


function prepareFile(jsdoc, config) {
    let pushDoc = {
        doc: jsdoc
    };

    let prepare = function (x) {
        for (let i in x) {
            if (i[0] != '_') {
                if (typeof x[i] == 'function') {
                    x[i] = x[i].toString();
                    x[i] = 'function '+x[i].slice(x[i].indexOf('('));
                }
                if (typeof x[i] == 'object') {
                    prepare(x[i]);
                }
            }
        }
    };

    let configureAuthOptions = function(authConfig, options) {
        if (authConfig) {
            if (authConfig.tls) {
                if (authConfig.tls.cert) {
                    options.key = fs.readFileSync(authConfig.tls.key);
                    options.cert = fs.readFileSync(authConfig.tls.cert);
                    if (authConfig.tls.passphrase) {
                        options.passphrase = authConfig.tls.passphrase;
                    }
                }

                if (authConfig.tls.ca) {
                    options.ca = fs.readFileSync(authConfig.tls.ca);
                }
            }

            if (authConfig.basic) {
                options.auth = {
                    user: authConfig.basic.user,
                    pass: authConfig.basic.pass
                };
            }

            if (authConfig.headers) {
                Object.keys(authConfig.headers).forEach(header => {
                    options.headers[header] = authConfig.headers[header];
                });
            }
        }
    };

    let requestOptions = function(url, method=null, body=null) {
        let options = {
            uri:url, 
            headers: {
                'content-type'  : 'application/json', 
                'accept-type'   : 'application/json',
            }
        };

        if (method) {
            options.method = method;
        }

        if (body) {
            options.body = body;
        }

        configureAuthOptions(config.auth, options);

        let match = url.match(/https?:\/\/\w+(:\d+)?/);
        if (match) {
            let host = match[0];
            if (config.overrides[host].auth) {
                configureAuthOptions(config.overrides[host].auth, options);
            }
        }

        return options;
    };

    pushDoc.do = function(command, database) {
        if (command === 'push') {
            let toURL = database + '/' + pushDoc.doc._id;

            request(requestOptions(toURL), function (err, resp, body) {
                if (err) {
                    throw err;
                }
                else if (resp.statusCode == 404) {
                    /* Not found, then ok to PUT without _rev */
                }
                else if (resp.statusCode !== 200) {
                    throw new Error(`failed to get doc: ${body}`);
                }
                else {
                    pushDoc.current = JSON.parse(body);
                    pushDoc.doc._rev = pushDoc.current._rev;
                }

                prepare(pushDoc.doc);
                let putBody = JSON.stringify(pushDoc.doc);

                console.log('PUT ' + toURL.replace(/^(https?:\/\/[^@:]+):[^@]+@/, '$1:******@'));

                request(requestOptions(toURL, 'PUT', putBody), function (err, resp, body) {
                    if (err) {
                        throw err;
                    }
                    else if (resp.statusCode !== 201) {
                        throw new Error(`unable to push document\nstatus code: ${resp.statusCode}\n response: ${body}`);
                    }

                    pushDoc.doc._rev = JSON.parse(body).rev;
                    console.log(`Finished push: ${pushDoc.doc._id}, new rev: ${pushDoc.doc._rev}`);
                });
            });
        }
    };

    return pushDoc;
}

exports.prepareFile = prepareFile;
