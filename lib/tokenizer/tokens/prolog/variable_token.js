
module.exports = function(GenericConsumptionToken){
	/**
	 * Prolog Variable Token.
	 * A prolog variable is defined as an identifier which starts with a capital letter OR and underscore.
	 * 
	 * Has 1 properties:
	 *  - value = the actual value extracted for this token.
	 **/
	var PrologVariableTokenPrototype = Object.create(GenericConsumptionToken);

	/** 
	 * Factory for a new AtomToken.
	 **/
	PrologVariableTokenPrototype.create = function(value){
		var tok = Object.create(PrologVariableTokenPrototype);
		tok.value = value;
		return tok;
	};
	PrologVariableTokenPrototype.type = "PrologVariableToken";

	/**
	 * Override the GenericToken consume function.
	 **/
	PrologVariableTokenPrototype.consume = function(tokenizer) {
		var end = this.consumeWithFunction(tokenizer, function(end, remaining){
			if(end === 0) {
				return remaining[end] === "_" || (remaining[end] >= 'A' && remaining[end] <= 'Z');
			} else {
				return this.isAlphaNum(remaining[end]);
			}
		});

		if(end > 0) {
			var ss = tokenizer.getStream().substring(0, end);
			var token = PrologVariableTokenPrototype.create(ss);
			tokenizer.shift(end);
			return token;
		}

		return false;
	};

	/**
	 * Pretty Printing.
	 **/
	PrologVariableTokenPrototype.toString = function() {
		return "VariableToken(" + this.value + ")";
	};

	return PrologVariableTokenPrototype;
};