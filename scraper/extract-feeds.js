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
        qExternalPage.push(JSON.parse(data), 
	    function(errFile) {
		if(errFile) throw errFile; 
		fs.appendFile('../tmp/technorati_rank_parsed.txt', task.filename + '\n');
		console.log('finished ', task.filename);
	    }); 
	callback(null, task);});
    });
    
    /* */
}, 5);

var processedFiles = fs.readFileSync('../tmp/technorati_rank_parsed.txt', {encoding: 'utf-8'}).split('\n');
var dir = '../tmp/tn/';
for(var i = 1; i <= 100000; i++) {
    var path = dir + i + '.json';
    if(!fs.existsSync(path)) continue;
    
    if(processedFiles.indexOf(path) > -1) {
	console.log("skipping over ", path);
	continue;
    }
    qRdFile.push({filename: path}, function(error, task) {} );
}
/* */
