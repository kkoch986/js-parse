
module.exports = function(GenericConsumptionToken){
	/**
	 * Basic WORD token.
	 * 
	 * Has 1 property, its type will be whatever word it captured
	 **/
	var WordTokenPrototype = Object.create(GenericConsumptionToken);

	/** 
	 * Factory for a new AtomToken.
	 **/
	WordTokenPrototype.create = function(value){
		var tok = Object.create(WordTokenPrototype);
		tok.value = value;
		tok.type = value;
		return tok;
	};

	/**
	 * Override the GenericToken consume function.
	 **/
	WordTokenPrototype.consume = function(tokenizer) {
		var end = this.consumeWithFunction(tokenizer, function(end, remaining){
			if(end === 0) {
				// Dont confuse a number for an atom, if the first character is a digit, it HAS to be number.
				return this.isAlphaNum(remaining[end]) && !this.isNumeric(remaining[end]);
			}
			return this.isAlphaNum(remaining[end]);
		});

		if(end > 0) {
			var ss = tokenizer.getStream().substring(0, end);
			var token = WordTokenPrototype.create(ss);
			tokenizer.shift(end);
			return token;
		}

		return false;
	};

	/**
	 * Pretty Printing.
	 **/
	WordTokenPrototype.toString = function() {
		return this.value;
	};

	return WordTokenPrototype;
};