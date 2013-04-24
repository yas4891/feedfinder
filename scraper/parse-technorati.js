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
    
    feedextract.requestAndExtract({url: task.url}, function(errFE, result) {
	
	if(errFE) {
	    console.log("qEP error retrieving URL:", task.url, " -> ", errFE);
	    try {callback(errFE);}catch(exception){ console.log('callback has already been called');}
	}
	else {
	    console.log("retrieving page:", task.url);
	    result.feeds.forEach(function(feed_data) {
		fs.appendFile("../techno_feeds.txt", 
		    task.position + " |||SEPERATOR||| " + task.url + " |||SEPERATOR||| " + feed_data.feed_url + "\n");		    });
	    callback(null);
	}
    });
    /* */
}, 100);

function parseData(task) {
    var ofstPosition = (task.page - 1) * 25 + 1;   
    parser.parse(task.body, function($) {
	$('td.site-details a.offsite').each(function() {
	    var nobj = {
		position: ofstPosition++,
		url: $(this).attr('href')
	    };
	    qExternalPage.push(nobj);
	    process.stdout.write(".");
	}); // each site link
    }); // parser.parse
}


var qRdFile = async.queue(function(task, callback) {
    fs.readFile(task.filename,'utf8', function(error, data) {
        if(error)
        {
	    console.log(error);
	    callback(error);
	    return;
	}
	// call async to enable concurrency between both queues
	setImmediate(function(){
        parseData(JSON.parse(data)); 
	callback(null, task);});
    });
    
    /* */
}, 5);

//qExternalPage.push({url: 'http://www.it-engelhardt.de', position: 1});
var processedFiles = fs.readFileSync('../tmp/technorati_parsed.txt', {encoding: 'utf-8'}).split('\n');
var dir = 'data/';
for(var i = 1; i <= 4000; i++) {
    var path = dir + i + '.json';
    if(!fs.existsSync(path)) continue;
    
    if(processedFiles.indexOf(path) > -1) {
	console.log("skipping over ", path);
	continue;
    }
    qRdFile.push({filename: path}, function(errFile, task) {
	if(errFile) throw errFile; 
	fs.appendFile('../tmp/technorati_parsed.txt', task.filename + '\n');
    });
}
/* */
