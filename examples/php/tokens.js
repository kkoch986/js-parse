/** 
 * PHP Names file.
 **/
module.exports = {
  "symbols":{
  },
  "modules":{
  	"kw":"./keywords.json",
  	"literals":"./literals.js"
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
      // ["operator-or-punctuator"]
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

    // TODO: Potential bug here (S/R conflict)
    "namespace-name-as-a-prefix":[
    	["namespace-name", "literals.\\"],
    	["literals.\\", "namespace-name", "literals.\\"],
    	["literals.\\"],
    	["kw.KW_namespace", "literals.\\", "namespace-name", "literals.\\"],
    	["kw.KW_namespace", "literals.\\"]
    ],
    "qualified-name":[
    	["namespace-name-as-a-prefix", "literals.name"],
    	["literals.name"]
    ]
  },
  "startSymbols":[ "token" ]
};