var request = require('request');
var jsdom = require("jsdom");
var modurl = require("url");

function requestAndExtract(task, fnCallback) {
    var tout = task.timeout || 100000;
    request({uri: task.url, maxRedirects:10, timeout:tout, 
	headers: { "user-agent": "feedfinder v0.1 http://github.com/yas4891/feedfinder"}}, 
    function (error, response, body)    
    {
	if(error)
	{
	    console.log("error retrieving \"" + task.url + "\":" + error);
	    fnCallback(error, null);
	}
	else if(200 == response.statusCode)
	{
	    var alternates = new Array();
	    jsdom.env({
		html: body,
		scripts: ["jquery.js"],
		done: function (errors, window) {
		    if(errors) throw errors;
		    if(!window.$) fnCallback("could not parse HTML from " + task.url, null);
		    var $ = window.$;

		    
		    $('link[type*="application/rss"][rel*="alternate"]').each(function() {
			//console.log("I GET CALLED ALOT");
			alternates.push({
			    url: task.url, 
			    feed_url: modurl.resolve(task.url, $(this).attr('href')).toString()
			});
		    }); // links each
		    window.close();
		    var tsk = {url: task.url, feeds: alternates};
		    fnCallback(null, tsk);
		} // jsdom.done
	    }); //jsdom.env
	} // HTTP 200
    }).setMaxListeners(25); // request 
	/* */
};

exports.requestAndExtract = requestAndExtract;
