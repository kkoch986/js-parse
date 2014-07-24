
module.exports = function(GenericConsumptionToken) {
	/**
	 * Basic NUMBER token.
	 * 
	 * Has 2 properties:
	 *	- isInteger = true if this value is to be treated as an int, otherwise its a float.
	 *  - value = the actual value extracted for this token.
	 **/
	var NumberTokenPrototype = Object.create(GenericConsumptionToken);

	/** 
	 * Factory for a new NumberToken.
	 **/
	NumberTokenPrototype.create = function(isInteger, value){
		var nt = Object.create(NumberTokenPrototype);
		nt.isInteger = isInteger;
		nt.value = value;

		return nt;
	};
	NumberTokenPrototype.type = "NumberToken";

	/**
	 * Override the GenericToken consume function.
	 **/
	NumberTokenPrototype.consume = function(tokenizer) {
		// The number consumption function triesw to read as many successive digits as possible, allowing exactly one "." 
		var encounteredPunctuation = false;
		var end = this.consumeWithFunction(tokenizer, function(end, remaining){
			// First check if its a '.', we can have at most 1 "." in the number.
			if(remaining[end] === "." && encounteredPunctuation !== true) {
				encounteredPunctuation = true;
			} else if(!this.isNumeric(remaining[end]) && (remaining[end] !== "." || encounteredPunctuation === true)) {
				return false;
			}
			return true;
		});
		
		// Make sure that what we matched does not end with a symbol
		if(!this.isNumeric(tokenizer.getStream()[end-1])) {
			end--;
			encounteredPunctuation = false;
		}

		if(end > 0) {
			var ss = tokenizer.getStream().substring(0, end);
			var isInteger = encounteredPunctuation ? false : true;
			var value = isInteger ? parseInt(ss) : parseFloat(ss);
			var token = NumberTokenPrototype.create(isInteger, value);
			tokenizer.shift(end);
			return token;
		}

		return false;
	};

	/**
	 * Pretty Print
	 **/
	NumberTokenPrototype.toString = function() { return "NumberToken(" + (this.isInteger ? "int" : "float") + "(" + this.value + "))"; };
	
	return NumberTokenPrototype;
}
