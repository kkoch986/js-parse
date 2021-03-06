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
/**
	RE -> UNION | SIMPLE_RE.
	UNION -> RE "|" SIMPLE_RE.
	SIMPLE_RE -> CONCAT | BASIC_RE.
	CONCAT -> SIMPLE_RE BASIC_RE.
	BASIC_RE -> STAR | PLUS | ELEM_RE.
	STAR -> ELEM_RE "*".
	PLUS -> ELEM_RE "+".
	ELEM_RE -> GROUP | ANY | EOS | CHAR | SET.
	GROUP -> ( RE ).
	ANY -> ".".
	EOS -> "$".
	CHAR -> NONMETACHAR | SLASH METACHAR.
	SET -> POS_SET | NEG_SET.
	POS_SET -> "[" SET_ITEMS "]".
	NEG_SET -> "[" "^" SET_ITEMS "]".
	SET_ITEMS -> SET_ITEM SET_ITEMS | SET_ITEM.
	SET_ITEM -> RANGE | CHAR.
	RANGE -> CHAR "-" CHAR.
**/

var jsp = require("../../lib");
var Lexer = jsp.Lexer;
var Parser = jsp.Parser.LRParser;
var pd = require("./re.json");

// Create the parser
var parser = Parser.Create(pd);

parser.on("accept", function(token_stack){
	console.log("Parser Accept:", JSON.stringify(token_stack));
});

parser.on("production", function(head, body){
	console.log("[PARSE]", head, body);
});

parser.on("error", function(error){
	console.log("Parse Error: ", error.message);
	throw error.message;
});

// Create the lexer
var lexer = Lexer.Create(pd.symbols);
lexer.on("token", function(token){
	// Pass tokens to the parser immediately.
	console.log("Token recognized: ", token);
	parser.shift(token);
});

lexer.on("end", function(){
	parser.end();
});

// Begin processing the input
// var input = "[a-zA-Z0-9]";
var input = "(.*)$";
for(var i in input) {
	lexer.append(input[i]);
}
lexer.end();




