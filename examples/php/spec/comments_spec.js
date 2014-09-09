var Parser = require("../../../lib").Parser.LRParser;
var pd = require("../lexical/comments.js");
var tests = {
	"Single Line":"// this is a comment.",
	"Single Line with Hash":"# this is a comment with a hash.",
	"Delimited 1":"/* Comment in stars */",
	"Delimited 2":"/* Comment \n with newline \n */",
	"Delimited 3":"/* Comment with **** stars */",
	"Delimited 4":"/** Comment with ** opening */",
};

describe("PHP Parser - Comments - ", function(){

	for(var k in tests) {
		var test = tests[k];
		it(k, function(test){
			return function(end) {
				var parser = Parser.CreateWithLexer(pd);
				parser.on("error", function(error){ throw error.message; });
				parser.on("accept", function(ast){ 
					end();
				});

				// Begin processing the input
				parser.append(test);
				parser.end();
			}
		}(test));
	}
});