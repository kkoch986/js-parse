
module.exports = function(GenericConsumptionToken){
	/**
	 * Prolog Symbol Token.
	 * 
	 * Has 1 properties:
	 *  - value = the actual value extracted for this token.
	 **/
	var PrologSymbolToken = Object.create(GenericConsumptionToken);

	/**
	 * Valid Prolog symbols.
	 **/
	var valid_symbols = [ '(', ')', '.', ',', '[', ']', '!', ':', ':-', '\\+', '\\', '+', '*', '-', '/' ];

	/** 
	 * Factory for a new AtomToken.
	 **/
	PrologSymbolToken.create = function(value){
		var tok = Object.create(PrologSymbolToken);
		tok.value = value;
		return tok;
	};
	PrologSymbolToken.type = "PrologSymbolToken";

	/**
	 * Override the GenericToken consume function.
	 **/
	PrologSymbolToken.consume = function(tokenizer) {
		var end = this.consumeWithFunction(tokenizer, function(end, remaining){
			return valid_symbols.indexOf(remaining.substring(0, end+1)) >= 0;
		});

		if(end > 0) {
			var ss = tokenizer.getStream().substring(0, end);
			var token = PrologSymbolToken.create(ss);
			tokenizer.shift(end);
			return token;
		}

		return false;
	};

	/**
	 * Pretty Printing.
	 **/
	PrologSymbolToken.toString = function() {
		return "SymbolToken(" + this.value + ")";
	};

	return PrologSymbolToken;
};