/*
	Copyright (c) 2014, Kenneth Koch <kkoch986@gmail.com>

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

var Parser = require("../../lib/index").Parser.LRParser;

var parserDescription = {
	"symbols":{
		"integer-literal":{
			"terminal":true,
			"match":"[\\+\\-]?[0-9]+",
			"lookAhead":"[^\\.]"
		},
		"float-literal":{
			"terminal":true,
			"match":"[\\+\\-]?[0-9]*[\\.][0-9]+"
		},
		"string-literal":{
			"terminal":true,
			"match":"\"(.*)\""
		},
		"id":{
			"terminal":true,
			"match":"[a-zA-Z_][a-zA-Z0-9_]*"
		},
		"assignment_operator": {
			"terminal":true,
			"match":"((=)|(\\*=)|(/=)|(\\%=)|(\\+=)|(\\-=))"
		},
		"add_operator": {
			"terminal":true,
			"match":"((\\+)|(\\-))",
			"lookAhead":"[^=]"
		},
		"mult_operator": {
			"terminal":true,
			"match":"((\\*)|(/)|(%))",
			"lookAhead":"[^=]"
		},
		"open_paren": {
			"terminal":true,
			"match":"\\(",
			"excludeFromProduction":true
		},
		"close_paren": {
			"terminal":true,
			"match":"\\)",
			"excludeFromProduction":true
		},
		"semicolon": {
			"terminal":true,
			"match":";",
			"excludeFromProduction":true
		},
		"whitespace": {
			"terminal":true,
			"match":"[ \n\t]+",
			"includeInStream":false
		},
		"statement_list":{
			"terminal":false,
			"mergeRecursive":true
		},
		"primary_exp":{
			"terminal":false,
			"mergeIntoParent":true
		}
	},
	"productions":{
		"literal": [
			[ "integer-literal" ],
			[ "float-literal" ],
			[ "string-literal" ]
		],
		"statement":[
			[ "exp" ]
		],
		"exp":[
			["assignment_exp"],
			["add_exp"]
		],
		"primary_exp":[
			[ "open_paren", "exp", "close_paren"],
			[ "id" ],
			[ "literal" ]
		],
		"add_exp":[
			[ "mult_exp", "add_operator", "add_exp" ],
			[ "mult_exp" ]
		],
		"mult_exp":[
			[ "primary_exp", "mult_operator", "mult_exp" ],
			[ "primary_exp" ]
		],
		"assignment_exp":[
			[ "primary_exp", "assignment_operator", "exp" ]
		],
		"statement_list":[
			[ "statement_list", "statement", "semicolon" ],
			[ "statement", "semicolon" ]
		]
	},
	"startSymbols": [ "statement_list" ]
};

// Create the parser
var parser = Parser.CreateWithLexer(parserDescription);

parser.on("accept", function(token_stack){
	console.log("\n\nParser Accept:" + parser.prettyPrint());
});

parser.on("error", function(error){
	console.log("Parse Error: ", error.message);
	throw error.message;
});

// Begin processing the input
var input = 'x = ((10 + 55) * 10 + 5) / 10; y = x * 2; y;';
parser.append(input);
parser.end();