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
var events = require('events');

var LexerPrototype = Object.create(events.EventEmitter.prototype);
LexerPrototype.append = lexer_append;
LexerPrototype.end = lexer_end;

/**
 * Lexer Factory.
 **/
function Create(symbols) {
	var lexer = Object.create(LexerPrototype);
	lexer.string = "";
	lexer.token_stack = [];
	lexer.rules = [];

	// Process the rules from the input.
	// Rules must take the following form:
	// - testFull: 		A function which returns true if the given string can be entirely consumed by this token.
	// - testPrefix: 	A function which returns true if some portion of the given string, anchored at the begining, can be consumed by this token.
	// - getValue: 		A function which returns the value of the given token based on the given string, anchored at the begining.
	//						Returns false if no such value exists.
	// - removeValue: 	A function which returns the value of the given string after the prefix that can be consumed by this token is removed.
	// - symbol: 		The string value for this symbol.
	// - includeInStream: A function which returns true if the token should be pushed on to the token stack or not.
	for(var s in symbols) {
		var symbol = symbols[s];

		if(symbol.terminal === false) {
			continue ;
		}

		var valid = false;
		// Currently, only support regex string match rules.
		if(typeof symbol.match === "string") {
			lexer.rules.push({
				"symbol":s,
				"fullMatch":new RegExp("^" + symbol.match + "$", symbol.matchCaseInsensitive ? "i" : ""),
				"prefixMatch":new RegExp("^" + symbol.match, symbol.matchCaseInsensitive ? "i" : ""),
				"prefixMatchWithLookahead":new RegExp("^" + symbol.match + (symbol.lookAhead ? symbol.lookAhead : ""), symbol.matchCaseInsensitive ? "i" : ""),
				"testFull":function(string) { return this.fullMatch.test(string); },
				"testPrefix":function(string) { return this.prefixMatch.test(string); },
				"testPrefixWithLookAhead":function(string) { return this.prefixMatchWithLookahead.test(string); },
				"getValue": function(matchOnly) {
					return function(string) {
						if(!this.testPrefix(string)) {
							return false;
						}

						if(typeof matchOnly === "undefined") {
							matchOnly = 0;
						}

						return this.prefixMatch.exec(string)[matchOnly];
					}
				}(symbol.matchOnly),
				"removeValue":function(string) {
					return string.replace(this.prefixMatch, "");
				},
				"includeInStream": function(includeInStream) {
					return function() {
						return includeInStream !== false;
					}
				}(symbol.includeInStream)
			});
			valid = true;
		}

		if(!valid) {
			throw "Symbol `" + s + "` does not contain valid `match` rule.";
		}
	}

	return lexer;
}

/**
 * Append a token to the lexer stream.
 *
 * The lexer will perform various tasks at this point.
 *   1. Loop over each rule and test the rule against the current stream.
 *	 	If there is a full match, don't do anything.
 *		If there is a prefix match and not a full match,
 *			Remove the matching portion from the begining of the string
 *			and push that value on to the token stack.
 **/
function lexer_append(string) {
	this.string += string;

	var prefixMatchFound = false;
	for(var r in this.rules) {
		var rule = this.rules[r];

		if(rule.testPrefixWithLookAhead(this.string)) {
			prefixMatchFound = true;
			if(!rule.testFull(this.string)) {
				if(rule.includeInStream()) {
					var value = rule.getValue(this.string);
					var tok = {"type":rule.symbol, "value":value};
					this.token_stack.push(tok);
					this.emit("token", tok);
				}
				this.string = rule.removeValue(this.string);
			}
		}
	}
}

/**
 * Produces an "end" event.
 * This will look for fully matched rules only, if no such rules exist we will
 * produce a lexing error.
 **/
function lexer_end() {

	// Apply the rules one more time looking for a full match
	for(var r in this.rules) {
		var rule = this.rules[r];

		if(rule.testFull(this.string)) {
			if(rule.includeInStream()) {
				var value = rule.getValue(this.string);
				var tok = {"type":rule.symbol, "value":value};
				this.token_stack.push(tok);
				this.emit("token", tok);
			}
			this.string = rule.removeValue(this.string);
		}
	}

	if(this.string.length !== 0) {
		throw "Unrecognized characters at end of stream: '" + this.string + "'";
	}

	this.emit("end");
}

module.exports.Create = Create;
