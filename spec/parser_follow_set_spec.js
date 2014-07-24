
var Parser = require("../lib/parser").LRParser;
var START_SYMBOL = Parser.LRParserPrototype.START_SYMBOL;
var EPSILON = Parser.LRParserPrototype.EPSILON;
var EOF = Parser.LRParserPrototype.EOF;

describe("Parser - Follow Sets - ", function(){

	/**
	 * Taken from http://cs.gmu.edu/~white/CS540/Slides/Parsing/CS540-2-lecture3.pdf
	 * Example 1
	 **/
	it("should compute basic follow sets (example 1)", function(){
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

		var followSets = Parser.factory(parserDescription).getParserDescription().followSets;

		// First check the terminals
		followSets["a"].should.eql([]);
		followSets["b"].should.eql([]);
		followSets["c"].should.eql([]);
		followSets["d"].should.eql([]);
		followSets["e"].should.eql([]);

		// Now the non-terminals
		followSets[START_SYMBOL].sort().should.eql([EOF]);
		followSets["S"].sort().should.eql([EOF, "e"]);
		followSets["B"].sort().should.eql([EOF, "e"]);
		followSets["C"].sort().should.eql([EOF, "e"]);
	});

	/**
	 * Taken from http://cs.gmu.edu/~white/CS540/Slides/Parsing/CS540-2-lecture3.pdf
	 * Example 2
	 **/
	it("should compute more advanced follow sets which require transitive closure (example 2)", function(){
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
			"startSymbols": [ "P" ]
		};

		var followSets = Parser.factory(parserDescription).getParserDescription().followSets;

		// First check the terminals
		followSets["i"].should.eql([]);
		followSets["c"].should.eql([]);
		followSets["n"].should.eql([]);
		followSets["b"].should.eql([]);
		followSets["a"].should.eql([]);
		followSets["d"].should.eql([]);
		followSets["e"].should.eql([]);
		followSets["n"].should.eql([]);
		followSets["q"].should.eql([]);

		// Now the non-terminals
		followSets[START_SYMBOL].sort().should.eql([EOF]);
		followSets["P"].sort().should.eql([EOF]);
		followSets["Q"].sort().should.eql([]);
		followSets["R"].sort().should.eql(["b","e","n","q"]);
		followSets["S"].sort().should.eql([EOF, "b", "c", "e", "n", "q"]);
		followSets["T"].sort().should.eql([EOF, "b", "e", "n"]); // fails
	});

	/**
	 * Taken from http://cs.gmu.edu/~white/CS540/Slides/Parsing/CS540-2-lecture3.pdf
	 * Example 4
	 **/
	it("should compute follow sets (example 4)", function(){
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

		var followSets = Parser.factory(parserDescription).getParserDescription().followSets;

		// First check the terminals
		followSets["a"].should.eql([]);
		followSets["b"].should.eql([]);
		followSets["c"].should.eql([]);
		followSets["d"].should.eql([]);
		followSets["e"].should.eql([]);
		followSets["f"].should.eql([]);
		followSets["g"].should.eql([]);

		// Now the non-terminals
		followSets[START_SYMBOL].sort().should.eql([EOF]);
		followSets["S"].sort().should.eql([EOF, "e"]);
		followSets["B"].sort().should.eql([EOF, "c", "d", "e", "f"]);
		followSets["C"].sort().should.eql([EOF, "c", "d", "e", "f", "g"]);
	});

	/**
	 * Taken from http://cs.gmu.edu/~white/CS540/Slides/Parsing/CS540-2-lecture3.pdf
	 * Example 5
	 **/
	it("should compute follow sets (example 5)", function(){
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

		var followSets = Parser.factory(parserDescription).getParserDescription().followSets;

		// First check the terminals
		followSets["a"].should.eql([]);
		followSets["b"].should.eql([]);
		followSets["c"].should.eql([]);
		followSets["d"].should.eql([]);
		followSets["e"].should.eql([]);
		followSets["f"].should.eql([]);

		// Now the non-terminals
		followSets[START_SYMBOL].sort().should.eql([EOF]);
		followSets["S"].sort().should.eql([EOF]);
		followSets["A"].sort().should.eql(["b", "c", "e", "f"]);
		followSets["B"].sort().should.eql(["e", "f"]);
		followSets["C"].sort().should.eql([EOF]);
		followSets["D"].sort().should.eql([EOF, "d"]);
	});

	/**
	 * Taken from http://cs.gmu.edu/~white/CS540/Slides/Parsing/CS540-2-lecture3.pdf
	 * Example 5
	 **/
	it("should compute follow sets (example 6)", function(){
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

		var followSets = Parser.factory(parserDescription).getParserDescription().followSets;

		// First check the terminals
		followSets["a"].should.eql([]);
		followSets["b"].should.eql([]);
		followSets["c"].should.eql([]);
		followSets["("].should.eql([]);
		followSets[")"].should.eql([]);
		followSets["&"].should.eql([]);

		// Now the non-terminals
		followSets[START_SYMBOL].sort().should.eql([EOF]);
		followSets["S"].sort().should.eql([EOF]);
		followSets["A"].sort().should.eql([")"]);
		followSets["E"].sort().should.eql([")"]);
		followSets["T"].sort().should.eql(["&", ")"]);
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

		var followSets = Parser.factory(parserDescription).getParserDescription().followSets;
		
		// First check the terminals
		followSets["("].should.eql([]);
		followSets[")"].should.eql([]);
		followSets["*"].should.eql([]);
		followSets["+"].should.eql([]);
		followSets["id"].should.eql([]);
		
		followSets[START_SYMBOL].sort().should.eql([EOF]);
		followSets["E"].sort().should.eql([")", EOF]);
		followSets["E'"].sort().should.eql([")", EOF]);

		followSets["T"].sort().should.eql([")", EOF, "+"]);
		followSets["T'"].sort().should.eql([")", EOF, "+"]);

		followSets["F"].sort().should.eql([")", "*", EOF, "+"]);
		
	});
});