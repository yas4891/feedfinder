var fs = require('fs');
var request = require('request');
var async = require('async');

var qParseAgg = null; 

function setupParse() {
    qParseAgg = async.queue(function(task, callback) {
	fs.writeFile("data/" + task.page + ".json", JSON.stringify(task), fileCallback);
	callback(task.page);
    }, 50);
}

var qAggregator = async.queue(function(task, callback) {
    var url = task.url;
    request({uri: url, maxRedirects:10, timeout:50000, 
	headers:{"user-agent": 'FeedFinder http://github.com/yas4891/feedfinder' }
	}, function (error, response, body)    
    {
        if(error)
	{
	    console.log("error retrieving \"" + url + "\":" + error);
	}
	else if(200 == response.statusCode)
	{
	    console.log("retrieved page:" + task.page);
	    var tskFile = {url: url, body: body, page: task.page};
	    qParseAgg.push(tskFile, function (sname) {});
	} // HTTP 200
  
	callback(error, url);
    }).setMaxListeners(25); // request 
	/* */
// maximum 3 concurrent requests
}, 3);

setupParse();



for(var i = 1;i <= 5000; i++)
{
    qAggregator.push({page: i, url:"http://technorati.com/blogs/top100/page-" + i + "/"}, function() {});
}
console.log("pushed all 4000 pages into queue");


function fileCallback(errFile) 
{
    if(errFile)
	console.log("error with file:" + errFile);
}

