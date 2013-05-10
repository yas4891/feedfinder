var fs = require('fs');
var async = require('async');
var modurl = require('url');
var memwatch = require("memwatch");
var heapdump = require("heapdump");
var profiler = require("profiler");


var progress_file = '../tmp/technorati_rank_extracted.txt';
var result_dir = './';
var result_json = result_dir + "twfeeds.json";
var result_txt = result_dir + "twfeeds.txt";
var read_in_dir = 'tmp/twitter/twitter_feeds/';
var error_file = result_dir + 'errornous.txt';
var log_file = "../tmp/extract-feeds.error.log"

var start = 0 ; //+process.argv[2];
var end = start + 10 * 10000;
var arrObj = [];

var q = async.queue(function(item, callback) {
	fs.exists(item, function(exists){
	    if(!exists)
	    {
		console.log('does not exist', item);
		callback();
		return;
	    }
	    
	    fs.readFile(item, {encoding: 'utf-8'}, function(errFile, data)
	    {
		if(errFile)
		{
		    console.log("file read error:", errFile);
		    callback();
		    return;
		}
		var cont = JSON.parse(data);
		arrObj.push(cont);
		cont.links.forEach(function(link){
		    fs.appendFile(result_txt, link + '\n');
		});

		callback();
	    });// readFile
	});// exists
    }, 30);// queue

q.drain = function(error) {
	if(error)
	{
	    console.log(";;;;;", error);
	}
	else
	{
	    fs.writeFileSync(result_json, JSON.stringify(arrObj));
	    console.log("got a nice little callback right here");
	}
};

var directory = fs.readdirSync('tmp/twitter/twitter_feeds/');
for(var i = start; i < directory.length ; i++) {
    var path = read_in_dir + directory[i];
    
    q.push(path);
}

/* */
