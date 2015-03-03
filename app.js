/**
 * Node Aplication to fetch all the social link of the
 * user from the user's profile page
 *
 * Author: Yogesh Joshi (iyogeshjoshi@gmail.com)
 * github: git@github.com:iyogeshjoshi/profile-link-fetcher.git
 **/

// Required Files
var request = require('request');
var $ = require('cheerio');
var async = require('async');
var fs = require('fs');
var csv = require('csv');

var query = "https://www.udemy.com/become-a-certified-web-developer/?dtcode=fJGg7We2suwg";

// Reads CSV file
var readFile = function(err, data){
  if(err) console.error(err);
  parseCsv(data);
}

// writes output to the CSV file
var writeFile = function(err, data){
  if(err) console.error(err);
  fs.writeFile(process.argv[2], data, function(err){
    if(err) console.error(err);
    console.log('Result saved to file: ' + process.argv[2]);
  })
}
// makes request and get profile html
var getHTML = function(row, cb){
  var query = row['Instructor profile.href'];
  // return row if no profile url provided
  if(!query){
    console.log('called');
    cb(null, row);
  }
  if(query){
    request(query, function(err, res, html){
      var social = [];
      if(err) console.error(err);
      if(!err){
        // loads the profile html
        parsedHTML = $.load(html);
        // extract all social profile links
        parsedHTML('.soc-a.globe', 'body').map(function(i, url){
          row['blog'] = $(url).attr('href') || '';
        });
        parsedHTML('.soc-a.twitter', 'body').map(function(i, url){
          row['twitter'] = $(url).attr('href') || '';
        });
        parsedHTML('.soc-a.google', 'body').map(function(i, url){
          row['google'] = $(url).attr('href') || '';
        });
        parsedHTML('.soc-a.youtube', 'body').map(function(i, url){
          row['youtube'] = $(url).attr('href') || '';
        });
        // console.log(row);
        cb(null, row);
      }
    });
  }
}

// parses csv data from string
var parseCsv = function(input, cb){
  var parseOptions = {
    trim: true,
    skip_empty_lines: true,
    columns: true
  };
  // parse csv string
  csv.parse(input, parseOptions, function(err, output){
    async.map(output, getHTML, function(err, results){
      // Stringify options
      var stringifyOptions = {
        header: true,
      }
      // convert array to csv string
      csv.stringify(results, stringifyOptions, writeFile)
    })
  });
}

// file read config
var fileOptions = {
  encoding: 'utf-8',
  flag: 'r+'
}
// reads the given file
fs.readFile(process.argv[2], fileOptions, readFile);
