var fs = require('fs');
var async = require('async');
var modurl = require('url');
var parser = require('./lib/parser');
var counter = 0;

function parseData(data, screenname) {
    var line = data.split(/\r?\n/)[0];
    var url = line.split(" ")[1];

    parser.parse(data, function($) {
	$('link[type*="application/rss"][rel*="alternate"]').each(function() {
	    //console.log(" -", $(this).attr('href'));
	    var relurl = $(this).attr('href');
	    var absurl = modurl.resolve(url, relurl);

	    fs.appendFile('twitter_feeds.txt', url + " ||SEPERATOR|| " + absurl + "\n");
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
        parseData(data, task.filename); 
        setImmediate(function() {callback(null);});
    });
}, 100);


var dir = 'out/';
fs.readdir(dir, function(errRdDir, files) {
    if(errRdDir) throw errRdDir;
    console.log('number of files:' + files.length);
    files.forEach(function(file) {
	qRdFile.push({filename: dir + file}, function(errFile) {
	    if(errFile) throw errFile;
	    //console.log("called back");
	}); // push queue
    }); // files.forEach
}); // read directory

function fileCallback(errFile) 
{
  if(errFile) 
  {
    console.log("Error while writing to file: " +errFile);
  }
}
