"use strict";

/**
 * Copyright (c) 2016 Dynamicloud
 * <p/>
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * <p/>
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * <p/>
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * <p/>
 *
 * This module provides functions to execute reports and fetch information about created logs.
 *
 * @author Eleazar Gomez
 */

var dc = require('dynamicloud');
var fs = require("fs");

var Reporter = {
    /**
     * Simple data formatter
     * @param date to format
     * @returns {string} formatted date as String
     */
    formatDate: function (date) {
        var month = (date.getMonth() + 1);
        return date.getFullYear() + '-' + (month < 10 ? ('0' + month) : month) + '-' +
            (date.getDate() < 10 ? ('0' + date.getDate()) : date.getDate()) + ' ' +
            (date.getHours() < 10 ? ('0' + date.getHours()) : date.getHours()) + ':' +
            (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" +
            (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
    },
    warningIt: function (warn) {
        if (this.warning) {
            console.log('[LONLINE WARNING @ ' + new Date() + ' ] - ' + warn);
        }
    },
    /**
     * This function will iterate through the records till the reportLimit attribute value.
     * @param query with the selection
     * @param callback function
     * @param howMany processed records so far.
     */
    nextResults: function (query, callback, howMany) {
        var instance = this;
        try {
            query.next(function (error, results) {
                if (error == null) {
                    if (results.fastReturnedSize == 0) {
                        return;
                    }

                    callback(results.records);

                    var soFar = howMany + results.fastReturnedSize;

                    if (soFar < instance.reportLimit) {
                        instance.nextResults(query, function (records) {
                            callback(records);
                        }, soFar);
                    }
                } else {
                    instance.warningIt(results);
                }
            });
        } catch (e) {
            console.log(e);
        }
    },
    /**
     * This method fetches the logs according to level param and will be those created between from and to params.
     * The results are decrease ordered by creation.
     * <p/>
     * <strong>How to use:</strong>
     * <p/>
     * <pre>
     *
     * var lonline = require('lonline');
     *
     * var reporter = lonline.getReporter({
     *      OPTIONAL: This attribute indicates the path to load the settings, if this attribute is present all the
     *      below attributes will be skipped.
     *      This file must be a compatible json file.
     *      fileName: '../fileName'
     * });
     *
     * reporter.fetch(reporter.ERROR, new Date(), new Date(), function(logs) {
     *      _.each(logs, function(log) {
     *          console.log(log['lonlinetext']);
     *      });
     * });
     *
     * </pre>
     * <p/>
     *
     * @param level    level to be filtered
     * @param from     from date if null will fetch all records equal to level in Dynamicloud
     * @param to       to date
     * @param callback callback to manage logs
     */
    fetch: function (level, from, to, callback) {
        var provider = dc.buildProvider(this.credentials);
        var query = provider.createQuery(this.modelIdentifier);

        /**
         * If from param is a Date object then will be formatted using the following format: yyyy-mm-dd hh:mm:ss
         */
        if (from instanceof Date) {
            from = this.formatDate(from);
        }

        /**
         * If to param is a Date object then will be formatted using the following format: yyyy-mm-dd hh:mm:ss
         */
        if (to instanceof Date) {
            to = this.formatDate(to);
        }

        query.add(dc.conditions.and(dc.conditions.equals('lonlinelevel', level),
            dc.conditions.between("added_at", from, to))).orderBy("id").desc();

        query.count = 20;

        var instance = this;
        query.getResults(function (error, results) {
            callback(results.records);

            if (results.fastReturnedSize > 0) {
                instance.nextResults(query, function (records) {
                    callback(records)
                }, results.fastReturnedSize);
            }
        });
    },
    /**
     * This method counts the logs between a specific time according to 'from and to' params.
     * <p/>
     * <strong>How to use:</strong>
     * <p/>
     * <pre>
     *
     * var lonline = require('lonline');
     *
     * OPTIONAL: This attribute indicates the path to load the settings, if this attribute is present all the
     *      below attributes will be skipped.
     *      fileName: '../fileName'
     *
     * var reporter = lonline.getReporter({
     *      OPTIONAL: This attribute indicates the path to load the settings, if this attribute is present all the
     *      below attributes will be skipped.
     *      This file must be a compatible json file.
     *      fileName: '../setting.json'.
     *      csk: 'csk#...',
     *      aci: 'aci#...',
     *      modelIdentifier: 000,
     *      reportLimit: 100,
     *      warning: true
     * });
     *
     * reporter.count(reporter.ERROR, new Date(), new Date(), function(count) {
     *      console.log(count);
     * });
     *
     * </pre>
     * <p/>
     *
     * @param level    level to be filtered
     * @param from     from date if null will fetch all records equal to level in Dynamicloud
     * @param to       to date
     * @param callback callback to pass the count of logs
     */
    count: function (level, from, to, callback) {
        var provider = dc.buildProvider(this.credentials);
        var query = provider.createQuery(this.modelIdentifier);

        /**
         * If from param is a Date object then will be formatted using the following format: yyyy-mm-dd hh:mm:ss
         */
        if (from instanceof Date) {
            from = this.formatDate(from);
        }

        /**
         * If to param is a Date object then will be formatted using the following format: yyyy-mm-dd hh:mm:ss
         */
        if (to instanceof Date) {
            to = this.formatDate(to);
        }

        query.add(dc.conditions.and(dc.conditions.equals('lonlinelevel', level),
            dc.conditions.between("added_at", from, to)));

        query.count = 20;

        query.getResultsByProjection(['count(*) count'], function (error, results) {
            if (results['records']) {
                callback(results['records'][0]['count']);
            } else {
                callback(0);
            }
        });
    },
    FATAL: 'fatal',
    ERROR: 'error',
    WARN: 'warn',
    DEBUG: 'debug',
    INFO: 'info',
    TRACE: 'trace'
};

module.exports = {
    /**
     * Returns a new Reporter instance to execute reports.
     * @param ops for this reporter (credentials, modelIdentifier, warning and reportLimit)
     * @returns {Reporter} a new instance of Reporter
     */
    getReporterInstance: function (ops) {
        if (ops['fileName'] != null) {
            /**
             * Read settings from fileName
             */
            var contents = fs.readFileSync(ops['fileName']);
            var settings = JSON.parse(contents);

            ops['credentials'] = {
                csk: settings['csk'],
                aci: settings['aci']
            };

            ops['modelIdentifier'] = settings['modelIdentifier'];
            ops['warning'] = settings['warning'];
            ops['reportLimit'] = settings['reportLimit'];
        }

        return Object.create(Reporter, {
            'credentials': {
                value: ops['credentials'],
                writable: false //Avoid changes after this initialization.
            },
            'modelIdentifier': {
                value: ops['modelIdentifier'],
                writable: false //Avoid changes after this initialization.
            },
            'reportLimit': {
                value: ops['reportLimit'],
                writable: false //Avoid changes after this initialization.
            },
            'warning': {
                value: ops['warning'],
                writable: false //Avoid changes after this initialization.
            }
        });
    }
};