/** 
 * PHP Comments.
 **/
module.exports = {
  "symbols":{
    "single-line-comment":{
      "terminal":true,
      "match":"((?://)|(?:#))([^\\n]*)",
      "matchOnly":2
    },
    "delimited-comment":{
      "terminal":true,
      "match":"/\\*((?:.|\\n)*)\\*/",
      "matchOnly":1
    }
  },
  "productions":{
    "comment":[
      ["single-line-comment"],
      ["delimited-comment"]
    ]
  },
  "startSymbols":[ "comment" ]
};