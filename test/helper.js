module.exports = {
    describe: function(desc, callback) {
        console.log('[INFO] - ' + desc);
        callback();
        console.log('[INFO] - End of ' + desc);
    },
    it: function(desc, callback) {
        callback();
        console.log('[  OK] - ' + desc);
    }
};