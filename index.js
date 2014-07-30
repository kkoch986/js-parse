
var jsp = require("./lib");
var Lexer = jsp.Lexer;
var Parser = jsp.Parser.LRParser;
var pd = require("./examples/meta.json");

// Create the parser
var parser = Parser.Create(pd);
parser.on("GrammarLine", function(GrammarLine, AST){
	console.log("GrammarLine", GrammarLine);
});

parser.on("accept", function(token_stack){
	console.log("Parser Accept:", token_stack);
});

parser.on("error", function(error){
	console.log("Parse Error: ", error.message);
	throw error.message;
});

// Create the lexer
var lexer = Lexer.Create(pd.symbols);
lexer.on("token", function(token){
	// Pass tokens to the parser immediately.
	console.log("Token recognized: ", token);
	parser.shift(token);
});

lexer.on("end", function(){
	parser.end();
});

// Begin processing the input
var input = "a -> b -> C d | e.";
for(var i in input) {
	lexer.append(input[i]);
}
lexer.end();