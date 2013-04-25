var fs = require('fs');

var linesTw = fs.readFileSync("twitter_feeds.txt", 'utf-8').split('\n');

var feedsTw = linesTw.map(function(line) {
    var elts = line.split(" |||SEPERATOR||| ");
    return {feed: elts[1].trim(), homepage: elts[0].trim()};
});

linesTw = null; // allow gc

var linesTn = fs.readFileSync("technorati_feeds.txt", 'utf-8').split('\n');
var feedsTn = linesTn.map(function(line) {
    var elts = line.split(" |||SEPERATOR||| ");
    return {feed: elts[2].trim(), homepage: elts[1].trim(), rank: elts[0].trim()};
});

var result = new Array();
var lenTn = feedsTn.length - 1;
feedsTw.forEach(function(elt) {
    for(var i = 0; i <= lenTn; i++){
	if(elt.feed == feedsTn[lenTn].feed)
	{
	    result.push({twitter: elt, aggregator: feedstn[lenTn]});
	    break;
	}
    } // for feedsTn
});

console.log("found ", result.length, " matchess");


