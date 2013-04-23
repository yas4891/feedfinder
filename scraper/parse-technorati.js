var fs = require('fs');
var async = require('async');
var modurl = require('url');
var memwatch = require("memwatch");
var heapdump = require("heapdump");
var profiler = require("profiler");
var jsdom = require("jsdom");
var counter = 0;
var jquery = fs.readFileSync("../lib/jquery.js").toString();

function parseData(task) {
    var ofstPosition = (task.page - 1) * 25 + 1;
    try {
	jsdom.env(
	{
	    html: task.body,
	    src: [jquery],
	    done: function(errors, window) {
		var $ = window.$;

		$('td.site-details a.offsite').each(function() {
		    console.log(ofstPosition++, " -> ", $(this).attr('href'));
		});
	    }
	});
    }
    catch(exception) {
	console.log("error with :" + task.page);
	console.log("exception:" + exception);
    }
    if(1000 == counter++) {
	console.log("###################");
	console.log("storing heapdump");
	heapdump.writeSnapshot();
    }
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
	
        parseData(JSON.parse(data)); 
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


var dir = 'data/';

qRdFile.push({filename: dir + '999.json'}, function(errFile) {
    if(errFile) throw errFile; 
});
/*
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

/* */

function fileCallback(errFile) 
{
  if(errFile) 
  {
    console.log("Error while writing to file: " +errFile);
  }
}
