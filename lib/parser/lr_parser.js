/**
 * LR_Parser.js
 * Please note, this file is the results of my trying to implement algorithms and learn about them
 * the code here will be the subject of much refactoring and adjusting as time goes on...
 **/
var events = require('events');

var augmentation_symbol     = "***";
var EOF_symbol              = "*$*";
var epsilon                 = "*e*";
console.debug = console.log;
console.debug = function(){};

/**
 * Parser Prototype
 **/
var LRParserPrototype = Object.create(events.EventEmitter.prototype);
LRParserPrototype.shift = shift;
LRParserPrototype.end = function() { return this.shift(EOF_symbol); };

// For parsing
LRParserPrototype.stack = [0];
LRParserPrototype.token_stack = [];
	
// Symbol constants
LRParserPrototype.EOF = EOF_symbol;
LRParserPrototype.EPSILON = epsilon;
LRParserPrototype.START_SYMBOL = augmentation_symbol;

/**
 * LRParser Factory.
 * The main work is done here to construct an LR parse table from the parserDescription object.
 **/
function CreateLRParser(parserDescription) {
	var parser = Object.create(LRParserPrototype);
	
	// Add all of the non-terminals to the symbols table
	for(var s in parserDescription.productions) {
		if(!parserDescription.symbols[s]) {
			parserDescription.symbols[s] = { "terminal": false };
		}
	}

	// Create an augmentation symbol (***), this is a single symbol which
	// is prodced by only start symbols in the grammar
	var products = [];
	for(var s in parserDescription.startSymbols) {
		products.push([ parserDescription.startSymbols[s] ]);
	}
	parserDescription.productions[augmentation_symbol] = products;
	parserDescription.symbols[augmentation_symbol] = {"terminal":false};
	parserDescription.startSymbols = [augmentation_symbol];

	// Number the productions in the parserDescription
	parserDescription.numberedProductions = [];

	// make sure the augmentation symbol is first
	for(var j in parserDescription.productions[augmentation_symbol]) {
		parserDescription.numberedProductions.push({ "head":augmentation_symbol, "body":parserDescription.productions[augmentation_symbol][j] });
	}

	for(var i in parserDescription.productions) {
		if(i === augmentation_symbol) {
			continue ;
		}
		for(var j in parserDescription.productions[i]) {
			parserDescription.numberedProductions.push( { "head":i ,"body":parserDescription.productions[i][j] });
		}
	}

	console.debug("Numbered Productions: ");
	for(var i in parserDescription.numberedProductions) {
		console.debug(i, parserDescription.numberedProductions[i]);
	}

	// Compute the FIRST sets.
	parserDescription.firstSets = computeFirstSetForGrammar(parserDescription);

	// Compute FOLLOW sets.
	parserDescription.followSets = computeFollowSetForGrammar(parserDescription);
	
	// Compute C, the inital closure
	// We want to build closure items of the form: ` *** -> . E `
	// for all products of the augmentation_symbol
	var cSet = [];
	for(var p in products) {
		cSet.push({ "head":augmentation_symbol, "body":products[p], dotPosition:0 });
	}
	parserDescription.closures = compute_closure(parserDescription, cSet);

	// Now that we have C, the initial state, push it into the states array
	var states = [ { "clauses":parserDescription.closures, "transitions":{} } ];

	// Compute the DFA
	// TODO: Unit tests for DFA calculation
	parserDescription.dfa = processStates(parserDescription, states);
	console.debug("\nFinal DFA:");
	for(var d in parserDescription.dfa) {
		console.debug(d + ": ");
		console.debug("transitions: ", parserDescription.dfa[d].transitions);
		console.debug("clauses: ");
		for(var cl in parserDescription.dfa[d].clauses) {
			console.debug(printClosureRecord(parserDescription.dfa[d].clauses[cl]));
		}
		console.debug("\n");
	}

	// Compute Action and GOTO tables for each state.
	// TODO: Unit tests for action table
	var table = [];
	for(var s in parserDescription.dfa) {
		table[s] = buildParseTable(parserDescription, parserDescription.dfa[s]);
	}
	parserDescription.actionTable = table;

	for(var t in table) {
		console.debug(t, table[t]);
	}

	parser.getParserDescription = function(){ return parserDescription; };

	// Return the new parser.
	return parser;
}

