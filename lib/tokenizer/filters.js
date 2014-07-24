
/**
 * Use this file for various preprocessing filters.
 **/

/** 
 * Returns a function which will filter out any whole line comments
 * using the given string as a start sequence.
 * Will default to "//"
 **/
module.exports.removeInlineComments = function(start_sequence) {
	if(typeof start_sequence === "undefined") {
		start_sequence = "//";
	}
	return function(string){
		return string.replace('/'+start_sequence+'.*[\n]?[$]?/gm', " ").trim();
	};
};

/**
 * Returns a function which will filter out any comments with the start and end sequence provided.
 * Will default to '/*' and '*\/'
 **/
module.exports.removeEnclosedComments = function(start_sequence, end_sequence) {
	if(typeof start_sequence === "undefined") {
		start_sequence = "\/\*";
	}
	if(typeof end_sequence === "undefined") {
		end_sequence = "\*\/";
	}

	return function(string) {
		return string.replace('/'+start_sequence+'.*'+end_sequence+'/g', " ");
	};
};