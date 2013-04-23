var jsdom = require("jsdom");

var win;

function parse(html, fnCallback) {
    if (!win) {
    	var defEnv = {
	    html:html,
	    scripts:["jquery.js"],
	};
	jsdom.env(defEnv, function (err, window) {
	    if (err) throw new Error('failed to init dom');
	
	    win = window;
	    //console.log('window:', window);
	    fnCallback(window.jQuery);
	});
    } // win not initialized
    else {
	win.document.innerHTML = html;
	fnCallback(win.jQuery);
    }
};
exports.parse = parse
