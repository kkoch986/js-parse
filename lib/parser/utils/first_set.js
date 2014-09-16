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
var constants = require("./constants");

/**
 * Compute the FIRST function for the given parser.
 *
 * NOTE: The following algorithm is rather inefficient and i would like to
 * 			swap it out for something better eventually...
 *
 * 	Compute obvious initializing sets of FIRST(A) for all nonterminals A.
 *	REPEAT
 *	        Find all dependencies in the grammar where some set FIRST(A)
 *	        must obviously contain some set FIRST(B) for some nonterminals A
 *	        and B, and (re-)compute FIRST(A) := FIRST(A) + FIRST(B).
 *	UNTIL, during a complete grammar examination, none of the set unions
 *	        computed has added any new elements
 **/
function computeFirstSetForGrammar(parserDescription) {
	var firsts = {};

	// Loop over the terminals first and get them done
	var symbols = parserDescription.symbols;
	var non_terminals = [];
	for(var s in symbols) {
		firsts[s] = {};
		if(symbols[s].terminal) {
			firsts[s][s] = 1;
		} else {
			non_terminals.push(s);
		}
	}

	var changed = false;
	do {
		changed = false;

		// Loop over the non-terminals
		for(var nt in non_terminals) {
			var checkingSymbol = non_terminals[nt];

			// Look at the productions
			var productions = parserDescription.productions[checkingSymbol];
			var symbolsToAdd = [];
			for(var p in productions) {
				var production = productions[p];

				// Check for the epsilon production (denoted by []).
				if(production.length === 0) {
					symbolsToAdd.push(constants.epsilon);
					continue;
				}

				// Figure out what symbols should be added to the set,
				// Later we will check if any of these symbols dont already exist
				// and use that to determine if we've reached a fixed point.
				var symbolsContained = [];
				// This loop is a little complicated, basically if we check [0] and its nullable,
				// We need to check [1], if thats nullable, [2], etc....
				var notNullableFound = false;
				var i = 0;
				while(!notNullableFound && i < production.length) {
					if(typeof firsts[production[i]] === "undefined") {
						console.log("ASDFASDFASDF", production[i]);
						throw "Symbol " + production[i] + " not found.";
					}
					if(!firsts[production[i]][constants.epsilon]) {
						notNullableFound = true;
					}

					for(var s in firsts[production[i]]) {
						symbolsContained.push(s);
					}
					symbolsToAdd = symbolsToAdd.concat(symbolsContained);

					i++;
				}
			}

			// Now loop over the symbols to add and decide if we need to add any
			for(var s in symbolsToAdd) {
				var testSymbol = symbolsToAdd[s];
				var currentFirsts = firsts[checkingSymbol];

				if(currentFirsts[testSymbol] !== 1) {
					firsts[checkingSymbol][testSymbol] = 1;
					changed = true;
				}
			}
		}

	} while(changed);

	// Convert the firsts to an array.
	var firstsConverted = {};
	for(var symbol in firsts) {
		firstsConverted[symbol] = [];
		for(var f in firsts[symbol]) {
			firstsConverted[symbol].push(f);
		}
	}
	return firstsConverted;
}

module.exports.computeFirstSetForGrammar = computeFirstSetForGrammar;
