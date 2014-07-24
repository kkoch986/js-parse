
module.exports = function(GenericConsumptionToken){
	/**
	 * Non-Terminal Token
	 * 
	 * Properties:
	 *  - value = the head of the production this .
	 **/
	var NonTerminalPrototype = Object.create(GenericConsumptionToken);

	/** 
	 * Factory for a new AtomToken.
	 **/
	NonTerminalPrototype.create = function(head, body){
		var tok = Object.create(NonTerminalPrototype);
		tok.terminal = false;
		tok.value = body;
		tok.type = head;
		return tok;
	};

	/**
	 * Override the GenericToken consume function.
	 **/
	NonTerminalPrototype.consume = function(tokenizer) {
		return false;
	};

	/**
	 * Pretty Printing.
	 **/
	NonTerminalPrototype.toString = function() {
		return this.type + "("+(this.value.join(","))+")";
	};

	return NonTerminalPrototype;
};