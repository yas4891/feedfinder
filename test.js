var request = require('request');
var feedextract = require("./lib/feedextract");

feedextract.requestAndExtract({url:"http://www.it-engelhardt.de"}, function(error, result) {
    console.log(result.feeds);    
});

//request.setMaxListeners(0);
