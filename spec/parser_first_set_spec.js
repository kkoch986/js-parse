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

var constants       = require("../lib/parser/utils/constants");
var first_set       = require("../lib/parser/utils/first_set");
var START_SYMBOL    = constants.augmentation_symbol;
var EPSILON         = constants.epsilon;
var EOF             = constants.EOF_symbol;

describe("Parser - First Sets - ", function(){

	/**
	 * Taken from http://cs.gmu.edu/~white/CS540/Slides/Parsing/CS540-2-lecture3.pdf
	 * Example 1
	 **/
	it("should compute basic first sets (example 1)", function(){
		var parserDescription = {
			"symbols":{
				"a": { "terminal":true },
				"b": { "terminal":true },
				"c": { "terminal":true },
				"d": { "terminal":true },
				"e": { "terminal":true },
				"S": { "terminal":false },
				"B": { "terminal":false },
				"C": { "terminal":false }
			},
			"productions":{
				"S": [
					["a", "S", "e"],
					["B"]
				],
				"B":[
					["b", "B", "e"],
					["C"]
				],
				"C":[
					["c", "C", "e"],
					["d"]
				]
			},
			"startSymbols": [ "S" ]
		};

		var firstSets = first_set.computeFirstSetForGrammar(parserDescription);

		// First check the terminals
		firstSets["a"].should.eql(["a"]);
		firstSets["b"].should.eql(["b"]);
		firstSets["c"].should.eql(["c"]);
		firstSets["d"].should.eql(["d"]);
		firstSets["e"].should.eql(["e"]);

		// Now the non-terminals
		firstSets["S"].sort().should.eql(["a", "b", "c", "d"]);
		firstSets["B"].sort().should.eql(["b", "c", "d"]);
		firstSets["C"].sort().should.eql(["c", "d"]);
	});

	/**
	 * Taken from http://cs.gmu.edu/~white/CS540/Slides/Parsing/CS540-2-lecture3.pdf
	 * Example 2
	 **/
	it("should compute more advanced first sets which require transitive closure (example 2)", function(){
		var parserDescription = {
			"symbols":{
				"i": {"terminal":true},
				"c": {"terminal":true},
				"n": {"terminal":true},
				"b": {"terminal":true},
				"a": {"terminal":true},
				"d": {"terminal":true},
				"e": {"terminal":true},
				"n": {"terminal":true},
				"q": {"terminal":true},
				
				"P": {"terminal":false},
				"T": {"terminal":false},
				"S": {"terminal":false},
				"Q": {"terminal":false},
				"R": {"terminal":false}
			},
			"productions":{
				"P": [
					["i"],
					["c"],
					["n", "T", "S"]
				],
				"Q":[
					["P"],
					["a", "S"],
					["d", "S", "c", "S", "T"]
				],
				"R":[
					["b"],
					[]
				],
				"S":[
					["e"],
					["R", "n"],
					[]
				],
				"T":[
					["R", "S", "q"]
				]
			},
			"startSymbols": [ START_SYMBOL ]
		};
		parserDescription.symbols[START_SYMBOL] = {"terminal":false};
		parserDescription.productions[START_SYMBOL] = [ ["P"] ];

		var firstSets = first_set.computeFirstSetForGrammar(parserDescription);

		// First check the terminals
		firstSets["i"].should.eql(["i"]);
		firstSets["c"].should.eql(["c"]);
		firstSets["n"].should.eql(["n"]);
		firstSets["b"].should.eql(["b"]);
		firstSets["a"].should.eql(["a"]);
		firstSets["d"].should.eql(["d"]);
		firstSets["e"].should.eql(["e"]);
		firstSets["n"].should.eql(["n"]);
		firstSets["q"].should.eql(["q"]);

		// Now the non-terminals
		firstSets[START_SYMBOL].sort().should.eql(["c", "i", "n"]);
		firstSets["P"].sort().should.eql(["c", "i", "n"]);
		firstSets["Q"].sort().should.eql(["a", "c", "d", "i", "n"]);
		firstSets["R"].sort().should.eql([EPSILON, "b"]);
		firstSets["S"].sort().should.eql([EPSILON, "b", "e", "n"]);
		firstSets["T"].sort().should.eql([EPSILON, "b", "e", "n", "q"]);
	});
	
	/**
	 * Taken from http://cs.gmu.edu/~white/CS540/Slides/Parsing/CS540-2-lecture3.pdf
	 * Example 3
	 **/
	it("should compute first sets with epsilons (example 3)", function(){
		var parserDescription = {
			"symbols":{
				"a": {"terminal":true},
				"e": {"terminal":true},
				"r": {"terminal":true},
				
				"S": {"terminal":false},
				"T": {"terminal":false},
				"Q": {"terminal":false},
				"R": {"terminal":false}
			},
			"productions":{
				"S":[
					["a", "S", "a"],
					["S", "T", "S"]
				],
				"T":[
					["R", "S", "e"],
					["Q"]
				],
				"R":[
					["r", "S", "r"],
					[]
				],
				"Q":[
					["S", "T"],
					[]
				]
			},
			"startSymbols": [ "S" ]
		};

		var firstSets = first_set.computeFirstSetForGrammar(parserDescription);

		// First check the terminals
		firstSets["a"].should.eql(["a"]);
		firstSets["e"].should.eql(["e"]);
		firstSets["r"].should.eql(["r"]);

		// Now the non-terminals
		firstSets["S"].sort().should.eql(["a"]);
		firstSets["R"].sort().should.eql([EPSILON, "r"]);
		firstSets["T"].sort().should.eql([EPSILON, "a", "r"]);
		firstSets["Q"].sort().should.eql([EPSILON, "a"]);
	});

	/**
	 * Taken from http://cs.gmu.edu/~white/CS540/Slides/Parsing/CS540-2-lecture3.pdf
	 * Example 4
	 **/
	it("should compute first sets (example 4)", function(){
		var parserDescription = {
			"symbols":{
				"a": { "terminal":true },
				"b": { "terminal":true },
				"c": { "terminal":true },
				"d": { "terminal":true },
				"e": { "terminal":true },
				"f": { "terminal":true },
				"g": { "terminal":true },
				"S": { "terminal":false },
				"B": { "terminal":false },
				"C": { "terminal":false }
			},
			"productions":{
				"S": [
					["a", "S", "e"],
					["B"]
				],
				"B":[
					["b", "B", "C", "f"],
					["C"]
				],
				"C":[
					["c", "C", "g"],
					["d"],
					[]
				]
			},
			"startSymbols": [ "S" ]
		};

		var firstSets = first_set.computeFirstSetForGrammar(parserDescription);

		// First check the terminals
		firstSets["a"].should.eql(["a"]);
		firstSets["b"].should.eql(["b"]);
		firstSets["c"].should.eql(["c"]);
		firstSets["d"].should.eql(["d"]);
		firstSets["e"].should.eql(["e"]);
		firstSets["f"].should.eql(["f"]);
		firstSets["g"].should.eql(["g"]);

		// Now the non-terminals
		firstSets["S"].sort().should.eql([EPSILON, "a", "b", "c", "d"]);
		firstSets["B"].sort().should.eql([EPSILON, "b", "c", "d"]);
		firstSets["C"].sort().should.eql([EPSILON, "c", "d"]);
	});


	/**
	 * Taken from http://cs.gmu.edu/~white/CS540/Slides/Parsing/CS540-2-lecture3.pdf
	 * Example 5
	 * 
	 * NOTE: In the slides this example has the follow set mis-computed
	 * I have recomputed this one by hand, and that is why it doesnt exactly match the sldies.
	 **/
	it("should compute first sets (example 5)", function(){
		var parserDescription = {
			"symbols":{
				"a": { "terminal":true },
				"b": { "terminal":true },
				"c": { "terminal":true },
				"d": { "terminal":true },
				"e": { "terminal":true },
				"f": { "terminal":true },
				"S": { "terminal":false },
				"A": { "terminal":false },
				"B": { "terminal":false },
				"C": { "terminal":false },
				"D": { "terminal":false },
			},
			"productions":{
				"S": [
					["A", "B", "C"],
					["A", "D"]
				],
				"A":[
					[],
					["a", "A"]
				],
				"B":[
					["b"],
					["c"],
					[]
				],
				"C":[
					["D", "d", "C"]
				],
				"D":[
					["e", "b"],
					["f", "c"]
				]
			},
			"startSymbols": [ "S" ]
		};

		var firstSets = first_set.computeFirstSetForGrammar(parserDescription);

		// First check the terminals
		firstSets["a"].should.eql(["a"]);
		firstSets["b"].should.eql(["b"]);
		firstSets["c"].should.eql(["c"]);
		firstSets["d"].should.eql(["d"]);
		firstSets["e"].should.eql(["e"]);
		firstSets["f"].should.eql(["f"]);

		// Now the non-terminals
		firstSets["S"].sort().should.eql([EPSILON, "a", "b", "c", "e", "f"]);
		firstSets["A"].sort().should.eql([EPSILON, "a"]);
		firstSets["B"].sort().should.eql([EPSILON, "b", "c"]);
		firstSets["C"].sort().should.eql(["e", "f"]);
		firstSets["D"].sort().should.eql(["e", "f"]);
	});

	/**
	 * Taken from http://cs.gmu.edu/~white/CS540/Slides/Parsing/CS540-2-lecture3.pdf
	 * Example 6
	 **/
	it("should compute first sets (example 6)", function(){
		var parserDescription = {
			"symbols":{
				"(": { "terminal":true },
				")": { "terminal":true },
				"&": { "terminal":true },
				"a": { "terminal":true },
				"b": { "terminal":true },
				"c": { "terminal":true },
				"S": { "terminal":false },
				"A": { "terminal":false },
				"E": { "terminal":false },
				"T": { "terminal":false }
			},
			"productions":{
				"S": [
					["(", "A", ")"],
					[]
				],
				"A":[
					["T", "E"]
				],
				"E":[
					["&", "T", "E"],
					[]
				],
				"T":[
					["(", "A", ")"],
					["a"],
					["b"],
					["c"]
				]
			},
			"startSymbols": [ "S" ]
		};

		var firstSets = first_set.computeFirstSetForGrammar(parserDescription);

		// First check the terminals
		firstSets["a"].should.eql(["a"]);
		firstSets["b"].should.eql(["b"]);
		firstSets["c"].should.eql(["c"]);
		firstSets["("].should.eql(["("]);
		firstSets[")"].should.eql([")"]);
		firstSets["&"].should.eql(["&"]);

		// Now the non-terminals
		firstSets["S"].sort().should.eql(["(", EPSILON]);
		firstSets["A"].sort().should.eql(["(", "a", "b", "c"]);
		firstSets["E"].sort().should.eql(["&", EPSILON]);
		firstSets["T"].sort().should.eql(["(", "a", "b", "c"]);
	});


	/**
	 * Taken from http://cs.gmu.edu/~white/CS540/Slides/Parsing/CS540-2-lecture3.pdf
	 * Example 7
	 **/
	it("should compute first sets (example 7)", function(){
		var parserDescription = {
			"symbols":{
				"(": { "terminal":true },
				")": { "terminal":true },
				"*": { "terminal":true },
				"+": { "terminal":true },
				"id": { "terminal":true },
				"E": { "terminal":false },
				"E'": { "terminal":false },
				"T": { "terminal":false },
				"T'": { "terminal":false },
				"F": { "terminal":false }
			},
			"productions":{
				"E":[
					["T", "E'"]
				], 
				"E'":[
					["+", "T", "E'"],
					[]
				],
				"T":[
					["F", "T'"]
				],
				"T'":[
					["*","F","T'"],
					[]
				],
				"F":[
					["(", "E", ")"],
					["id"]
				]
			},
			"startSymbols": [ "E" ]
		};

		var firstSets = first_set.computeFirstSetForGrammar(parserDescription);

		// First check the terminals
		firstSets["("].should.eql(["("]);
		firstSets[")"].should.eql([")"]);
		firstSets["+"].should.eql(["+"]);
		firstSets["*"].should.eql(["*"]);
		firstSets["id"].should.eql(["id"]);

		// Now the non-terminals
		firstSets["F"].sort().should.eql(["(", "id"]);
		firstSets["T"].sort().should.eql(["(", "id"]);
		firstSets["E"].sort().should.eql(["(", "id"]);

		firstSets["T'"].sort().should.eql(["*", EPSILON]);
		firstSets["E'"].sort().should.eql([EPSILON, "+"]);
	});

});