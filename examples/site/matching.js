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
		"(": { "terminal":true, "match":"\\(", "excludeFromProduction":true },
		")": { "terminal":true, "match":"\\)", "excludeFromProduction":true },
		"chars": { "terminal":true, "match":"[^\\(\\)]+" }
	},
	"productions":{
		"S":[
			[ "S", "(", "S", ")", "chars" ],
			[ "S", "(", ")", "chars" ],
			[ "S", "(", "S", ")" ],
			[ "S", "(", ")" ],
			[ "(", "S", ")" ],
			[ "(", ")" ],
			[ "chars" ]
		]
	},
	"startSymbols": [ "S" ]
};

// Create the parser
var parser = Parser.CreateWithLexer(parserDescription);

parser.on("accept", function(token_stack){
	console.log("Parser Accept:", require('util').inspect(token_stack, true, 1000));
});

parser.on("error", function(error){
	console.log("Parse Error: ", error.message);
	throw error.message;
});

// Begin processing the input
var input = "a(b(c)d()e)";
parser.append(input);
parser.end();
