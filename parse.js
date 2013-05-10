var fs = require('fs');
var async = require('async');
var modurl = require('url');
var parser = require('./lib/parser');
var jsdom = require('jsdom');
var jQuery = fs.readFileSync('lib/jquery.js').toString();
var counter = 0;

function parseData(data, filename, screenname) {
    var line = data.split(/\r?\n/)[0];
    var url = line.split(" ")[1];
    
    console.log('parsing screenname:', screenname);    
    try {
    jsdom.env({
	html: data,
	src: [jQuery],
	done: function(error, window) {

	    if(error) {
		console.log("error creating DOM:", error);
		return;
	    }
	    if(!window)
	    {
		console.log("no jsdom.window for ", screenname);
		return;
	    }
	    try
	    {
		var $ = window.$;
		var arrlinks = [];
		$('link[type*="application/rss"][rel*="alternate"]').each(function() {
		    console.log(" -", $(this).attr('href'));
		    var relurl = $(this).attr('href');
		    var absurl = modurl.resolve(url, relurl);
		    arrlinks.push(absurl);
		});

		fs.writeFileSync('tmp/twitter/twitter_feeds/' + screenname + '.json',
		    JSON.stringify({screenname: screenname, links: arrlinks}));
		// put here because the callback was not called in time and this produced
		// quite a few duplicates 
		fs.appendFileSync('tmp/parsed_twitter_files.txt', filename + '\n'); 
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
    catch(exception)
    {
	console.log("exception calling jsdom.env:",exception);
	console.log("affected screenname:", screenname);
	fs.appendFileSync('tmp/parsed_twitter_files.txt', filename + '\n'); 
	fs.appendFileSync('tmp/failed_parsed_twitter_files.txt', filename + '\n'); 
    }
}

var qRdFile = async.queue(function(task, callback) {
    fs.readFile(task.filename,'utf8', function(error, data) {
        if(error)
        {
	    console.log(error);
	    return;
	}
        parseData(data, task.filename, task.screenname); 
        //setImmediate(function() {callback(null);});
	callback(null);
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
	
	qRdFile.push({filename: dir + file, screenname: file.substr(0, file.indexOf('.'))}, function(errFile) {
	    if(errFile) throw errFile;
	    
	    //console.log("finished ", dir, file);
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
