"use strict";

var lf = require('./lonlineFactory');
var lr = require('./lonlineReport');

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
 * This is the entry point to get Lonline instances
 *
 * @author Eleazar Gomez
 */

module.exports = {
    /**
     * This function builds a new Lonline logger instance.
     *
     * How to use:
     *
     * Options Documentation:
     *
     * var ops = {
     *      OPTIONAL: This is the current logger object you're using in your program.
     *      Lonline will call the same function in legacy object, for example:
     *      lonlineLogger.error("It couldn't process the data");
     *      // The line above will execute the method error from legacy object passing the log
     *      // and the error as follow:  legacyObject.error(log, error);
     *      legacy: myOwnLogger
     *      OPTIONAL: This attribute indicates the path to load the settings, if this attribute is present all the
     *      below attributes will be skipped.
     *      This file must be a compatible json file.
     *      fileName: '../settings.json',
     *      This attribute indicates the level of lonline
     *      The following table is an explanation of levels in Lonline (Descriptions from the great Java Log4j library):
     *      ------------------------------------------------------------------------------------------------------------
     *      | Level      | Activated levels           | Description                                                    |
     *      ------------------------------------------------------------------------------------------------------------
     *      | fatal      | Fatal                      | Designates very severe error events that will presumably lead  |
     *      |            |                            | the application to abort.                                      |
     *      ------------------------------------------------------------------------------------------------------------
     *      | error      | Fatal, Error               | Designates error events that might still allow the application |
     *      |            |                            | to continue running.                                           |
     *      ------------------------------------------------------------------------------------------------------------
     *      | warn       | Fatal, Error, Warn         | Designates potentially harmful situations.                     |
     *      ------------------------------------------------------------------------------------------------------------
     *      | info       | Fatal, Error, Warn, Info   | Designates informational messages that highlight the progress  |
     *      |            |                            | of the application at coarse-grained level.                    |
     *      ------------------------------------------------------------------------------------------------------------
     *      | debug      | Fatal, Error, Info, Warn   | Designates fine-grained informational events that are most     |
     *      |            | Debug                      | useful to debug an application.                                |
     *      ------------------------------------------------------------------------------------------------------------
     *      | trace      | All levels                 | Traces the code execution between methods, lines, etc.         |
     *      ------------------------------------------------------------------------------------------------------------
     *      | off        | None                       | The highest possible rank and is intended to turn off logging. |
     *      ------------------------------------------------------------------------------------------------------------
     *      level: 'error',
     *      Credentials for REST APIs
     *      Go to https://www.dynamicloud.org/manage and get the API keys available in your profile
     *      If you don't have an account in Dynamicloud, visit https://www.dynamicloud.org/signupform
     *      You can easily use a social network to sign up
     *      csk: 'csk#...',
     *      aci: 'aci#...',
     *      This is the model identifier for test and development environment
     *      The model contains the structure to store logs into the cloud
     *      For more information about models in Dynamicloud visit https://www.dynamicloud.org/documents/mfdoc
     *      modelIdentifier: 000,
     *      OPTIONAL: Shows every warning like rejected request from Dynamicloud and other warnings in lonline
     *      warning: true,
     *      OPTIONAL: report_limit indicates how many records lonline will execute to fetch data from Dynamicloud.
     *      If you need to increase this value, please think about the available requests per month in your account.
     *      Dynamicloud uses a limit of records per request, at this time the max records per request is 20.  So,
     *      report_limit=100 are 5 request.
     *      reportLimit: 100,
     *      Send the backtrace (the ordered method calls) of the log.  If you want to avoid this sets to false
     *      backtrace: true,
     * };
     *
     * var lonline = require('lonline');
     *
     * var logger = lonline.getLonlineLogger({
     *      fileName: '../config/settings.json'
     * });
     *
     * This call won't send data to Dynamicloud because the current level is error.
     * The legacy logger probably prints something because the level in Lonline is independent.
     * logger.debug('This is a debug call');
     *
     * This call will send data to Dynamicloud because the current level is error.
     * logger.fatal('This is a fatal call');
     *
     * This call will send data to Dynamicloud because the current level is error.
     * logger.error('This is a error call');
     *
     * @param settings to build a new Lonline instance
     * @returns Lonline logger
     */
    getLogger: function getLonlineLogger(settings) {
        return lf.buildLonline(settings)
    },
    /**
     * This function returns a new instance of Lonline reporter
     *
     * How to use:
     *
     * var lonline = require('lonline');
     *
     * var reporter = lonline.getReporter({
     *      csk: 'csk#...',
     *      aci: 'aci#...',
     *      modelIdentifier: 000,
     *      reportLimit: 100
     * });
     *
     * var yesterday = new Yesterday();
     * reporter.fetch(reporter.ERROR, yesterday, new Date(), function (records) {
     *      console.log(records);
     * });
     *
     * @param settings for this reporter (Required attributes: credentials, modelIdentifier, warning and reportLimit)
     *
     * Required attributes:
     *   {
     *      csk: 'csk#...',
     *      aci: 'aci#...',
     *      modelIdentifier: 000,
     *      reportLimit: 100
     *   }
     * @returns {Reporter} a new instance of reporter
     */
    getReporter: function(settings) {
        return lr.getReporterInstance(settings);
    }
};