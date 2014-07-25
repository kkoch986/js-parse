
module.exports = function(GenericConsumptionToken){
	/**
	 * Basic ATOM token.
	 * 
	 * Has 1 properties:
	 *  - value = the actual value extracted for this token.
	 **/
	var AtomTokenPrototype = Object.create(GenericConsumptionToken);

	/** 
	 * Factory for a new AtomToken.
	 **/
	AtomTokenPrototype.create = function(value){
		var tok = Object.create(AtomTokenPrototype);
		tok.value = value;
		return tok;
	};
	AtomTokenPrototype.type = "atom";

	/**
	 * Override the GenericToken consume function.
	 **/
	AtomTokenPrototype.consume = function(tokenizer) {
		var end = this.consumeWithFunction(tokenizer, function(end, remaining){
			if(end === 0) {
				// Dont confuse a number for an atom, if the first character is a digit, it HAS to be number.
				return this.isAlphaNum(remaining[end]) && !this.isNumeric(remaining[end]);
			}
			return this.isAlphaNum(remaining[end]);
		});

		if(end > 0) {
			var ss = tokenizer.getStream().substring(0, end);
			var token = AtomTokenPrototype.create(ss);
			tokenizer.shift(end);
			return token;
		}

		return false;
	};

	/**
	 * Pretty Printing.
	 **/
	AtomTokenPrototype.toString = function() {
		return "AtomToken(" + this.value + ")";
	};

	return AtomTokenPrototype;
};