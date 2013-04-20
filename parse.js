var fs = require('fs');
var cheerio = require('cheerio');
var async = require('async');
var modurl = require('url');
//var jsdom = require("jsdom");
//var counter = 0;

var qRdFile = async.queue(function(task, callback) {
    var called = false;
	fs.readFile(task.filename,'utf8', function(error, data) {
	    if(error)
	    {
		console.log(error);
		return;
	    }
	    
	    var line = data.split(/\r?\n/)[0];
	    var url = line.split(" ")[1];
	    
	    setImmediate( function() { 
	    $ = cheerio.load(data);
	    
	    
	    var links = $('link[type*="application/rss"][rel*="alternate"]');
	    links.each(function(index, elt) {
		var relurl = $(this).attr('href');
		var absurl = modurl.resolve(url, relurl);
		fs.appendFile("feeds.txt", url + " >> " + absurl + "\n");
		console.log('Found:' +relurl + '<< result: ' + absurl + ' on ' + url);
	    });
	    });
	    /* */
	});
	setImmediate(function() {callback(null);});
}, 50);


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
