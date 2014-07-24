
# Generic Tokenizer and Shift-Reduce, incremental parser.

Very WIP right now... see index.js for usage example. 
Currently basic parsing works correctly, but the errors are crude and have no relevance to 
whats wrong with the input stream.

## TODO:

1. Conflict detection (shift/reduce, reduce/reduce)
1. Error reporting (nice errors instead of just blowing up)
1. Cleanup/reorganize code to make something maintainable.
1. MORE TESTS!!!
1. Easier to use grammar specification format.
1. Documentation (eventually....)