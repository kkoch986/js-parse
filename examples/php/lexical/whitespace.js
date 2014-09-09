/** 
 * PHP Whitespace.
 **/
module.exports = {
  "symbols":{
    "cr":{
      "terminal":true,
      "match":"[\\r]",
      "lookAhead":"[^\\n]"
    },
    "lf":{
      "terminal":true,
      "match":"[\\n]"
    },
    "crlf":{
      "terminal":true,
      "match":"[\\r][\\n]"
    },
    "space":{
      "terminal":true,
      "match":"[ ]"
    },
    "htab":{
      "terminal":true,
      "match":"[\\t]"
    }
  },
  "productions":{
    "whitespace":[
      ["whitespace", "whitespace-char"],
      ["whitespace-char"]
    ],
    "whitespace-char":[
      ["newline"],
      ["space"],
      ["htab"]
    ],
    "newline":[
      ["lf"], ["cr"], ["crlf"]
    ]
  },
  "startSymbols":[ "whitespace" ]
};