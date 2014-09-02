
// test with ../../node_modules/mocha/bin/mocha spec/

var Parser = require("../../../lib").Parser.LRParser;
var terminals_pd = require("../literals.js");

describe("PHP Parser - Literals - ", function(){

  var positive_literal_cases = {
    "tRue":"boolean-literal",
    "fALsE":"boolean-literal",
    "true":"boolean-literal",
    "FALSE":"boolean-literal",
    "null":"null-literal",
    "NULL":"null-literal",
    "0.01":"floating-literal",
    ".01":"floating-literal",
    "1e10":"floating-literal",
    "0e20":"floating-literal",
    "0.01e20":"floating-literal",
    "0.01e-20":"floating-literal",
    "0.01e+20":"floating-literal",
    "1.":"floating-literal",
    "0.":"floating-literal",
    "0.0000001":"floating-literal",
    "9.00001e34":"floating-literal",
    "\"\\xaf\"":"string-literal",
    "\"\\012\"":"string-literal",
    "\"\\0zz\"":"string-literal",
    "\"\\zz\"":"string-literal",
    "\"\\\"\"":"string-literal",
    "''":"string-literal",
    "'asdf'":"string-literal",
    "'\012'":"string-literal",
    "'\\''":"string-literal",
    "<<<test\nabcdef\nAAAAAA\ntest\n":"string-literal",
    "<<<'test'\nabcdef\nAAAAAA\ntest\n":"string-literal"
  };
  var positive_integer_cases = {
    "0b010001":"binary-literal",
    "123456":"decimal-literal",
    "0123":"octal-literal",
    "0":"octal-literal",
    "0xbada55":"hexadecimal-literal"
  };

  // These symbols should not parse as part of the grammar
  var negative_cases = [ 
    ".", "0b0b01010", "09", "0b0123", "0x0x123", "0xaag", ".e10", "e10", "0.010.01", "123d", "\"\"\"",
    "'''"
  ];

  /** 
   * Positive literal cases.
   **/
  for(var test in positive_literal_cases) {
    var expected = positive_literal_cases[test];

    it(expected + " - " + test, function(test, expected){
      return function(end){
        var parser = Parser.CreateWithLexer(terminals_pd);
        parser.on("error", function(error){ throw error.message; });
        // parser.getLexer().on("token", function(r){console.log(r); });
        parser.on("literal", function(ast){ 
          var type = typeof ast[0].type === "undefined" ? ast[0].head : ast[0].type;
          type.should.eql(expected);
          end();
        });
        parser.append(test);
        parser.end();
      }
    }(test,expected));
  }

  /**
   * Positive integer literal cases.
   **/
  for(var test in positive_integer_cases) {
    var expected = positive_integer_cases[test];

    it(expected + " - " + test, function(test, expected){
      return function(end){
        var parser = Parser.CreateWithLexer(terminals_pd);
        parser.on("error", function(error){ throw error.message; });
        parser.on("integer-literal", function(ast){ 
          var type = typeof ast[0].type === "undefined" ? ast[0].head : ast[0].type;
          type.should.eql(expected);
          end();
        });
        parser.append(test);
        parser.end();
      }
    }(test,expected));
  }

  /**
   * Negative cases.
   **/
  for(var i in negative_cases) {
    var test = negative_cases[i];

    it("Negative Tests - `" + test + "`", function(test){
      return function(end){
        try {
          var parser = Parser.CreateWithLexer(terminals_pd);
          // parser.getLexer().on("token", function(r){console.log(r); });
          parser.append(test);
          parser.end();
        } catch(e) {
          end();
        }
      }
    }(test,expected));
  }
});
