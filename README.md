
# Generic Tokenizer and Shift-Reduce, incremental parser.

Very WIP right now... see index.js for usage example. 
Currently basic parsing works correctly, but the errors are crude and have no relevance to 
whats wrong with the input stream.

## Basic example

```javascript
/**
 * Create a tokenizer.
 **/
var TokenizerModule = require("./lib").Tokenizer;
var Tokens = TokenizerModule.Token;
var Tok_Word = Tokens.WordTokenPrototype;

var token_chain = [
	Tok_Word.create()
];
var tok = TokenizerModule.Tokenizer.Create([], token_chain);

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
```

## TODO:

1. Conflict detection (shift/reduce, reduce/reduce)
1. Error reporting (nice errors instead of just blowing up)
1. Cleanup/reorganize code to make something maintainable.
1. MORE TESTS!!!
1. Easier to use grammar specification format.
1. Documentation (eventually....)