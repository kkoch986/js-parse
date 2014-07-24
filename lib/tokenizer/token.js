
/**
 * Generic Token Prototype.
 **/
var TokenPrototype = { 
	/**
	 * The Token.consume function should examine the given tokenizer to see if it can make a token out of it.
	 * If it is able, it should alert the tokenizer to shift by the correct number of characters and return an
	 * instance of itself.
	 **/
	"consume":function(){ throw "Generic Token Consume not overwritten."; },

	/**
	 * Define some utility functions for tokens.
	 **/
	"isNumeric":function(char) { return (char >= '0' && char <= '9'); },
	"isAlphaNum":function(char) { 
		return this.isNumeric(char) || 
			(char >= 'a' && char <= 'z') || 
			(char >= 'A' && char <= 'Z'); 
	},
	"type": "Token",
	"getType": function() { return this.type; },
	"terminal":true,

	/**
	 * Pretty printing.
	 **/
	"toString": function() {
		return this.getType();
	},
	"inspect": function() { return this.toString(); }
};

/**
 * Basic Consumption token, the consume method here will repeatedly apply a function until it returns false.
 * At that point, if it moved at least one character it will return true.
 **/
var GenericConsumptionToken = Object.create(TokenPrototype);
GenericConsumptionToken.consume = function(tokenizer) { throw "GenericConsumptionToken cannot consume directly."; };
GenericConsumptionToken.consumeWithFunction = function(tokenizer, callback) {
	var remaining = tokenizer.getStream();
	var length = remaining.length;
	var end = -1;
	while(end < length && callback.call(this, ++end, remaining)) { }

	// Check if we matched any characters at all
	if(end < 0) {
		return false;
	} else {
		return end;
	}
};
GenericConsumptionToken.type = "GenericConsumptionToken";

/**
 * Exports.
 **/
module.exports.TokenPrototype 			= TokenPrototype;
module.exports.NumberTokenPrototype     = require("./tokens/number_token")(GenericConsumptionToken);
module.exports.AtomTokenPrototype       = require("./tokens/atom_token")(GenericConsumptionToken);
module.exports.StringTokenPrototype     = require("./tokens/string_token")(GenericConsumptionToken);
module.exports.WordTokenPrototype     	= require("./tokens/word_token")(GenericConsumptionToken);
module.exports.NonTerminalPrototype   	= require("./tokens/non_terminal")(GenericConsumptionToken);

// Some prolog specific tokens
module.exports.prolog = {};
module.exports.prolog.PrologVariableTokenPrototype = require("./tokens/prolog/variable_token")(GenericConsumptionToken);
module.exports.prolog.PrologSymbolTokenPrototype = require("./tokens/prolog/symbol_token")(GenericConsumptionToken);
