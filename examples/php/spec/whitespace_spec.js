var Parser = require("../../../lib").Parser.LRParser;
var pd = require("../lexical/whitespace.js");
var whitespace = {
	"space":" ",
	"newline":"\n",
	"cr":"\r",
	"crnl":"\r\n",
	"htab":"\t"
};

describe("PHP Parser - Whitespace - ", function(){

	for(var k in whitespace) {
		var character = whitespace[k];
		it(k, function(character){
			return function(end) {
				var parser = Parser.CreateWithLexer(pd);
				parser.on("error", function(error){ throw error.message; });
				parser.on("accept", function(ast){ 
					end();
				});
				// parser.getLexer().on("token", function(r){console.log(r); });

				// Begin processing the input
				parser.append(character);
				parser.end();
			}
		}(character));
	}
});