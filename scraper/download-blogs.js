var fs = require('fs');
var async = require('async');
var modurl = require('url');
var memwatch = require("memwatch");
var heapdump = require("heapdump");
var profiler = require("profiler");
var request = require('request');
var parser = require("../lib/parser");
var feedextract = require("../lib/feedextract");

var progress_file = '../tmp/technorati_rank_downloaded.txt';
var result_dir = '../tmp/tn/downloaded_blogs/';
var read_in_dir = '../tmp/tn/';
var qExternalPage = async.queue(function(task, callback) {
    console.log("starting on:", task.url);
    try { 
    request({uri: task.url, maxRedirects:10, timeout:120000,
    headers: {'user-agent': "Mozilla/5.0 (compatible; FeedFinder/0.1; +https://github.com/yas4891/feedfinder)"}}, function (error, response, body)
    {
	if(error)
	{
	    //console.log("error retrieving \"" + task.url + "\":" + error);
	    callback(error);
	    return; // don't throw an error, because that is to be expected
	}
	else if(200 == response.statusCode)
	{
	    fs.writeFile(result_dir + task.position + '.json', 
		JSON.stringify({url:task.url, position: task.position, body: body}), 
		function(errFile) {
		    if(errFile)
		    {
			//console.log("error writing file ", errFile);
			callback(errFile);
		    }
		    else
			callback(null);
		});
	} // HTTP 200
	else
	{
	    /*
	    if(400 == response.statusCode){
		console.log(body);
		console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$');
		process.exit(123);
	    }
	    /* */
	    callback(new Error("Wrong Status Code:" + response.statusCode + " - " + task.url + " - pos:" + task.position));
	}
    }).setMaxListeners(25); // request 
    }
    catch(exception)
    {
	var ts = exception + "";
	if(-1 != ts.indexOf('received invalid user or password'))
	{
	    callback(null);
	    return;
	} // invalid username

	console.log("error making request for position:", task.position, " - url:", task.url);
	fs.appendFileSync('../tmp/download_tn_blogs.error.log', task.position + " - " + task.url + "\n");
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
			fs.appendFileSync(progress_file, task.filename + '\n');
			console.log('finished ', task.filename);
		    }
		    callback(errFile, task);
		}); 
	}); // setImmediate
    }); // readFile
    /* */
}, 5);

qRdFile.drain = function() {
    console.log("all read file events have been processed -->", qExternalPage.length());
};

process.on('uncaughtException', function(exUncaught) 
{
    fs.appendFileSync("../tmp/download_tn_blogs.error.log", exUncaught + '\n');
    console.log("uncaught exception:", exUncaught+ " -- type:" + (typeof exUncaught));
    throw exUncaught;
});
/* */
var processedFiles = [];
if(fs.existsSync(progress_file))
{
    processedFiles = fs.readFileSync(progress_file, {encoding: 'utf-8'}).split('\n');
}



var cSkip = 0;
for(var i = 0; i <= 100000; i++) {
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
		console.log("### error: ", error, ' - position:', task.position);
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
