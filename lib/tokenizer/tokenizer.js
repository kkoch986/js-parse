
/**
 * Tokenizer Prototype.
 **/
var GenericTokenizerPrototype = {
	"start":GenericTokenizerPrototype_start,
	"shift":GenericTokenizerPrototype_shift,
	"trim":GenericTokenizerPrototype_trim,
	"apply":GenericTokenizerPrototype_apply,
	"next": GenericTokenizerPrototype_next,
	"getStream":GenericTokenizerPrototype_getStream
};

/**
 * Tokenizer Factory.
 * 
 * @initial_filters - an array of functions to apply when a new string is to be tokenized.
 * @token_chain - an array of TokenPrototype instances which will be used to try and tokenize the
 *			input strings.
 **/
function CreateTokenizer(initial_filters, token_chain) {
	var tokenizer = Object.create(GenericTokenizerPrototype);
	tokenizer.string = null;
	tokenizer.currentToken = null;
	tokenizer.initial_filters = initial_filters;
	tokenizer.token_chain = token_chain;

	return tokenizer;
}

/**
 * Tokenizer Functions.
 **/
function GenericTokenizerPrototype_next() {
	if(this.string === null) {
		return false;
	}

	// Loop over the token chain and try to find a token match
	for(var t in this.token_chain) {
		var token = this.token_chain[t].consume(this);
		if(token !== false) {
			return token;
		}
	}

	// If we reach this point, no tokenizer was able to consume the current string or we've reached the end of the file.
	return false;
}

function GenericTokenizerPrototype_start(string) {
	this.string = string;

	// Apply the filters
	for(var f in this.initial_filters) {
		this.apply(this.initial_filters[f]);
	}
}

function GenericTokenizerPrototype_getStream() { return this.string; };

/**
 * Shift the string by N (exclusive) characters.
 **/
function GenericTokenizerPrototype_shift(n) {
	this.string = this.string.substring(n).trim();
}

/**
 * Trim leading and trailing whitespace from the current string.
 **/
function GenericTokenizerPrototype_trim() {
	this.string = this.string.trim();
}

/**
 * Call the given function on the current string and set the string to its return value.
 **/
function GenericTokenizerPrototype_apply(f) {
	this.string = f(this.string);
}

/**
 * Exports.
 **/
module.exports.GenericTokenizerPrototype = GenericTokenizerPrototype;
module.exports.Create = CreateTokenizer;