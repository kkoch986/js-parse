
var Parser = require("../../lib").Parser.LRParser;
var terminals_pd = require("./lexical/literals.js");
require.main.paths.push(__dirname + "/lexical");
var parser = Parser.CreateWithLexer(terminals_pd);

console.log(parser);