/** 
 * PHP Names file.
 **/
module.exports = {
  "symbols":{
  },
  "modules":{
  	"kw":"../lexical/keywords.json",
    "tokens":"../lexical/tokens.js"
  },
  "productions":{
    "primary-expression":[
      ["tokens.variable-name"]
    ]
  },
  "startSymbols":[ "primary-expression" ]
};