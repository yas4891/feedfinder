var fs = require('fs');
var cheerio = require('cheerio');
var async = require('async');
var modurl = require('url');
var memwatch = require("memwatch");

function parseData(data, screenname) {
    var line = data.split(/\r?\n/)[0];
    var url = line.split(" ")[1];
	    
    try {
	$ = cheerio.load(data);
	    
	var links = $('link[type*="application/rss"][rel*="alternate"]');
		
	links.each(function(index, elt) {
	    var relurl = $(this).attr('href');
	    var absurl = modurl.resolve(url, relurl);
	    fs.appendFile("feeds.txt", url + " >> " + absurl + "\n");
	});
    }
    catch(exception) {
	console.log("error with screenname:" + screenname);
	console.log("exception:" + exception);
    }
    data = null; 
    line = null;
    url	 = null;
}

var qRdFile = async.queue(function(task, callback) {
    var called = false;
	fs.readFile(task.filename,'utf8', function(error, data) {
	    if(error)
	    {
		console.log(error);
		return;
	    }
	    parseData(data, task.filename); 
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

memwatch.on('stats', function(info) {
    console.log(info);

});


function fileCallback(errFile) 
{
  if(errFile) 
  {
    console.log("Error while writing to file: " +errFile);
  }
}
