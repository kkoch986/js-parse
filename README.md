
# Generic Tokenizer and Shift-Reduce, incremental parser.

Very WIP right now... see index.js for usage example. 
Currently basic parsing works correctly, but the errors are crude and have no relevance to 
whats wrong with the input stream.

## Basic example

```javascript

var jsp = require("./lib");
var Lexer = jsp.Lexer;
var Parser = jsp.Parser.LRParser;
var pd = require("./examples/meta.json");

// Create the parser
var parser = Parser.Create(pd);
parser.on("GrammarLine", function(GrammarLine, AST){
	console.log("GrammarLine", GrammarLine);
});

parser.on("accept", function(token_stack){
	console.log("Parser Accept:", token_stack);
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
var input = "a -> b C d | e.";
for(var i in input) {
	lexer.append(input[i]);
}
lexer.end();
```

## CLI for creating grammar specifications

For now i have written a CLI tool to generate parser definitions using a BNF-like syntax. 
The tool can be invoked using:

```
node meta.js
```
Lines can be entered using the following format:

```
SYMBOL -> SYMBOL [SYMBOL [SYMBOL ...]] [| SYMBOL].
```

To finish, enter `\q` on a line.

Here is an example run through:

```
Begin entering the Gramamar (\q to finish):
> S -> a S e | B.
[META] Processing rules for: S
[META] Using S as start symbol.
> B -> b B e | C.
[META] Processing rules for: B
> C -> c C e | d.
[META] Processing rules for: C
> \q
Grammar definition:
 {"symbols":{"S":{"terminal":false},"a":{"terminal":true},"e":{"terminal":true},"B":{"terminal":false},"b":{"terminal":true},"C":{"terminal":false},"c":{"terminal":true},"d":{"terminal":true}},"productions":{"S":[["a","S","e"],["B"]],"B":[["b","B","e"],["C"]],"C":[["c","C","e"],["d"]]},"startSymbols":["S"]}
```

## TODO:

1. ~~Conflict detection (shift/reduce, reduce/reduce)~~
1. ~~Overhaul lexer set up.~~
1. Error reporting (nice errors instead of just blowing up)
1. Easier to use grammar specification format.
1. Fix tests broken by parser conflicts.
1. MORE TESTS!!!
1. Cleanup/reorganize code to make something maintainable.
1. Documentation (eventually....)