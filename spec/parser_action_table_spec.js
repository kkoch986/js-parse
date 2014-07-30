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

return ;

var Parser = require("../lib/parser").LRParser;
var START_SYMBOL = Parser.LRParserPrototype.START_SYMBOL;
var EPSILON = Parser.LRParserPrototype.EPSILON;
var EOF = Parser.LRParserPrototype.EOF;


describe("Parser - Action Table - ", function(){

	/**
	 * Taken from http://cs.gmu.edu/~white/CS540/slr.pdf
	 * 	S->E
	 *	E->E+T|T
	 *	T->T*F|F
	 *	F->(E)|i
	 **/
	it("should compute a basic action table", function(){
		var parserDescription = {
			"symbols":{
				"id": { "terminal":true },
				"plus": { "terminal":true },
				"times": { "terminal":true },
				"lparen": { "terminal":true },
				"rparen": { "terminal":true }
			},
			"productions":{
				"E":[
					[ "E", "plus", "T" ],
					[ "T" ]
				],
				"T":[
					[ "T", "times", "F" ],
					[ "F" ]
				],
				"F":[
					[ "lparen", "E", "rparen" ],
					[ "id" ]
				]
			},
			"startSymbols": [ "E" ]
		};

		var parserDescription = Parser.factory(parserDescription).getParserDescription();
		var actionTable = parserDescription.actionTable;
		var desiredTable = [
			{ "lparen":["shift", 4], "id":["shift", 5], "E":["goto", 1], "T":["goto", 2], "F":["goto", 3]  },
			{ "plus":["shift", 6], EOF:["accept"] },
			{ "rparen":["reduce", 2], "times":["shift", 7], "plus":["reduce", 2], EOF:["reduce", 2] },
			{ "rparen":["reduce", 4], "times":["reduce", 4], "plus":["reduce", 4], EOF:["reduce", 4] },
			{ "lparen":["shift", 4], "id":["shift", 5], "E":["goto", 8], "T":["goto", 2], "F":["goto", 3] },
			{ "rparen":["reduce", 6], "times":["reduce", 6], "plus":["reduce", 6], EOF:["reduce", 6] },
			{ "lparen":["shift", 4], "id":["shift", 5], "T":["goto", 9], "F":["goto", 3] },
			{ "lparen":["shift", 4], "id":["shift", 5], "F":["goto", 10] },
			{ "rparen":["shift", 11], "plus":["shift", 6] },
			{ "rparen":["reduce", 1], "times":["shift", 7], "plus":["reduce", 1], EOF:["reduce", 1] },
			{ "rparen":["reduce", 3], "times":["reduce", 3], "plus":["reduce", 3], EOF:["reduce", 3] },
			{ "rparen":["reduce", 5], "times":["reduce", 5], "plus":["reduce", 5], EOF:["reduce", 5] }
		];

		validateActionTable(parserDescription.symbols, desiredTable, actionTable);
	});
	

	/**
	 * Taken from http://cs.gmu.edu/~white/CS540/Slides/Parsing/CS540-2-lecture3.pdf
	 * Example 1
	 *
	 * 	Z->S
	 *	S->aSe|B
	 *	B->bBe|C
	 *	C->cCe|d
	 **/
	it("should compute basic action tables (example 1)", function(){
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

		var parserDescription = Parser.factory(parserDescription).getParserDescription();
		var actionTable = parserDescription.actionTable;
		var desiredTable = [
			{ "a":["shift", 2], "b":["shift", 4], "c":["shift", 6], "d":["shift", 7], "S":["goto", 1], "B":["goto", 3], "C":["goto", 5] },
			{ EOF:["accept"] },
			{ "a":["shift", 2], "b":["shift", 4], "c":["shift", 6], "d":["shift", 7], "S":["goto", 8], "B":["goto", 3], "C":["goto", 5] },
			{ e:["reduce", 2], EOF:["reduce", 2] },
			{ "b":["shift", 4], "c":["shift", 6], "d":["shift", 7], "B":["goto", 9], "C":["goto", 5] },
			{ e:["reduce", 4], EOF:["reduce", 4] },
			{ "c":["shift", 6], "d":["shift",7], "C":["goto", 10] },
			{ e:["reduce", 6], EOF:["reduce", 6] },
			{ "e":["shift", 11] },
			{ "e":["shift", 12] },
			{ "e":["shift", 13] },
			{ e:["reduce", 1], EOF:["reduce", 1] },
			{ e:["reduce", 3], EOF:["reduce", 3] },
			{ e:["reduce", 5], EOF:["reduce", 5] }
		];

		validateActionTable(parserDescription.symbols, desiredTable, actionTable);
	});








	/**
	 * A function to compare the desired table to the actual, see examples above for formatting.
	 **/
	function validateActionTable(allSymbols, desiredTable, actionTable) {
		var symbols = {};
		for(var s in allSymbols) {
			symbols[s] = {};
		}
		symbols[EOF] = {};

		// First make sure the number of states exactly matches
		desiredTable.length.should.eql(actionTable.length, "Tables have different number of states (expected "+desiredTable.length+", got "+actionTable.length+").");

		// Now loop over each state and check everything out.
		for(var row in desiredTable) {

			// Quick fix for the string "EOF" in the test case should be the value of the variable EOF
			if(desiredTable[row]["EOF"]) {
				desiredTable[row][EOF] = desiredTable[row]["EOF"];
				desiredTable[row]["EOF"] = null;
			}

			// loop over each symbol and make sure its correct
			for(var symbol in symbols) {
				if(desiredTable[row][symbol]) {
					var desired = desiredTable[row][symbol];

					// check that the record exists
					(!actionTable[row][symbol]).should.not.eql(true, "Symbol " + symbol + " should exist in row " + row);

					// check that the action matches
					actionTable[row][symbol].operation.should.eql(desired[0], "Row " + row + " should depict action '"+desired[0]+"' for symbol " + symbol + " (depicted " + actionTable[row][symbol].operation + ")");

					// Check that the state matches, if its not accept.
					if(desired[0] !== "accept") {
						actionTable[row][symbol].state.should.eql(desired[1], "Row " + row + " should depict state '"+desired[1]+"' for symbol " + symbol + " (depicted "+actionTable[row][symbol].state+")");
					}

				} else {
					// symbol should not exist
					(!actionTable[row][symbol]).should.eql(true, "Symbol " + symbol + ", should not exist in row " + row);
				}
			}
		}
	}
});