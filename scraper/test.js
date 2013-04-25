var fs = require('fs');
var jsdom = require('jsdom').jsdom;

var data = JSON.parse(fs.readFileSync('data/101.json', { encoding:'utf-8'}));

var doc = jsdom(data.body, null, {
    features: { FetchExternalResources:false}
});

var window = doc.createWindow();

console.log(window.document.findByClass("site-details"));
//console.log(doc);