/**
 * Build an Action table for the given state.
 **/
function buildParseTable(parserDescription, state) {
	// Loop over the transitions and start building the parse table.
	var table_entry = { }
	for(var t in state.transitions) {
		if(parserDescription.symbols[t].terminal) {
			if(table_entry[t]) {
				var type = table_entry[t].operation + "-shift";
				throw type + " Conflict for symbol " + t + " in state: " + state;
			}
			// Generate an ACTION record
			table_entry[t] = {"operation":"shift", "state":state.transitions[t]};
		} else {
			// Generate a GOTO record
			table_entry[t] = {"operation":"goto", "state":state.transitions[t]};
		}
	}

	// Now check for REDUCE records
	// Loop over the clauses and find ones where the dot is at the end.
	for(var c in state.clauses) {
		var clause = state.clauses[c];
		if(clause.dotPosition === clause.body.length) {
			// Now get the follow set for the head of the clause
			var productionIndex = getProductionIndex(parserDescription, clause);
			for(var f in parserDescription.followSets[clause.head]) {
				var symbol = parserDescription.followSets[clause.head][f];
				// Check for ACCEPT records
				if(clause.head === augmentation_symbol && symbol === EOF_symbol) {
					table_entry[symbol] = {"operation":"accept", "state":null};
				} else {
					if(table_entry[symbol]) {
						var type = table_entry[symbol].operation + "-reduce";
						throw type + " Conflict for symbol " + symbol + " in production " + clause.head;
					}
					table_entry[symbol] = {"operation":"reduce", "state":productionIndex};
				}
			}
		}
	}

	return table_entry;
}

/**
 * Figure out the production number for the given clause.
 * A clause should be an object of the form { "head": <symbol>, "body":[ <body symbols> ]}
 **/
function getProductionIndex(parserDescription, clause) {
	for(var i in parserDescription.numberedProductions) {
		var production = parserDescription.numberedProductions[i];
		if(production.head === clause.head && production.body === clause.body) {
			return i;
		}
	}
	throw "Clause not found.";
}


/**
 * Compute the FOLLOWING sets for the given parser.
 **/
