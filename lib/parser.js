var jsdom = require("jsdom");

var win;

function parse(html, fnCallback, position) {
    if (!win) {
    	var defEnv = {
	    html:html,
	    scripts:["jquery.js"],
	};
	jsdom.env(defEnv, function (err, window) {
	    if (err){
		fnCallback(new Error('failed to init dom for position ' + position +':' + err));

	    }
	    win = window;
	    //console.log('window:', window);
	    fnCallback(null, window.jQuery);
	});
    } // win not initialized
    else {
	win.document.innerHTML = html;
	fnCallback(null, win.jQuery);
    }
};
exports.parse = parse
