var fs = require('fs');
var request = require('request');
var async = require('async');
var csv = require('csv');

var qFile = async.queue(function(task, callback) {

    var content = "<!-- " + task.url + " -->\n" + task.body;
    fs.writeFile("out/" + task.screenname + ".html", content, function(errFile) {
	    if(errFile) 
	    {
		console.log("Error while writing to file: " +errFile);
	    }
	    else
	    {
		console.log("successful:" + task.screenname);
	    }
	}); 
    callback(task.screenname);
  }, 10);
	/* */

var qCrawl = async.queue(function(task, callback) {
    var url = task.url;
    var screenname = task.screenname;
    request({uri: url, maxRedirects:10, timeout:25000}, function (error, response, body)    
    {
        if(error)
	{
	    console.log("error retrieving \"" + url + "\":" + error);
	}
	else if(200 == response.statusCode)
	{
	    var tskFile = {url: url, body: "<!-- " + url + " -->\n" + body, screenname: screenname};
	    qFile.push(tskFile, function (sname) {});
	} // HTTP 200
  
	callback(error, url);
    }).setMaxListeners(25); // request 
	/* */

}, 100);

var fSeed = "twitter.csv";
if(process.argv[2]) fSeed = process.argv[2];


csv()
  .from.stream(fs.createReadStream(__dirname + '/' + fSeed))
  .on('record', function(row,index){
    
    var url = row[9];
    if(url == "URL") return; // skip first line
    if(url)
    {
	//console.log(url);
	
	var task = {url:url,screenname:row[0]};
	//task = [url];
	qCrawl.push(task, function(error, url) {
		if(error)
			console.log("error crawling URL " + url + ":"+ error);
		else 
		{
			//console.log("CB:" + url);
		}
	});
	/* */
      //makeRequest(row[0], url);
    }
  })
  .on('end', function(count){
    console.log('Number of lines: '+count);
  })
  .on('error', function(error){
    console.log("csv error:" + error.message);
    console.log("stack:\n" + error.stack);
  });


function fileCallback(errFile) 
{
}

