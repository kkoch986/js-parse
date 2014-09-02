/**
 * PHP Terminals file.
 **/
 // Since the REGEX for DQ string literal is so complicated, pull some pieces out here.
 // matches one of `\"`, `\\`, `\$`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v`
 var dq_simple_escape_sequence = "(\\\\t)|(\\\\r)|(\\\\n)|(\\\\f)|(\\\\e)|(\\\\\\\\)|(\\\\\\$)|(\\\\\")|(\\\\v)";
 var dq_octal_escape_sequence = "\\\\[0-7]{1,3}";
 var dq_hexadecimal_escape_sequence = "\\\\x[0-9a-fA-F]{1,2}";
 var dq_escape_sequence = "("+dq_simple_escape_sequence+")|("+dq_octal_escape_sequence+")|("+dq_hexadecimal_escape_sequence+")";
 var name_regex = "[a-zA-Z_\\u007f-\\u00ff][a-zA-Z0-9_\\u007f-\\u00ff]*";

 module.exports = {
  "symbols":{

    /**
     * Sequences of digits.
     * These stmbols should have the mergeRecursive setting 
     * to prevent huge trees from building up.
     **/
    "binary-literal":{
      "terminal":true,
      "match":"0b[0-1]+",
      "matchCaseInsensitive":true
    },
    "hexadecimal-literal":{
      "terminal":true,
      "match":"0x[0-9a-f]+",
      "matchCaseInsensitive":true
    },
    "octal-literal":{
      "terminal":true,
      "match":"0[0-7]*",
      "lookAhead":"[^bex\\.]"  // This lookahead is to prevent confusion with the other numeric literals
    },
    "decimal-literal":{
      "terminal":true,
      "match":"[1-9]([0-9]*)",
      "lookAhead":"[^bex\\.]"  // This lookahead is to prevent confusion with the other numeric literals
    },

    /**
     * Floating literal needeed to be broken into 2 cases,
     * one which contains the expontent part and one which doesnt.
     **/
    "floating-literal-exp":{
      "terminal":true,
      "match":"[0-9]+(\\.)?[0-9]*[e][\\-\\+]?[0-9]+",
      "matchCaseInsensitive":true
    },

    "floating-literal-dot":{
      "terminal":true,
      "match":"([0-9]+\\.[0-9]*)|(\\.[0-9]+)",
      "matchCaseInsensitive":true,
      "lookAhead":"[^eE]$"
    },

    /** 
     * Symbols.
     **/
    "[":{
      "terminal":true,
      "match":"\\["
    },
    "]":{
      "terminal":true,
      "match":"\\]"
    },
    "(":{
      "terminal":true,
      "match":"\\("
    },
    ")":{
      "terminal":true,
      "match":"\\)"
    },
    "{":{
      "terminal":true,
      "match":"\\{"
    },
    "}":{
      "terminal":true,
      "match":"\\}"
    },
    ".":{
      "terminal":true,
      "match":"[\\.]",
      "lookAhead":"[^0-9]"
    },
    "->":{
      "terminal":true,
      "match":"\\->"
    },
    "++":{
      "terminal":true,
      "match":"\\+\\+"
    },
    "--":{
      "terminal":true,
      "match":"\\-\\-"
    },
    "**":{
      "terminal":true,
      "match":"\\*\\*"
    },
    "*":{
      "terminal":true,
      "match":"\\*",
      "lookAhead":"[^\\*]"
    },
    "+":{
      "terminal":true,
      "match":"\\+",
      "lookAhead":"[^\\+]"
    },
    "-":{
      "terminal":true,
      "match":"\\-",
      "lookAhead":"[^\\-]"
    },
    "~":{
      "terminal":true,
      "match":"~"
    },
    "!":{
      "terminal":true,
      "match":"!"
    },
    //  % >      =   ==   ===   !=   !==   ^   |
    // &   &&   ||   ?   :   ; =   **=   *=   /=   %=   +=   -=   .=   >=   &=   ^=   |=   ,
    "$":{
      "terminal":true,
      "match":"[\\$]"
    },
    "/":{
      "terminal":true,
      "match":"[/]"
    },
    "\\":{
      "terminal":true,
      "match":"[\\\\]",
      "lookAhead":"[^\\\\]"
    },


    /**
     * Boolean Literal.
     **/
    "boolean-literal":{
      "terminal":true,
      "match":"(true|false)",
      "matchCaseInsensitive":true
    },

    /**
     * NULL Literal.
     **/
    "null-literal": {
      "terminal":true,
      "match":"(null)",
      "matchCaseInsensitive":true
    },

    /** 
     * Double Quoted String Literal.
     **/
    "dq-string-literal":{
      "terminal":true,
      "match":"\"(("+dq_escape_sequence+")|([^\"\\\\])|(\\\\[^a-fnrtvx\\$\\\\\]))*\"",
      "matchCaseInsensitive":true
    },

    /**
     * Single quote string literal.
     **/
    "sq-string-literal":{
      "terminal":true,
      "match":"'((\\\\')|(\\\\)|([^\\'\\\\\]))*'",
      "matchCaseInsensitive":true
    },

    /**
     * Heredoc string literal.
     **/
    "hd-string-literal":{
      "terminal":true,
      "match":"<<<(" + name_regex + ")\\n((?:.|\\n)*)\\n\\1[;]?\\n"
    },

    /**
     * Nowdoc string literal.
     **/
    "nd-string-literal":{
      "terminal":true,
      "match":"<<<'(" + name_regex + ")'\\n((?:.|\\n)*)\\n\\1[;]?\\n"
    },

    /** 
     * Name
     **/
    "name":{
      "terminal":true,
      "match":name_regex
    }
  },

  "productions":{
    /** 
     * The highest level `literal`
     **/
    "literal":[
      ["integer-literal"],
      ["boolean-literal"],
      ["null-literal"],
      ["floating-literal"],
      ["string-literal"]
    ],

    /** 
     * Integer Literals
     **/
    "integer-literal":[
      ["decimal-literal"],
      ["octal-literal"],
      ["hexadecimal-literal"],
      ["binary-literal"]
    ],

    /**
     * Floating Literal.
     **/
    "floating-literal":[
      ["floating-literal-dot"],
      ["floating-literal-exp"]
    ],

    /**
     * String Literal.
     **/
    "string-literal":[
      [ "dq-string-literal" ],
      [ "sq-string-literal" ],
      [ "hd-string-literal" ],
      [ "nd-string-literal" ]
    ],

    /**
     * Sign
     **/
    "sign":[
      ["+"],
      ["-"]
    ]
  },
  "startSymbols":[ "literal" ]
}