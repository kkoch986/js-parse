

/**
 * Create a tokenizer.
 **/
var TokenizerModule = require("./lib").Tokenizer;
var Tokens = TokenizerModule.Token;

// Create a new tokenizers with the given token configuration
var init_filters = [
	
];

var Tok_Atom = Tokens.AtomTokenPrototype;
var Tok_Symbol = Tokens.prolog.PrologSymbolTokenPrototype;

var token_chain = [
	Tok_Atom.create(),
	Tok_Symbol.create()
];
var tok = TokenizerModule.Tokenizer.Create(init_filters, token_chain);

/**
 * Create a Parser.
 **/
var ParserModule = require("./lib").Parser.LRParser;

var parserDescription = {
	"symbols":{},
	"productions":{},
	"startSymbols":[]
};

var parser = ParserModule.factory(require("./examples/meta.json"), function(AST){
	var grammar = AST.pop();

	// Loop over the grammar lines
	var lines = grammar.value;
	for(var l in lines) {
		var line = lines[l].value;

		// Extract the Head symbol
		var head = line[0].value;
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
		var rules = SymbolListToAtomList(line[1]);
		for(var r in rules) {
			var rule = [];

			var atoms = AtomListToAtoms(rules[r]);
			for(var a in atoms) {
				var atom = atoms[a].value;
				rule.push(atom);

				if(!parserDescription.symbols[atom]) {
					parserDescription.symbols[atom] = { "terminal": true };
				}
			}

			parserDescription.productions[head].push(rule);
		}
	}
});

/**
 * Take a symbol list token and recursively unfold it into an array of AtomLists.
 **/
function SymbolListToAtomList(symbolList) {
	if(symbolList.value.length === 0) {
		return [];
	} else if(symbolList.value.length === 1) {
		return [symbolList.value[0]];
	} else {
		return [ symbolList.value[0] ].concat(SymbolListToAtomList(symbolList.value[1]));
	}
}

/**
 * Take an atom list and recursively unfold it into an array of Atoms.
 **/
function AtomListToAtoms(atomList) {
	if(atomList.value.length === 0) {
		return [];
	} else if(atomList.value.length === 1) {
		return [atomList.value[0]];
	} else {
		return [ atomList.value[0] ].concat(AtomListToAtoms(atomList.value[1]));
	}
}

/**
 * Begin Tokenizing/Parsing
 **/
tok.start("");

console.log("Begin entering the Gramamar (\\q to finish):");
var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


function handleInput(line) {
	if(line.trim() === "\\q") { 
		rl.close();

		console.log("Grammar definition:\n", JSON.stringify(parserDescription));
		return ;
	}

	tok.append(line);

    var ended = false;
	var t = null;
    while(t = tok.next()) {
		if(t.getType() === ".") {
			parser.shift(t);
			parser.end();
			ended = true;
		} else { 
			parser.shift(t);
		}
	}

	if(ended === false) {
		rl.question(">>> ", handleInput);
	} else {
		rl.question("> ", handleInput);
	}
}

rl.question("> ", handleInput);