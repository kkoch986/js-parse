

/**
 * Create a tokenizer.
 **/
var TokenizerModule = require("./lib").Tokenizer;
var Tokens = TokenizerModule.Token;

// Create a new tokenizers with the given token configuration
var init_filters = [
	TokenizerModule.Filters.removeInlineComments("%")
];

var Tok_String = Tokens.StringTokenPrototype;
var Tok_Variable = Tokens.prolog.PrologVariableTokenPrototype;
var Tok_Atom = Tokens.AtomTokenPrototype;
var Tok_Number = Tokens.NumberTokenPrototype;
var Tok_Symbol = Tokens.prolog.PrologSymbolTokenPrototype;
var Tok_Word = Tokens.WordTokenPrototype;

var token_chain = [
	Tok_Word.create()
];
var tok = TokenizerModule.Tokenizer.Create(init_filters, token_chain);

/**
 * Create a Parser.
 **/
var ParserModule = require("./lib").Parser.LRParser;
var parser = ParserModule.factory(require("./examples/example1.json"), function(AST){
	console.log(AST);
});

/**
 * Begin Tokenizing/Parsing
 **/
tok.start("a a a b c d e e e e e");

console.log("Input: ", tok.getStream());
var t = null;
while(t = tok.next()) {
	parser.shift(t);
}
parser.end();