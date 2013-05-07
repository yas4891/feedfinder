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
	    try
	    {
	    var alternates = new Array();
	    jsdom.env({
		html: body,
		scripts: ["jquery.js"],
		done: function (errors, window) {
		    if(errors) 
		    {
			fnCallback(errors);
			return;
		    }
		    if(!window.$) {
			fnCallback("could not parse HTML from " + task.url, null);
			console.log(body);
			process.exit(123);
		    }
		    var $ = window.$;

		    try
		    {
			$('link[type*="application/rss"][rel*="alternate"]').each(function() {
			    alternates.push({
				url: task.url, 
				feed_url: modurl.resolve(task.url, $(this).attr('href')).toString()
			    });
			}); // links each
		    }
		    catch(exception) 
		    { 
			console.log("error parsing site:", exception);
			return fnCallback(exception);
		    }
		    finally { window.close();}

		    var tsk = {url: task.url, feeds: alternates};
		    fnCallback(null, tsk);
		} // jsdom.done
	    }); //jsdom.env
	    }
	    catch(exception) { fnCallback(exception);}
	} // HTTP 200
    }).setMaxListeners(25); // request 
	/* */
};

exports.requestAndExtract = requestAndExtract;
