var Parser = require("../../../lib").Parser.LRParser;
var keywords_pd = require("../lexical/keywords.json");
var keywords = [
	"enddeclare","endforeach","endfor","endif","endswitch","endwhile",
	"goto","if","implements",
	"include","include_once","instanceof","extends","final","finally","for","foreach","function",
	"global","insteadof","interface","namespace","new","or","print","private","throw","trait",
	"try","use","var","while","xor","yield","abstract","and","as","break","callable","case","catch",
	"class","clone","const","continue","declare","default","do","echo","else","elseif","protected",
	"public","require","require_once","return","static","switch"
];

describe("PHP Parser - Keywords - ", function(){

	for(var k in keywords) {
		var keyword = keywords[k];
		it("`" + keyword + "`", function(keyword){
			return function(end) {
				var parser = Parser.CreateWithLexer(keywords_pd);
				parser.on("error", function(error){ throw error.message; });
				parser.on("keyword", function(ast){ 
					ast[0].type.should.eql(keyword);
					end();
				});
				// Begin processing the input
				parser.append(keyword);
				parser.end();
			}
		}(keyword));
	}
});