function computeFollowSetForGrammar(parserDescription) {
	var follows = {};

	// Enforce first set calculation
	if(!parserDescription.firstSets) {
		parserDescription.firstSets = computeFirstSetForGrammar(parserDescription);
	}

	// Start all of the follows as blank
	for(var s in parserDescription.symbols) {
		follows[s] = {};
	}

	// Automatically add EOF to the start symbols follow set.
	for(var s in parserDescription.startSymbols) {
		follows[parserDescription.startSymbols[s]] = {  };
		follows[parserDescription.startSymbols[s]][EOF_symbol] = 1;
	}

	// Loop over each production for the grammar and try to fill the follow sets
	// Also fills the constraints array which is as follows:
	// { C: [D,E,F] } Means that everything in the follow set of C should be added to the follow sets 
	// of D E and F.
	var constraints = [];
	for(var symbol in parserDescription.productions) {
		var productions = parserDescription.productions[symbol];

		// Loop over each production for this symbol.
		for(var i in productions) {
			var production = productions[i];

			// Loop over each symbol in the RHS of the production
			for(var s = 0 ; s < production.length ; s++) {
				var followSymbol = production[s];
				if(parserDescription.symbols[production[s]].terminal === false) {
					// This is a non-terminal, now we have a few considerations to make
					// 1. If the next symbol is a terminal, add it to the follow set for this symbol
					// 2. If the next symbol (B) is a non-terminal, 
					// 		a. Add FIRST(B) to the follow set
					//	 	b. if this symbol can evaluate to epislon, look at the next symbol for the same considerations.
					// 3. If this symbol is the last symbol in the production, create a constraint, everything in the follow set 
					//		for this symbol should be in the follow set for the LHS of this production.

					// This is not the last symbol
					if(s < production.length - 1) {
						// Check if the next symbol is a terminal, if so, just add it to the follow set.
						if(parserDescription.symbols[production[s+1]].terminal && production[s+1] !== epsilon) {
							follows[followSymbol][production[s+1]] = 1;
						} else {
							// If the next symbol is a non-terminal we need to do 2 things
							// 1. Add FIRST of the next symbol to FOLLOW for this symbol
							for(var f in parserDescription.firstSets[production[s+1]]) {
								var fs = parserDescription.firstSets[production[s+1]][f];
								if(fs !== epsilon) {
									follows[followSymbol][parserDescription.firstSets[production[s+1]][f]] = 1;
								}
							}

							// 2. Check if the non-terminal can evaluate to epsilon
							// Need recursion here...
							// TODO: Refactor this to bring the recusion out and eliminate duplicate code.
							var testingPosition = s+1;
							if(canEvaluateToEpsilon(parserDescription, production[testingPosition])) {
								nextStep();
							}
							function nextStep() {

								// We're at the end of the production, this means we need 
								// to create some constraints.
								// TODO: This may not be 100% accurate,
								// Consider the case of A -> T F E where F and E both reduce to epsilon
								// I believe a constraint should be created for A:T and A:F and A:E where in 
								// this code you would probably only get A:F and A:E
								if(testingPosition === production.length - 1 && parserDescription.symbols[production[testingPosition]].terminal === false) {
									if(!constraints[symbol]) {
										constraints[symbol] = [];
									}

									constraints[symbol].push(followSymbol);
									return ;
								}

								var testingSymbol = production[++testingPosition];
								if(!testingSymbol) {
									return ;
								}
								
								// If its a terminal, we're done. Just add this to the follow set for the original followSymbol
								if(parserDescription.symbols[testingSymbol].terminal === true) {
									follows[followSymbol][testingSymbol] = 1;
								}

								// check if the testing position can evaluate to epsilon
								if(testingPosition >= production.length || (canEvaluateToEpsilon(parserDescription, production[testingPosition]) === false) ) {
									return ;
								}

								// At this point, we can assume that production[testingPosition] can evaluate to epsilon
								nextStep();
							}
						}

					} else {
						// This is the last symbol in this production, we need to create a constraint as per #3 above.
						if(!constraints[symbol]) {
							constraints[symbol] = [];
						}

						constraints[symbol].push(followSymbol);
					}
				}
			}
		}
	}

	// Process the constraints
	var changed = false;
	do {
		changed = false;
		for(var mainSymbol in constraints) {
			// Add each symbol in the follow set for MainSymbol to the follow set for the child symbols
			for(var followItem in follows[mainSymbol]) {
				for(var childSymbol in constraints[mainSymbol]) {
					childSymbol = constraints[mainSymbol][childSymbol];
					if(follows[childSymbol][followItem] !== 1) {
						follows[childSymbol][followItem] = 1;
						changed = true;
					}
				}
			}
		}
	} while (changed);

	// Conver the hash map to an array
	var ret = {};
	for(var s in follows) {
		ret[s] = [];
		for(var p in follows[s]) {
			ret[s].push(p);
		}
	}
	return ret;
}

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
					symbolsToAdd.push(epsilon);
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
					if(!firsts[production[i]][epsilon]) {
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

/**
 * Recusively determine if the given symbol can be evaluated to an empty production
 * This is used when computing the FOLLOW sets.
 **/
function canEvaluateToEpsilon(parserDescription, symbol, dontCheck) {
	if(typeof dontCheck === "undefined") {
		dontCheck = [];
	} 

	// Check the productions on this symbol.
	// If we find one that is epsilon, then we're done
	for(var p in parserDescription.productions[symbol]) {
		if(parserDescription.productions[symbol][p].length === 0) {
			return true;
		}
	}

	// If we didn't find one directly above, look for productions with only non-terminals
	for(var p in parserDescription.productions[symbol]) {
		var production = parserDescription.productions[symbol][p];

		var foundTerminal = false;
		for(var s in production) {
			if(parserDescription.symbols[production[s]].terminal === true) {
				foundTerminal = true;
				break ;
			}
		}
		if(foundTerminal) {
			continue ;
		}

		// Now we know there are no terminals in this production, 
		// we need each symbol to be able to evaluate to epsilon in order to return true.
		var ok = true;
		for(var s in production) { 
			if(dontCheck.indexOf(production[s]) < 0) {
				ok = ok && canEvaluateToEpsilon(parserDescription, production[s], dontCheck.concat([symbol]));
			} else {
				ok = false;
			}
			if(ok === false) {
				break ;
			}
		}

		if(ok === true) {
			return true;
		}
	}

	return false;
}

/**
 * Recursively process states until there are none left...
 * This is used for constructing the parsers DFA.
 **/
function processStates(parserDescription, states, current_position) {
	if(typeof current_position === "undefined") {
		current_position = 0; 
	}

	if(current_position >= states.length) {
		return states;
	}

	// Loop over the symbols we care about in this state and push new states
	// onto the DFA accordingly
	var importantSymbols = findImportantSymbolsInClosure(states[current_position].clauses);

	// Loop over each symbol and create the next states by incrementing the dot position
	for(var symbol in importantSymbols) {
		var clauses = importantSymbols[symbol];

		var newClauses = [];
		for(var c in clauses) {
			var clause = clauses[c];
			if(clause.dotPosition + 1 > clause.body.length) {
				continue ;
			}
			newClauses.push({ "head":clause.head, "body":clause.body, "dotPosition":clause.dotPosition+1 });
		}

		if(newClauses.length > 0) {
			// Check if the next state already exists,
			var newClosure = compute_closure(parserDescription, newClauses);
			var nextState = states.length + "";
			var existingState = stateExistsForClauses(states, newClosure);
			if(existingState >= 0) {
				nextState = existingState;
			} else {
				// if we dont find a match, push on a new state
				states.push( {"clauses": newClosure, "transitions":{} } );	
			}

			// Now mark the GOTO record for this symbol
			states[current_position].transitions[symbol] = nextState;
		}
	}

	return processStates(parserDescription, states, current_position+1);
}

/**
 * A function to compute the closure of a production
 *
 * items should contain an array of objects with the form:
 * { "head": <the head symbol>, "body": <the body symbols array>, "dotPosition":<0 based indeex for placement of the focus dot> }
 **/
function compute_closure(parserDescription, items) {
	var addedSomething = false;
	var newClosure = items.slice();
	for(var i in items) {
		var item = items[i];
		var dotPosition = item.dotPosition;
		var body = item.body;
		var head = item.head;

		if(dotPosition > body.length) {
			throw "Dot Position out of range.";
		}
		// console.debug("closure", printClosureRecord(item));

		// Check the position immediately to the right of the dot.
		if(body.length > dotPosition) {
			var checkSymbol = body[dotPosition];
			if(parserDescription.symbols[checkSymbol].terminal === false) {
				// Need to expand, loop over all products and add H -> (*) y if it doesnt already exist
				var productions = parserDescription.productions[checkSymbol];
				for(var production in productions) {
					var record = { "head":checkSymbol, "body":productions[production], "dotPosition":0 };
					if(!LRItemInArray(newClosure, record)) {
						addedSomething = true;
						newClosure.push(record);
					}
				}
			}
		}
	}

	if(addedSomething === true) {
		return compute_closure(parserDescription, newClosure);
	} else {
		return newClosure;
	}
}

/**
 * Function to extract the symbols we might care about in a closure result.
 * The idea here is to return all symbols who have a (*) in front of them.
 *
 * The response will be sent as an object mapping <symbol>:[ <relevant closure results> ]
 * This will make it easy to generate the DFA states in the next step of parser construction.
 **/
function findImportantSymbolsInClosure(closure_results) {
	var symbols = {};

	// Loop over the closure results
	for(var i in closure_results) {
		var symbol = closure_results[i].body[closure_results[i].dotPosition];
		if(!symbols[symbol]) {
			symbols[symbol] = [];
		}

		symbols[symbol].push(closure_results[i]);
	}

	// return the results
	return symbols;
}


/**
 * Checks if there is a state in the provided array which matches the exact set of clauses provided.
 * If one is found, returns the state index. Otherwise returns -1
 **/
function stateExistsForClauses(states, clauses) {
	for(var s in states) {
		var state = states[s];
		var matches = 0;

		for(var c in clauses) {
			var clause = clauses[c];

			if(LRItemInArray(state.clauses, clause)) {
				matches++;
			}
		}

		if(matches === clauses.length) {
			return s;
		}
	}

	return -1;
}

/**
 * Function to return true if the given LR(0) item triple is in the given array
 **/
function LRItemInArray(array, lr_item) {
	for(var a in array) {
		var obj = array[a];

		// Check that the head and dot position match
		if(obj.head === lr_item.head && obj.dotPosition === lr_item.dotPosition) {
			// Now compare the body items
			var allMatched = true;
			for(var b in obj.body) {
				if(obj.body[b] !== lr_item.body[b]) {
					allMatched = false;
				}
			}

			if(allMatched) {
				return true;
			}
		}
	}
	return false;
}

/**
 * Pretty print for LR(0) production items.
 **/
function printClosureRecord(item) {
	return item.head + " --> " + item.body.slice(0, item.dotPosition) + " (*) " + item.body.slice(item.dotPosition);
}

/**
 * Accept the next token.
 **/
function shift(token) {
	var type = token.type ? token.type : token;
	var current_state = this.stack[this.stack.length - 1];

	// check the action table for the given type.
	var action = this.getParserDescription().actionTable[current_state][type];

	if(!action) {
		if(token === EOF_symbol) {
			throw "Parse error at end of file.";
		} else {
			throw "Parse error near '" + token.value + "'";
		}
	}

	if(action.operation === "shift") {
		console.debug("[Parser]["+current_state+"] Shift: ", token.type);
		// move to the next state and accept the next token.
		this.stack.push(action.state);
		this.token_stack.push(token);

	} else if(action.operation === "reduce") {

		console.debug("[Parser]["+current_state+"] Reduce: ", action);

		// Figure out the production and pop that many elements off the token stack.
		var production = this.getParserDescription().numberedProductions[action.state];
		
		// take the next state which is the token.
		var params = [];
		for(var i in production.body) {
			this.stack.pop();

			var tok = this.token_stack.pop();
			if(!this.getParserDescription().symbols[tok.value] || this.getParserDescription().symbols[tok.value].excludeFromProduction !== true) {
				params.unshift(tok);
			}
		}

		if(production.body.length === 0) {
			this.stack.pop();
		}

		this.token_stack.push({"head":production.head, "body":params});
		this.emit(production.head, params);
		
		// Figure out the next state.
		var state = this.stack[this.stack.length - 1];
		var next_state = this.getParserDescription().actionTable[state][production.head].state;

		console.debug("[Parser] reduce to ", production, " move to ", next_state, this.token_stack);
		this.stack.push(next_state);

		// Check the token again
		this.shift(token);

	} else if(action.operation === "accept") {
		console.debug("[Parser]["+current_state+"] Accept: ", token);
		this.stack.pop();
		this.emit("accept", this.token_stack);
	} else {
		throw "Unknown action: " . action.operation;		
	}
}

/**
 * Export only the factory function.
 **/
module.exports.LRParserPrototype = LRParserPrototype;
module.exports.Create = CreateLRParser;