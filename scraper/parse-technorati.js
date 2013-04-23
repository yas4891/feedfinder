var fs = require('fs');
var async = require('async');
var modurl = require('url');
var memwatch = require("memwatch");
var heapdump = require("heapdump");
var profiler = require("profiler");

var parser = require("../lib/parser");
var feedextract = require("../lib/feedextract");


var qExternalPage = async.queue(function(task, callback) {
    console.log("starting on:", task.url);
    /*
    feedextract.requestAndExtract({url: task.url}, function(errFE, result) {
	
	if(errFE) {
	    console.log("qEP error retrieving URL:", task.url, " -> ", errFE);
	    callback(errFE);
	}
	else {
	    console.log("retrieving page:", task.url);
	    result.feeds.each(function(feed_link) {
		fs.appendFile("../techno_feeds.txt", 
		    task.position + " |||SEPERATOR||| " + task.url + " |||SEPERATOR||| " + feed_link);	
	    });
	    callback(null);
	}
    });
    /* */
}, 100);

function parseData(task) {
    var ofstPosition = (task.page - 1) * 25 + 1;   
    parser.parse(task.body, function($) {
	$('td.site-details a.offsite').each(function() {
	    //console.log(ofstPosition++, ' -> ', $(this).attr('href'));
	    console.log("pushing for number:", $(this).attr('href'));
	    qExternalPage.push({
		position: ofstPosition++,
		url: $(this).attr('href')
	    }, function(error) { if(error) console.log("qEP callback:" + error);});
	});
    });
}


var qRdFile = async.queue(function(task, callback) {
    fs.readFile(task.filename,'utf8', function(error, data) {
        if(error)
        {
	    console.log(error);
	    return;
	}
	
        parseData(JSON.parse(data)); 
	callback();
    });
    
    /* */
}, 50);


var dir = 'data/';
for(var i = 1; i <= 4000; i++) {
    var path = dir + i + '.json';
    if(!fs.existsSync(path)) continue;
    qRdFile.push({filename: path}, function(errFile) {
	if(errFile) throw errFile; 
    });
}
/* */

function fileCallback(errFile) 
{
  if(errFile) 
  {
    console.log("Error while writing to file: " +errFile);
  }
}
