/** 
 * PHP Names file.
 **/
module.exports = {
  "symbols":{
  },
  "modules":{
  	"kw":"keywords.json",
  	"literals":"literals.js"
  },
  "productions":{
    /**
     * Tokens.
     **/
    "token":[
      ["variable-name"],
      ["literals.name"],
      ["kw.keyword"],
      ["literals.literal"],
      ["literals.operator-or-punctuator"]
    ],

    /**
     * Names
     **/
    "variable-name":[
    	["literals.$", "literals.name"]
    ],
    "namespace-name":[
    	["namespace-name", "literals.\\", "literals.name"],
    	["literals.name"]
    ],

    // Combined namespace-name-as-a-prefix with qualified name.
    "qualified-name":[
      ["literals.name"],
      ["literals.\\", "literals.name"],
      ["literals.\\", "namespace-name", "literals.\\", "literals.name"],
      ["kw.namespace", "literals.\\", "literals.name"],
      ["kw.namespace", "literals.\\", "namespace-name", "literals.\\", "literals.name"],
      ["namespace-name", "literals.\\", "literals.name"]
    ]
  },
  "startSymbols":[ "token" ]
};