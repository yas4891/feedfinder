var fs = require('fs');
var request = require('request');
var async = require('async');


/*
require('twit');
var T = new Twit({
  consumer_key:         'Mrs3nlVzbd19grLIBuUQDg', 
  consumer_secret:      'VeOWqN1xNc7pOj9tHAaolsadDUDq2tntjPKkqDCG4y0', 
  access_token:         '607813043-5hQmI63C2FuMAOaC0Vy02DOVQPtxBFZ1KMlmJ48e',
  access_token_secret:  'x78akcpLxyIWdTPLw72wwAMPf8XE6FvBjNn7fKdqoA'
})


function callTwitterAPI(screenname)
{
  T.get('users/show', {screen_name: screenname}, function(err, reply) 
    {
      if(null != err)
      {
        console.log("Twitter Error occured: " + err);
      }
      else
      {
        if(!reply.url) 
          return;
        console.log(screenname + "==>" + reply.url);
        var request = require('request');
        
        request({uri: reply.url}, requestCallback); // REQUEST CALLBACK
      } // ELSE
    }
  ) // Twit.get 
}
/* */

