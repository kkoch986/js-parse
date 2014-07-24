
module.exports = function(GenericConsumptionToken){
	/**
	 * Basic STRING token.
	 * 
	 * Has 1 properties:
	 *  - value = the actual value extracted for this token.
	 **/
	var StringTokenPrototype = Object.create(GenericConsumptionToken);

	/** 
	 * Factory for a new AtomToken.
	 **/
	StringTokenPrototype.create = function(value){
		var tok = Object.create(StringTokenPrototype);
		tok.value = value;
		return tok;
	};
	StringTokenPrototype.type = "StringToken";

	/**
	 * Override the GenericToken consume function.
	 *
	 * The way this one works is a little strange, it immendiatly stops if the first character is not an quote.
	 * Otherwise it keeps running until it find and unescaped version of the opening quote.
	 **/
	StringTokenPrototype.consume = function(tokenizer) {
		var open = null;
		var escape = false;
		var end = this.consumeWithFunction(tokenizer, function(end, remaining){
			if(end === 0) {
				// The first character MUST be either ' or "
				if(remaining[end] !== "'" && remaining[end] !== "\"") {
					return false;
				} else {
					open = remaining[end];
					return true;
				}
			}

			// Check for escapes
			if(remaining[end] === "\\") {
				escape = !escape;
				return true;
			}

			// Check for the end slash, if we find it, return false to stop
			// the consumption function.
			if(escape === false && remaining[end] === open) {
				return false;
			}

			// Return true for everything else
			return true;
		});
		
		if(end > 0 && escape === false && tokenizer.getStream()[end+1] === open) {
			var ss = tokenizer.getStream().substring(1, end+1);
			var token = StringTokenPrototype.create(ss);
			tokenizer.shift(end+1);
			return token;
		}

		return false;
	};

	/**
	 * Pretty Printing.
	 **/
	StringTokenPrototype.toString = function() {
		return "StringToken(" + this.value + ")";
	};

	return StringTokenPrototype;
};