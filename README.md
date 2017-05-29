
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

## How it works

### Creating a parser
Currently, everything is based around a JSON object called a parser description.
The parser description contains all of the info about the grammar and its symbols.

Parser descriptions can also be used to build sub-modules which can be included
to keep description files concise and reusable.

More info on the format and details for a parser description are included below.

### Parsing
Once you have built your parser description, load it into node.js and use it to create
a parser (`Parser.Create` or more commonly, `Parser.CreateWithLexer`). The parser
emit 2 standard events: `accept` and `error` as well as an event for each non-terminal symbol
provided by the parser description or its included modules.

The `error` event is pretty self-explanatory. If there is a syntax error
or tokenization error (only if tokenizer is attached using `CreateWithLexer`).

The `accept` event is fired when the parser has been notified that the stream is over
and it has built a complete parse tree. This will be called with the entire parse tree
as an argument and is useful for getting a look at the whole parse tree.

The `accept` callback is not the only way to interact with the parser, one of the coolest
features about js-parse is its bottom-up nature. Since js-parse builds parse trees from the smallest
elements up to the biggest you can actually begin to process the code before parsing the entire
file.

For example, consider the grammar:
```
A -> b c D.
D -> e f g.
```

It is possible to bind handlers to the parse such as
```javascript
parser.on("D", function(D){ console.log("parsed D"); });
parser.on("A", function(A){ console.log("parsed A"); });
```

These callbacks will be fired as soon as the parser constructs the D or A element,
no need to wait until the entire stream is processed.

## Basic parsing example

```javascript
var Parser = require("./lib").Parser.LRParser;
var pd = require("./examples/parser_description.json");

// Create the parser
var parser = Parser.CreateWithLexer(pd);

parser.on("accept", function(token_stack){
	console.log("Parser Accept:", require('util').inspect(token_stack, true, 1000));
});

parser.on("error", function(error){
	console.log("Parse Error: ", error.message);
	throw error.message;
});

// Begin processing the input
var input = "[a-zA-Z0-9]+([W]*)[0-9]+";
for(var i in input) {
	parser.append(input[i]);
}
parser.end();

```

## Writing Parser Descriptions

Writing a parser description is as simple as creating a basic JSON object.
It all starts with the basic template:

```json
{
		"symbols": { },
		"productions": { },
		"modules":{ },
		"startSymbols": [ ]
}
```

Let's take a closer look at each section.

### Symbols

The symbols section is where you define all of the terminal symbols in the grammar.
All terminal symbols must be provided in this section along with a regular expression
to be used by the lexer to create tokens from the input stream.

Non-terminal symbols are optional in this section and only need to be included if
you are setting custom options for them.

#### Terminals

Terminal symbols must be defined in the parser description along with a regular expression
used by the lexer to extract the symbol as a token from the input stream.

Lets take a look at a sample terminal symbol definition:

```json
"WS": {
	"terminal":true,
	"match":"[ \t\n]+"
}
```

This is a common token i use when writing parsers, whitespace. Typically, my parsers
are written to extract the whitespace between tokens and discard it. This symbol is
defined so that it will match the longest symbol matching `^[ \t\n]+$` will be
recognized as a whitespace token and passed along to the parser as such.

The `terminal` option is required in all symbols. The `match` option is required when
`terminal` is `true`.

Lets say we didn't care about whitespace and didn't want to bog down our grammer with WS
tokens everywhere. We can include some options to make sure it isn't included:

```json
"WS": {
	"terminal":true,
	"match":"[ \t\n]+",
	"excludeFromProduction":true,
	"includeInStream":false
}
```

Notice the two new options, `excludeFromProduction` and `includeInStream`.

`includeInStream` - Setting this option to `false` will cause the lexer to recognize
and discard this token rather than passing it along to the parser.

`excludeFromProduction` - Setting this option to `true` will cause the parser to discard
this symbol when it recognizes it in a parse tree structure. In the context above, this
option would be redundant since the parser would never find out about the WS token anyway.

##### Other options

`matchOnly` - `matchOnly` is useful for tokens like strings in quotes, consider the symbol definition:
```json
"atom_quote": {
	"terminal":true,
	"match":"\"((?:[^\"\\\\]|\\\\.)*)\"",
	"matchOnly":1
},
```
In this case, `matchOnly` will remove the opening and closing quotes from the stream but only include
the section of the token given by `(/^<regex>/).exec(string)[matchOnly];` In the case above,
it will return the part of the string in the first set of captured parenthesis (the string without the quotes).

`matchCaseInsensitive` - This will add the `/i` flag to the regex, causeing it to match regardless
of case.

`lookAhead` - `lookAhead` is useful when you need to look ahead in the stream to determine which
token to use. Consider the following tokens:

```
"KW_endforeach":{
	"terminal":true,
	"match":"(endforeach)",
	"matchCaseInsensitive":true
},
"KW_endfor":{
	"terminal":true,
	"match":"(endfor)",
	"matchCaseInsensitive":true
},
```

Its clear that the lexer will always match `endfor` and never match `endforeach` so we
need a way to differentiate the two. We can add the following `lookAhead` option to make
sure that we see the next symbol before matching this token.

```
"KW_endforeach":{
	"terminal":true,
	"match":"(endforeach)",
	"matchCaseInsensitive":true
},
"KW_endfor":{
	"terminal":true,
	"match":"(endfor)",
	"lookAhead":"[^e]",
	"matchCaseInsensitive":true
},
```

This means, the token will not be considered a match unless we see a match for `match` followed
by a match for `lookAhead`. This will allow the lexer to find the `endforeach` token
when appropriate.


