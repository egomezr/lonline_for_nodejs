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
 * This is a factory to build Lonline instances
 *
 * @author Eleazar Gomez
 */

/**
 * These are the posible levels
 * @type {number}
 */
var TRACE = 1;
var INFO = 2;
var DEBUG = 3;
var WARN = 4;
var ERROR = 5;
var FATAL = 6;
var OFF = 7;

var dc = require('dynamicloud');
var fs = require("fs");

var Lonline = {
    warningIt: function (warn) {
        if (this.options['warning']) {
            console.log('[LONLINE WARNING @ ' + new Date() + ' ] - ' + warn);
        }
    },
    getLevelAsNumber: function (level) {
        switch (level) {
            case 'fatal':
                return FATAL;
            case 'error':
                return ERROR;
            case 'warn':
                return WARN;
            case 'debug':
                return DEBUG;
            case 'info':
                return INFO;
            case 'trace':
                return TRACE;
            default:
                return OFF;
        }
    },
    getLevelAsString: function (level) {
        switch (level) {
            case FATAL:
                return 'fatal';
            case ERROR:
                return 'error';
            case WARN:
                return 'warn';
            case DEBUG:
                return 'debug';
            case INFO:
                return 'info';
            case TRACE:
                return 'trace';
            default:
                return 'off';
        }
    },
    executeLog: function (log, error, level, additionalInformation) {
        if (log === null) {
            this.warningIt('The log is null, probably this is an unnecessary stuff.');
        }

        /**
         * Verifies if the level is allowed for execution.
         */
        if (level >= this.getLevelAsNumber(this.options['level'])) {
            var data = additionalInformation || {};

            data['lonlinetext'] = log;
            data['lonlinelevel'] = this.getLevelAsString(level);

            if (this.options['backtrace'] && error != null) {
                data['lonlinetrace'] = error.stack || error.stacktrace || "";
            }

            var provider = dc.buildProvider({
                csk: this.options['csk'],
                aci: this.options['aci']
            });

            var caller = this;
            provider.saveRecord(this.options['modelIdentifier'], data, function (error) {
                if (error !== null) {
                    caller.warningIt(error);
                }
            });
        }
    },
    trace: function () {
        var log = arguments[0];
        var error = arguments[1];
        var additionalInformation = arguments[2];

        try {
            this.options['legacy'].trace(log, error);
        } catch (ignore) {
        }

        this.executeLog(log, error, TRACE, additionalInformation);
    },
    info: function () {
        var log = arguments[0];
        var error = arguments[1];
        var additionalInformation = arguments[2];

        try {
            this.options['legacy'].info(log, error);
        } catch (ignore) {
        }

        this.executeLog(log, error, INFO, additionalInformation);
    },
    debug: function () {
        var log = arguments[0];
        var error = arguments[1];
        var additionalInformation = arguments[2];

        try {
            this.options['legacy'].debug(log, error);
        } catch (ignore) {
        }

        this.executeLog(log, error, DEBUG, additionalInformation);
    },
    warn: function () {
        var log = arguments[0];
        var error = arguments[1];
        var additionalInformation = arguments[2];

        try {
            this.options['legacy'].warn(log, error);
        } catch (ignore) {
        }

        this.executeLog(log, error, WARN, additionalInformation);
    },
    error: function () {
        var log = arguments[0];
        var error = arguments[1];
        var additionalInformation = arguments[2];

        try {
            this.options['legacy'].error(log, error);
        } catch (ignore) {
        }

        this.executeLog(log, error, ERROR, additionalInformation);
    },
    fatal: function () {
        var log = arguments[0];
        var error = arguments[1];
        var additionalInformation = arguments[2];

        try {
            this.options['legacy'].fatal(log, error);
        } catch (ignore) {
        }

        this.executeLog(log, error, FATAL, additionalInformation);
    }
};

module.exports = {
    /**
     * This function returns a new instance of Lonline logger using the passed options.
     * @param ops to build the new instance of Lonline.
     */
    buildLonline: function (ops) {
        if (ops === null) {
            throw new Error('Param options is null, please pass a valid options to build a Lonline logger.')
        }

        if (ops['fileName'] != null) {
            /**
             * Read settings from fileName
             */
            var contents = fs.readFileSync(ops['fileName']);
            var settings = JSON.parse(contents);

            ops['csk'] = settings['csk'];
            ops['aci'] = settings['aci'];
            ops['level'] = settings['level'];
            ops['modelIdentifier'] = settings['modelIdentifier'];
            ops['backtrace'] = settings['backtrace'];
            ops['warning'] = settings['warning'];
            ops['reportLimit'] = settings['reportLimit'];
        }

        if (ops['csk'] === null) {
            throw new Error('csk attribute is null, please pass a valid Client Secret Key.')
        }

        if (ops['aci'] === null) {
            throw new Error('aci attribute is null, please pass a valid Application Client Id.')
        }

        if (ops['level'] === null) {
            throw new Error('level attribute is null, please pass a level (either fatal, error, warn, debug, info, trace or off).')
        }

        if (ops['modelIdentifier'] === null) {
            throw new Error('modelIdentifier attribute is null, please pass a model identifier from your account in Dynamicloud.')
        }

        /**
         * Initialize with default values
         * @type {*|boolean}
         */
        ops['backtrace'] = ops['backtrace'] || false;
        ops['warning'] = ops['warning'] || false;
        ops['reportLimit'] = ops['reportLimit'] || 100;

        return Object.create(Lonline, {
            'options': {
                value: ops,
                writable: false //Avoid changes after this initialization.
            }
        });
    }
};