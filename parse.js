var fs = require('fs');
var async = require('async');
var modurl = require('url');
var memwatch = require("memwatch");
var heapdump = require("heapdump");
var profiler = require("profiler");
var jsdom = require("jsdom");
var counter = 0;
var jquery = fs.readFileSync("./lib/jquery.js").toString();

function parseData(data, screenname) {
    var line = data.split(/\r?\n/)[0];
    var url = line.split(" ")[1];
    try {
	jsdom.env(
	{
	    html: data,
	    src: [jquery],
	    done: function(errors, window) {
		var $ = window.$;

		$('link[type*="application/rss"][rel*="alternate"]').each(function() {
		   // console.log(" -", $(this).attr('href'));
		});
	    }
	});
    }
    catch(exception) {
	console.log("error with screenname:" + screenname);
	console.log("exception:" + exception);
    }
    if(1000 == counter++) {
	console.log("###################");
	console.log("storing heapdump");
	heapdump.writeSnapshot();
    }
    data = null; 
    line = null;
    url	 = null;
}

var qRdFile = async.queue(function(task, callback) {
 //   var hd = new memwatch.HeapDiff();	    
    fs.readFile(task.filename,'utf8', function(error, data) {
//	profiler.resume();
        if(error)
        {
	    console.log(error);
	    return;
	}
        parseData(data, task.filename); 
//	profiler.pause();
        setImmediate(function() {callback(null);});
    });
    
    /* 
    var diff = hd.end();

    console.log('@@@@@@@@@@@@@@@@@@@@');
    console.log(diff.before);
    console.log(diff.after);
    console.log("### change");
    console.log(diff.change);
    console.log('@@@@@@@@@@@@@@@@@@@@');
    /* */
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
