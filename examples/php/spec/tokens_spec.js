var Parser = require("../../../lib").Parser.LRParser;
var terminals_pd = require("../lexical/tokens.js");
// require.main.paths.push(__dirname + "/../lexical");

describe("PHP Parser - Names - ", function(){

	var positive_literal_cases = {
		"$test":"variable-name",
		"$test12345":"variable-name",
		"$_test12345":"variable-name",
		"$___test12345":"variable-name",
		"___test12345":"namespace-name",
		"___test12345\\test333":"namespace-name",
		"___test12345\\test333\\test444":"namespace-name",
		"for":"token",
		"$abcdefg":"token",
		"randomword":"token",
		"null":"token",
		"12345":"token",
		"0.01":"token",
		"\"\\xaf\"":"token"
	};

	// These symbols should not parse as part of the grammar
	var negative_cases = {
		"$000test":"variable-name"
	};

	/** 
	 * Positive name cases.
	 **/
	for(var test in positive_literal_cases) {
		var expected = positive_literal_cases[test];

		it(expected + " - " + test, function(test, expected){
			return function(end){
				terminals_pd.startSymbols = [expected];
				var parser = Parser.CreateWithLexer(terminals_pd, {"path":"./lexical"});
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

	/**
	 * Operators and Punctuation
	 **/
	// Operators.
	var operators = [
		"[", "]", "(", ")", "{", ".", "->", "++", "--", "**", "*", "+", 
		"-", "~", "!", "$", "/", "%", "<<", ">>", "<", ">", "<=", ">=", 
		"==", "===", "!=", "!==", "^", "|", "&", "&&", "||", "?", ":", 
		";", "=", "&", "**=", "*=", "/=", "%=", "+=", "-=", ".=", "<<=", 
		">>=", "&=", "^=", "|=", ","
	];
	describe("PHP Parser - Tokens - Operators and Punctuation", function(){
		for(var k in operators) {
			var operator = operators[k];
			it("`" + operator + "`", function(operator){
				return function(end) {
					terminals_pd.startSymbols = ["token"];
					var parser = Parser.CreateWithLexer(terminals_pd, {"path":"./lexical"});
					parser.on("error", function(error){ throw error.message; });
					// parser.getLexer().on("token", function(r){console.log(r); });
					parser.on("token", function(ast){
						ast[0].head.should.eql('literals.operator-or-punctuator');
						ast[0].body[0].type.should.eql("literals." + operator);
						end();
					});
					// Begin processing the input
					parser.append(operator);
					parser.end();
				}
			}(operator));
		}
	});
});