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

var jsp = require("./lib");
var Lexer = jsp.Lexer;
var Parser = jsp.Parser.LRParser;
var pd = require("./examples/meta.json");
var parserDescription = {
	"symbols":{
		"WS": { 
			"includeInStream":false,
			"terminal":true,
			"excludeFromProduction":true,
			"match":"[ \t\n]+"
		}
	},
	"productions":{},
	"startSymbols":[]
};
var closed = false;

// Create the parser
var parser = Parser.Create(pd);

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
console.log("Begin entering the Grammar (\\q to finish):");
var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function handleInput(line) {
	if(line.trim() === "\\q") { 
		closed = true;
		rl.close();
		lexer.end();
		return ;
	}

	for(var l in line) {
		lexer.append(line[l]);
	}

	rl.question("> ", handleInput);
}

rl.question("> ", handleInput);

parser.on("GrammarLine", function(GrammarLine, AST){
	var head = GrammarLine[0].body[0].value;
	console.log("[META] Processing rules for: " + head);

	// check if its the first symbol
	if(parserDescription.startSymbols.length === 0) {
		console.log("[META] Using " + head + " as start symbol.");
		parserDescription.startSymbols.push(head);
	}

	// Ensure that a productions array exists for this head.
	if(!parserDescription.productions[head]) {
		parserDescription.productions[head] = [];
	}

	// Ensure the HEAD is in the symbols list as a non-terminal
	if(!parserDescription.symbols[head]) {
		parserDescription.symbols[head] = {};
	}
	parserDescription.symbols[head].terminal = false;

	// Now extract the symbol lists.
	var rules = SymbolListToAtomList(GrammarLine[1]);
	for(var r in rules) {
		var rule = [];

		var atoms = AtomListToAtoms(rules[r]);
		for(var a in atoms) {
			var atom = atoms[a].value;
			rule.push(atom);

			if(!parserDescription.symbols[atom]) {
				var match = atom.replace(/([\*\+\.\(\)\[\]])/ig, "\\$1");
				parserDescription.symbols[atom] = { "terminal": true, "match":match };
			}
		}

		parserDescription.productions[head].push(rule);
	}
});

parser.on("accept", function(AST){
	if(closed) {
		console.log("Grammar definition:\n", JSON.stringify(parserDescription));
	}
});

/**
 * Take a symbol list token and recursively unfold it into an array of AtomLists.
 **/
function SymbolListToAtomList(symbolList) {
	if(symbolList.body.length === 0) {
		return [];
	} else if(symbolList.body.length === 1) {
		return [symbolList.body[0]];
	} else {
		return [ symbolList.body[0] ].concat(SymbolListToAtomList(symbolList.body[1]));
	}
}

/**
 * Take an atom list and recursively unfold it into an array of Atoms.
 **/
function AtomListToAtoms(atomList) {
	if(atomList.body.length === 0) {
		return [];
	} else if(atomList.body.length === 1) {
		return [atomList.body[0].body[0]];
	} else {
		return [ atomList.body[0].body[0] ].concat(AtomListToAtoms(atomList.body[1]));
	}
}