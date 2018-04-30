Logic Node Package
==================

A <a href="https://www.Numbas.org.uk">Numbas</a> extension for dealing with mathematical logic. It is in two parts: a pure JavaScript implementation and the converted form for use in NUMBAS.

Many of the problems that arise in logic seem difficult to randomise with *vanilla* NUMBAS functions: for example, suppose you want to randomly generate a statement like "not Q and (((Q implies (P or R)) implies P) and not P)" and its conversion to <a href="https://en.wikipedia.org/wiki/Polish_notation">Polish notation</a> or <a href="https://en.wikipedia.org/wiki/Reverse_Polish_notation">Reverse Polish notation</a>. Suppose you wish to be able to generate the truth table for such a statement, or produce random such statements. This will do that!

This defines a new object: a **logic node**. Any logic node has a parent, and some children: an OR statement requires two arguments, and so takes two children. In this way, the connections between the nodes produce the parse tree of the system.

#### The tree construction works with a set of node values given in Polish notation!

Once the parse tree is built, the statements can be constructed in any of the notational forms, and the truth of the statement given any set of truth values for its parameters can be determined.

## How to use
The starting point is something from which we can generate a parse tree: either supply a set of statements in an array, *ordered in a particular order*, or use `make_components`. See the below documentation for a description of `make_components`.
The specific ordering of the elements of the array is as follows. For any binary operator, its arguments are the next two unused arguments in the array. For a unary operator, its argument is the next unused element. *This is not the same as Polish notation!* The expression "(NOT (Q OR R)) AND P" is "AND NOT OR Q R P" in Polish notation, whereas it would be passed into functions of this package as ["AND","NOT","P","OR","Q","R"].
Having built the array, the function `string_from_tree` converts it into a string, to be displayed. An argument to `string_from_tree` indicates whether Polish, standard, or reverse Polish notation should be used. For the example above:
``` string_from_tree(["AND","NOT","P","OR","Q","R"],'post') ```
string_from_tree will produce the string "Q R OR NOT P AND". Usage of `make_components` is automatically randomised: it generates a valid statement given a set of conditions.

## Ways this can be improved
So many ways! Actually visualising the parse trees, and allowing questions to be set around the completion of the parse tree, is the foremost project. This may require the concurrent use of JSXGraph, as the current visualisation in LogicNode.js is not ideal. There is much more scope to use this in clever ways: potentially partial collapses could allow for questions to be set on equivalence of statements. This would require some sort of `make_slightly_different` function or similar, to provide the distractors for a 'pick one/several from a list' questions.

## Object functions
Here I omit details about `add_child`, `remove_child`, and `expected`: if necessary, see comments in NUMBASLogic.js.
### `collapse`
Takes a node in a tree and 'collapses' it in a fashion dependent on the required notational output. It takes each value from the node's *collapsed* children and combines them into a string following Polish, standard, or reverse Polish conventions, replacing the node's value with this collapsed value. In this way, the function recursively generates the full parse tree stemming from the node. Presently, this is used exclusively on the first node, but there is scope to use this to partially collapse a parse tree.

## Javascript functions
### `int_to_binary_array`
For a given positive integer n, this generates its binary representation of a given length. This is used to generate the truth values of the variables, for valuing the truth table (below).

### `isValid`
Checks whether a (randomly generated, usually) array of node values forms a valid statement. A statement must begin with a binary operator OR/AND/IMPLIES, it must always have at least as many operators as variables until the very end, and it must end with two variables. In principle, this limits the placement of any unary operator NOT, but is not a problem in practice.

### `make_components`
Takes three integer values: the number of operands in the expression, the number of distinct variables, and the number of occurences of negation in the statement. It generates an array of node values which can then be passed to `build_tree`, `string_from_tree` or `valuation`. Due to the way in which it assigns the variable names, no more than 11 different variables can be used in a given statement. After randomly generating an array, it then reorders until it corresponds to a valid Polish notation statement.
```javascript
make_components(2,2,1)
\\ Output could be ['AND','NOT','P','Q']
```

## JME functions
### `make_components`
A JME equivalent of the JavaScript function.

### `string_from_tree`
Collapses the logic tree recursively and outputs a string. See `LogicNode.collapse` for more details.

### `truth_value`
Takes a set of node values, and a set of truth values for its variables, and computes the 'truthiness' of the statement.

### `truth_table_results`
Applies `truth_value` for all possible valuations of the variables. It runs from most 'truthy' to least: if the statement has two variables P, Q, then the rows of the truth table correspond to [1,1], [1,0], [0,1], [0,0] respectively.

### `texify`
Takes a string expression in 'raw' form (as generated by string_from_tree) and adds LaTeX for the "AND", "OR", "IMPLIES" and "NOT" operators. It also removes brackets from sub-expressions of the form (NOT (P)).
