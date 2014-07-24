/**
 * Returns true if the given prototype exists in the objects prototype chain.
 **/
Object.instanceOf = function(object, prototype){ 
	var testPrototype = object;
	do {
		testPrototype = Object.getPrototypeOf(testPrototype);
		if(testPrototype === prototype) {
			return true;
		}
	} while(testPrototype !== null && testPrototype !== Object.prototype);
	return false;
}

module.exports.Tokenizer = require("./tokenizer");
module.exports.Parser = require("./parser");