
# Generic Tokenizer and Modular, Bottom-up incremental parser.

This project provides a node.js implementation of an LR(1) parser. 
The parser works in a bottom-up fashion which permits us to do cool things
like incremental processing. If you look at the basic examples, you can see
that the parser fires callbacks whenever productions in the grammer are produced. 
This may happen even before the end of the token stream is encountered.

Grammars are specified by a JSON file currently, but i plan to expand on this to use javascript files
and potential a declarative-type-language-thing depending on how things go.

In the example (`index.js`) you will see examples of what makes this project cool:

1. __Modules__ -- js-parse provides the ability to build pieces of your grammar in separate files and 
import then on the fly into the grammar (see `test.json`, `re_wrapper.json` and `re/re.json` for examples). 
The modules can be used on their own or as part of a larger grammar which makes grammar files more readable, 
maintainable and reusable.
1. __Incremental__ -- In true javascript fashion, everything about the parser can be treated as asynchronous.
The parser will notify you whenever important pieces of the grammar are recognized so you may start processing
them before reaching the end of the input stream.

Things are pretty alpha right now but i'll try to keep this readme up to date and improving as time goes on.
Feel free to open issues or contribute!

## Basic example

```javascript

var jsp = require("./lib");
var Lexer = jsp.Lexer;
var Parser = jsp.Parser.LRParser;
var pd = require("./examples/test.json");

// Create the parser
var parser = Parser.Create(pd);

parser.on("accept", function(token_stack){
	console.log("Parser Accept:", require('util').inspect(token_stack, true, 1000));
});

parser.on("error", function(error){
	console.log("Parse Error: ", error.message);
	throw error.message;
});

// Create the lexer
var lexer = Lexer.Create(parser.getParserDescription().symbols);
lexer.on("token", function(token){
	// Pass tokens to the parser immediately.
	parser.shift(token);
});

lexer.on("end", function(){
	parser.end();
});

// Begin processing the input
var input = "[a-zA-Z0-9]+([W]*)[0-9]+";
for(var i in input) {
	lexer.append(input[i]);
}
lexer.end();

```

## CLI for creating grammar specifications

For now i have written a CLI tool to generate parser definitions using a BNF-like syntax. 
It doesn't leverage some of the new features of js-parse but should help serve as both an example
and a tool for getting started with the JSON grammar specification format.
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
{"symbols":{"WS":{"includeInStream":false,"terminal":true,"excludeFromProduction":true,"match":"[ \t\n]+"},"a":{"terminal":false},"S":{"terminal":true,"match":"S"},"e":{"terminal":true,"match":"e"},"B":{"terminal":false,"match":"B"},"b":{"terminal":true,"match":"b"},"C":{"terminal":false,"match":"C"},"c":{"terminal":true,"match":"c"},"d":{"terminal":true,"match":"d"}},"productions":{"a":[["a","S","e"],["B"]],"B":[["b","B","e"],["C"]],"C":[["c","C","e"],["d"]]},"startSymbols":["a"]}
```

## License
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

## TODO:

1. ~~Conflict detection (shift/reduce, reduce/reduce)~~
1. ~~Overhaul lexer set up.~~
1. ~~Error reporting (nice errors instead of just blowing up)~~
1. ~~Import grammars into other grammars as modules.~~
1. ~~Recursive import depth.~~
1. ~~Check for cyclic dependencies in module import~~
1. Potentially merge lexer/parser api to allow less code for basic parsing.
1. Improve/Create Documentation
1. Cleanup/reorganize code to make something maintainable.
1. Fix tests broken by parser conflicts.
1. MORE TESTS!!!
1. Easier to use grammar specification format.
