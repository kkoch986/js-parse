var Parser = require("../../../lib").Parser.LRParser;
var terminals_pd = require("../syntax/primary_expressions.js");
require.main.paths.push(__dirname + "/../lexical");
require.main.paths.push(__dirname + "/../syntax");

describe("PHP Parser - Primary Expressions - ", function(){

	var positive_literal_cases = {
		"$test":"variable-name"
	};

	// These symbols should not parse as part of the grammar
	var negative_cases = {
		
	};

	/** 
	 * Positive name cases.
	 **/
	for(var test in positive_literal_cases) {
		var expected = positive_literal_cases[test];

		it(expected + " - " + test, function(test, expected){
			return function(end){
				terminals_pd.startSymbols = [expected];
				var parser = Parser.CreateWithLexer(terminals_pd, {"path":"./syntax"});
				parser.on("error", function(error){ throw error.message; });
				// parser.getLexer().on("token", function(r){console.log(r); });
				parser.on("accept", function(ast){ 
					var type = typeof ast[0].type === "undefined" ? ast[0].head : ast[0].type;
					type.should.eql(expected);
					end();
				});
				parser.append(test);
				parser.end();
			}
		}(test,expected));
	}

	/**
	 * Negative cases.
	 **/
	for(var test in negative_cases) {
		var expected = negative_cases[test];

		it("Negative Tests - `" + test + "`", function(test){
			return function(end){
				try {
					terminals_pd.startSymbols = [expected];
					var parser = Parser.CreateWithLexer(terminals_pd, {"path":"./lexical"});
					// parser.getLexer().on("token", function(r){console.log(r); });
					parser.append(test);
					parser.end();
				} catch(e) {
					end();
				}
			}
		}(test,expected));
	}
});