var fs = require('fs');
//var cheerio = require('cheerio');
var async = require('async');
var modurl = require('url');
var jsdom = require("jsdom");
var counter = 0;

var qRdFile = async.queue(function(task, callback) {
    
	fs.readFile(task.filename,'utf8', function(error, data) {
	    //console.log(counter++);
	    if(error) throw error;
	    var line = data.split(/\r?\n/)[0];
	    var url = line.split(" ")[1];
	    
	    var mat = data.match(/application\/rss/);
	    /*
	    if(mat)
		console.log("found match:" + mat); 
	    /* 
	    jsdom.env(data, 
		['http://code.jquery.com/jquery/js'],
		function(errJS, window) {
		    if(errJS) throw errJS;
		    $ = window.$;
		    console.log("there have been", window.$("a").length, "nodejs releases!");
		});
	    /*
	    $ = cheerio.load(data);

	    var links = $('link');
	    links.each(function(index, elt) {
		zelda = $(this);
		counter++;
		console.dir(counter);
		//console.log(elt.attr('href'));
		//var relurl = $(this).attr('href');
		//var absurl = modurl.resolve(url, relurl);
		//fs.appendFile("feeds.txt", url + " >> " + absurl + "\n");
		//console.log('Found:' +relurl + '<< result: ' + absurl + ' on ' + url);
		//console.log(elt.attribs.href);
	    });

	    /* */
	   //throw data; 
	});
}, 100);


var dir = 'out/';
fs.readdir(dir, function(errRdDir, files) {
    if(errRdDir) throw errRdDir;
    console.log('number of files:' + files.length);
    files.forEach(function(file) {
	
	
	console.log(counter++);
	qRdFile.push({filename: dir + file}, function(errFile) {
	    if(errFile) throw errFile;
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


