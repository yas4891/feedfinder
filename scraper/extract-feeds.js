var fs = require('fs');
var async = require('async');
var modurl = require('url');
var memwatch = require("memwatch");
var heapdump = require("heapdump");
var profiler = require("profiler");
var parser = require("../lib/parser");
var jQuery = fs.readFileSync('../lib/jquery.js').toString();
var jsdom = require('jsdom');


var progress_file = '../tmp/technorati_rank_extracted.txt';
var result_dir = '../tmp/tn/extracted_feeds/';
var read_in_dir = '../tmp/tn/downloaded_blogs/';
var error_file = result_dir + 'errornous.txt';
var log_file = "../tmp/extract-feeds.error.log"
var testMode = false;
/*
 * log to both the console and stderr
 */
var logerr = function(d) {
    process.stderr.write(d + '\n');
    console.log(d);
}

var qExternalPage = async.queue(function(task, callback) {
    console.log("starting on:", task.position);
    try { 
	/* 
	var arrFeeds = [];
	if(!task.body) {
	    callback(null);
	    return;
	}
	var linktags = task.body.match(/<link([^>]*)>/);
	
	if(linktags)
	{
	    linktags.forEach(function(elt) {
		console.log('link tag', elt);
		if(-1 == elt.indexOf('alternate') ||
			(-1 == elt.indexOf('application/atom+xml') && 
			-1 == elt.indexOf('application/rss+xml')))
		    return;


		var regexp = /href=['"]([^'"]*)['"]/;
		var match = regexp.exec(elt);
		if(!match) return;
		console.log("found link tag:", match[1]);

	    });
	}

	fs.writeFileSync(result_dir + task.position + '.json', 
	    JSON.stringify({position: task.position, url: task.url, links: arrFeeds}));
	callback(null); 

	/* */
	/*	
	parser.parse(task.body, function(error, $) {
	    if(error)
	    {
		logerr("error parsing position " + task.position + ' -- ' + error);
		fs.appendFileSync(error_file, read_in_dir + task.position + '.json');
		callback(error);
		return;
	    }
	    if(!$)
	    {
		logerr("$ is undefined for position " + task.position);
		fs.appendFileSync(error_file, read_in_dir + task.position + '.json');
		callback(new Error("position:" + task.position));
		return;
	    }
	    
	    var arrFeeds = []; 
	    $('link[type="application/rss+xml"]').each(function() {
		var obj = $(this);
		
		// it seems as if people forget to put the href attribute into their <link> tags...
		if(!obj.attr('href')) return; 
		try 
		{
		var rsslink = modurl.resolve(task.url, obj.attr('href'));
		}
		catch(urlex) {
		    logerr("error resolving URL:", obj.attr('href'), " -- position:", task.position);
		    throw urlex;
		}
		arrFeeds.push(rsslink);
		//console.log("found RSS link:", rsslink);	
	    });
	    fs.writeFileSync(result_dir + task.position + '.json', 
	    JSON.stringify({position: task.position, url: task.url, links: arrFeeds}));
	    callback(null); 
	}, task.position);
	/* */
	
	jsdom.env({
	    html: task.body,
	    src: [jQuery],
	    done: function(errors, window) {
		if(!window)
		{
		    fs.appendFileSync(log_file, "invalid window for position:" + task.position + "\n");
		    callback(null);
		    return;
		}
		
		var $ = window.$;
		
		var arrFeeds = []; 
		$('link[type="application/atom+xml"]').each(function() {
		   var obj = $(this);
		
		    // it seems as if people forget to put the href attribute into their <link> tags...
		    if(!obj.attr('href')) return; 
		    try 
		    {
			var rsslink = modurl.resolve(task.url, obj.attr('href'));
		    }
		    catch(urlex) {
			logerr("error resolving URL:", obj.attr('href'), " -- position:", task.position);
			throw urlex;
		    }
		    arrFeeds.push(rsslink);
		
		    //console.log("found RSS link:", rsslink);	
		}); // link each
		$('link[type="application/rss+xml"]').each(function() {
		   var obj = $(this);
		
		    // it seems as if people forget to put the href attribute into their <link> tags...
		    if(!obj.attr('href')) return; 
		    try 
		    {
			var rsslink = modurl.resolve(task.url, obj.attr('href'));
		    }
		    catch(urlex) {
			logerr("error resolving URL:", obj.attr('href'), " -- position:", task.position);
			throw urlex;
		    }
		    arrFeeds.push(rsslink);
		
		    //console.log("found RSS link:", rsslink);	
		}); // link each
		fs.writeFileSync(result_dir + task.position + '.json', 
		    JSON.stringify({position: task.position, url: task.url, links: arrFeeds}));
		callback(null); 
		
		window.close();
	    } // function done
	}); // jsdom.env
	/* */
    }
    catch(exception)
    {
	var ts = exception + "";
	logerr("error making request for position:", task.position, " - url:", task.url);
	fs.appendFileSync('../tmp/extract-feeds.error.log', task.position + " - " + task.url + "\n");

	if(-1 != ts.indexOf("jsdom.env requires a 'html' argument") ||
	    -1 != ts.indexOf("appendChild"))
	{
	    fs.appendFileSync(error_file, read_in_dir + task.position + '.json');
	    callback(null);
	    return;
	} // no html found for this baby
	/* */
	throw exception;
    }

}, 40);

qExternalPage.drain = function() {
    console.log("all external page events have been processed");
};

var qRdFile = async.queue(function(task, callback) {
    fs.readFile(task.filename,'utf8', function(error, data) {
        if(error)
        {
	    console.log(error);
	    callback(error, task);
	    return;
	}
	// call async to enable concurrency between both queues
	setImmediate(function(){
	    qExternalPage.push(JSON.parse(data), 
		function(errFile) {
		    if(errFile){
			console.log(errFile);
		    }
		    else 
		    {
			if(!testMode)
			    fs.appendFileSync(progress_file, task.filename + '\n');
			console.log('finished ', task.filename);
		    }
		    callback(errFile, task);
		}); 
	}); // setImmediate
    }); // readFile
    /* */
}, 25);

qRdFile.drain = function() {
    console.log("all read file events have been processed -->", qExternalPage.length());
};

process.on('uncaughtException', function(exUncaught) 
{
    fs.appendFileSync("../tmp/extract-feeds.error.log", exUncaught + '\n');
    logerr("uncaught exception:", exUncaught+ " -- type:" + (typeof exUncaught));
    throw exUncaught;
});
/* */
var processedFiles = [];
if(fs.existsSync(progress_file))
{
    processedFiles = fs.readFileSync(progress_file, {encoding: 'utf-8'}).split('\n');
}


var start = +process.argv[2];
var end = start + 10000;
var cSkip = 0;
for(var i = start; i <= end ; i++) {
    var path = read_in_dir + i + '.json';
    if(!fs.existsSync(path)) continue;
    
    if(processedFiles.indexOf(path) > -1) {
	console.log("skipping over ", path);
	cSkip++;
	continue;
    }
    qRdFile.push({filename: path, position: i}, 
	function(error, task) {
	    
	    if(error) {
		logerr("### error: ", error, ' - position:', task.position);
		//if(error.message.indexOf("Wrong Status Code") != -1) return;
		//throw error;
	    }
	    else
	    {
	    }
	});
}
console.log('external page length:', qExternalPage.length());
console.log('read file length', qRdFile.length());
console.log('skipped a total of ', cSkip, 'files');
/* */