#### Non-terminals

Non-terminal symbols are not required in the symbol definitions since they are easily
extracted from the `productions` object described below.

Non-terminal symbols can be included if you want to set some custom options on them.

##### excludeFromProduction

As described in the terminal symbol section above, the `excludeFromProduction` option is also
available for non-terminal symbols. It will cause the parser, upon realizing this symbol
to process it and continue without adding it to the current production it is trying to build.

##### mergeIntoParent

`mergeIntoParent` goes hand-in-hand with `mergeRecursive` below.
Setting this option to true for a non-terminal, will cause this productions children
to be set as arguments to the productions parent. It will cause the current symbol
to be excluded.

Consider the grammar:

```
SET_PARENT -> SET.
SET -> POS_SET | NEG_SET.
```

This will produce a parse tree structure like:

```
SET_PARENT ( SET ( POS_SET( ... ) ) )
```

There is really no need in the parse tree to include the `SET` element, so we can
merge its children into the `SET_PARENT`'s arguments.

After setting `mergeIntoParent` on `SET`, the parse tree will look like this instead:

```
SET_PARENT ( POS_SET ( ... ) )
```

##### mergeRecursive

`mergeRecursive` is a pretty powerful tool when building a useful parse tree.

Consider a construct like an argument list. Typically you might define one as such:

```
ArgList -> Arg | Arg ArgList
```

This works great, the only problem is when parsing something like this:

```
a(a,b,c,d).
```

The `ArgList` parse tree will look something like this:

```
ArgList(
		Arg(a),
		ArgList(
				Arg(b),
				ArgList(
					Arg(c),
					ArgList(
							Arg(d)
					)
				)
		)
)
```

By providing `mergeRecursive` on the `ArgList` symbol, the parser will detect this
kind of recursive structure being built and will merge them into a single array.
Producing something much more tolerable:

```
ArgList( Arg(a), Arg(b), Arg(c), Arg(d) )
```

##### abandon

The `abandon` option will cause the matched production to be dropped from the parser
stack. This means when for all intents and purposes it vanishes from the parse
tree. I added this option to support really incremental processing.

For example, the `statement_list` defined in [NodePL](https://github.com/kkoch986/nodepl/blob/master/grammars/source.json#L28-L32).
In that case I had no use for the statements once they were already parsed since
they were handled by the EventEmitter. What would happen when parsing large files
with a few thousand statements is it would parse pretty fast but on the file step
it would have to traverse all the way back to the beginning of the file. This was
a waste, so instead i drop them from the parse tree and a 10s parse is transformed
into a 0.5s parse!

### Productions

Defining the productions is the most crucial part of the parser description.
It's where all the action happens.

This section most closely resembles the BNF-style grammars you're probably used to.
It is composed of keys which represent non-terminal symbols and their value is an array
of string arrays representing the productions which compose the symbol.

For example consider the grammar:
```
A -> b c D
A -> f
D -> e f g
```

The `productions` object for this would look like this:

```json
"productions":{
	"A":[
		["b", "c", "D"],
		["f"]
	],
	"D":[
		["e", "f", "g"]
	]
}
```

Thats about all there is to it in this section.

### StartSymbols

The `startSymbols` array is also quite simple, it defines the top-most entities
in your grammar and will be used to define when to accept the input as a complete structure.

The `startSymbols` array should be a simple array of strings representing the symbols
which serve as starting points for the grammar. In the example above, if we wanted to
start on A only, we would provide `startSymbols` as:

```json
"startSymbols":["A"]
```

### Modules

One of the most exciting features of js-parse is its module system.
Its a very simple system to use and it allows self-contained, reusable
grammar modules to be created. The `modules` object is completely optional.

The `modules` object contains key/value pairs where the key
is a name to apply to the module and the value is the path to the JSON object which defines it.

Consider the following files:

_a.json_:
```json
{
	"symbols":{
		"a":{"terminal":true, "match":"a"},
		"b":{"terminal":true, "match":"b"}
	},
	"productions":{
		"S":[ "a", "b", "a" ]
	},
	"startSymbols":["S"]
}
```

_b.json_:
```json
{
	"symbols":{
		"c":{"terminal":true, "match":"c"},
		"d":{"terminal":true, "match":"d"}
	},
	"productions":{
		"S":[
			["MOD_A.S", "c", "d", "c"]
		]
	},
	"modules":{
		"MOD_A":"./a.json"
	},
	"startSymbols":["S"]
}
```

As you can see, the _a.json_ parser description can be used in the _b.json_ grammar.
All of the symbols in _a.json_ are prefixed with the key given in _b.json_.

The symbols in `A` can also be modified when imported into `B` simply by using the dot syntax.
For instance, in _b.json_ we could add the following to the `symbols` object:
```json
"MOD_A.b":{"terminal":true, "match":"Z"}
```

Now the `b` symbol in the `A` grammar will be matched only by `Z` (when imported into `B` this way).

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

It doesn't support any of the more advanced features available in the parser description
object, but its useful for getting started with the basic structure you'll need.

## Last remarks
This documentation was but together pretty hastily, so please feel free to open issues, leave comments
or submit pull requests. js-parse is in pretty early stages and theres a lot of room
to grow!

Also note, some of the examples have fallen a little out of date. I will try to update them ASAP.

## TODO:
1. Cleanup/reorganize code to make something more maintainable.
1. Fix tests broken by parser conflicts.
1. MORE TESTS!!!
1. Easier to use grammar specification format.

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
