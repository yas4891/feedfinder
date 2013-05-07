var fs = require('fs');
var async = require('async');
var modurl = require('url');
var parser = require('./lib/parser');
var jsdom = require('jsdom');

var counter = 0;

function parseData(data, screenname) {
    var line = data.split(/\r?\n/)[0];
    var url = line.split(" ")[1];
    
    console.log('parsing screenname:', screenname);    
    jsdom.env({
	html: data,
	scripts: ["jquery.js"],
	done: function(error, window) {

	    if(error) {
		console.log("error creating DOM:", error);
	    }
	    if(!window)
	    {
		console.log("no jsdom.window for ", screenname);
		return;
	    }
	    try
	    {
		var $ = window.$;
		$('link[type*="application/rss"][rel*="alternate"]').each(function() {
		    console.log(" -", $(this).attr('href'));
		    var relurl = $(this).attr('href');
		    var absurl = modurl.resolve(url, relurl);
		    fs.appendFile('twitter_feeds.txt', url + " ||SEPERATOR|| " + absurl + "\n");
		});

		// put here because the callback was not called in time and this produced
		// quite a few duplicates 
		fs.appendFileSync('tmp/parsed_twitter_files.txt', screenname + '\n'); 
		console.log("finished try", screenname);
	    }
	    catch(exception) 
	    {
		console.log('caught exception while parsing:', exception);
	    }
	    finally {window.close();}
	}
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

var processedFiles = fs.readFileSync('tmp/parsed_twitter_files.txt', {encoding: 'utf-8'}).split('\n');
var dir = 'out/';
fs.readdir(dir, function(errRdDir, files) {
    if(errRdDir) throw errRdDir;
    console.log('number of files:' + files.length);
    files.forEach(function(file) {
	
	if(processedFiles.indexOf(dir + file) > -1) {
	    console.log('passing over ', dir + file);
	    return;
	}
	qRdFile.push({filename: dir + file}, function(errFile) {
	    if(errFile) throw errFile;
	    
	    console.log("finished ", dir, file);
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
