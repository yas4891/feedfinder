var async = require('async');
var fs = require('fs');
var lazy = require('lazy');

var total = 0;
var arrFA = [];
var cFAlt2 = 0;
var cItems = 0;
/* */
fs.readFile('complete.json', 'utf-8', function(err, data) {
	var lines = data.split(/(\r)\n/);
	lines.forEach(function(line) {
	
		if(!line || !line.trim()) return;
		
		cItems++;
		var obj = JSON.parse(line);
		
		if(obj.features && obj.features.feedauthority)
		{
			var fa = obj.features.feedauthority;
			total += fa;
			if(fa < 2)
			{
				cFAlt2++;
			}
			arrFA.push(fa);
		}
		
	});
	
	console.log("total items:", cItems);
	console.log("items with FA:", arrFA.length);
	console.log("below 2.0 FA:", cFAlt2);
	console.log("mean:", (arrFA[Math.floor(arrFA.length / 2)]));
	console.log("average:", (total / arrFA.length));
	console.log("read the whole file");
});

/* */

//request.setMaxListeners(0);
