var assert = require('assert');
var helper = require('./helper.js');
var lonline = require('../lonline/lonline.js');

var logger = lonline.getLogger({
    fileName: __dirname + '/settings.json',
    /**
     * This is an emulation of a legacy logger.
     */
    legacy: {
        //Emulate a legacy logger
        trace: function (log, error) {
            console.log('[TRACE] - ' + log);
        },
        error: function (log, error) {
            console.log('[ERROR] - ' + log);
        },
        debug: function (log, error) {
            console.log('[DEBUG] - ' + log);
        }
    }
});

/**
 * Test Lonline levels
 */
helper.describe('Lonline logger', function () {
    helper.it('Should log fatal', function () {
        logger.fatal('Fatal error from NodeJs');
    });

    helper.it('Should log error', function () {
        logger.error('Error test from NodeJs');
    });

    helper.it('Should log warn', function () {
        logger.warn('Warning test from NodeJs');
    });

    helper.it('Should log debug', function () {
        logger.debug('Debug test from NodeJs');
    });

    helper.it('Should log info', function () {
        logger.info('Info test from NodeJs');
    });

    helper.it('Should log trace', function () {
        logger.trace('Trace test from NodeJs');
    });

    helper.it('Should log fatal with additional information and error', function () {
        logger.fatal('Fatal error from NodeJs',
            new Error('Error'), {'lonlinemodule': 'Financial module'});
    });
});

/**
 * Test Lonline reporter
 * @type {Reporter}
 */
var reporter = lonline.getReporter({fileName: __dirname + '/settings.json'});

helper.describe('Lonline reporter', function () {
    var today = new Date();

    var fromDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate(), 0, 0, 1, 0);
    var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 23, 59, 59, 0);

    helper.it('Should fetch logs', function () {
        reporter.fetch(reporter.FATAL, fromDate, tomorrow, function (records) {
            assert(records != null);
        });
    });

    helper.it('Should fetch count of logs', function () {
        reporter.count(reporter.FATAL, fromDate, tomorrow, function (count) {
            assert(count > 0);
        });
    });
});