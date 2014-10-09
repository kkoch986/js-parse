/** 
 * PHP Names file.
 **/
module.exports = {
  "symbols":{
  },
  "modules":{
  	"kw":"../lexical/keywords.json",
    "tokens":"../lexical/tokens.js",
    "literals":"../lexical/literals.js"
  },
  "productions":{
    "$this":[
      ["literals.$", "kw.this"]
    ],
    "expression-in-parens":[
      ["literals.(", "primary-expression", "literals.)"]
    ],
    "primary-expression":[
      ["$this"],
      ["tokens.variable-name"],
      ["tokens.qualified-name"],
      ["literals.literal"],
      ["expression-in-parens"],
    ]
  },
  "startSymbols":[ "primary-expression" ]
};