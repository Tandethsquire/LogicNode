Logic Node Package
==================

A <a href="https://www.Numbas.org.uk">Numbas</a> extension for dealing with mathematical logic. It is in two parts: a pure JavaScript implementation and the converted form for use in NUMBAS.

# Logic Nodes

Many of the problems that arise in logic seem difficult to randomise with *vanilla* NUMBAS functions: for example, suppose you want to randomly generate a statement like "not Q and (((Q implies (P or R)) implies P) and not P)" and its conversion to <a href="https://en.wikipedia.org/wiki/Polish_notation">Polish notation</a> or <a href="https://en.wikipedia.org/wiki/Reverse_Polish_notation">Reverse Polish notation</a>. Suppose you wish to be able to generate the truth table for such a statement. This will do that!

This defines a new object: a **logic node**. Any logic node has a parent, and some children: an OR statement requires two arguments, and so takes two children. In this way, the connections between the nodes produce the parse tree of the system.

#### The tree construction works with a set of node values given in 'level order'. See below for details.

Once the parse tree is built, the statements can be constructed in any of the notational forms, and the truth of the statement given any set of truth values for its parameters can be determined.

## How to use
The starting point is something from which we can generate a parse tree: either supply a set of statements in an array, *ordered in a particular order*, or use `make_components`. See the below documentation for a description of `make_components`.
The specific ordering of the elements of the array is as follows. For any binary operator, its arguments are the next two unused arguments in the array. For a unary operator, its argument is the next unused element. *This is not the same as Polish notation!* The expression "(NOT (Q OR R)) AND P" is "AND NOT OR Q R P" in Polish notation, whereas it would be passed into functions of this package as ["AND","NOT","P","OR","Q","R"].
Having built the array, the function `string_from_tree` converts it into a string, to be displayed. An argument to `string_from_tree` indicates whether Polish, standard, or reverse Polish notation should be used. For the example above:
```JavaScript
 string_from_tree(["AND","NOT","P","OR","Q","R"],'post'),
 ```
string_from_tree will produce the string "Q R OR NOT P AND". Usage of `make_components` is automatically randomised: it generates a valid statement given a set of conditions.

# Syllogism Generator
A syllogism is a triplet of statements, consisting of a major premise, minor premise, and conclusion; the variables therein are predicate, middle and subject. Depending on the nature of the three statements, the syllogism can be valid, invalid, or valid under a further existential assumption (for details see, e.g. the <a href="https://en.wikipedia.org/wiki/Syllogism">Wiki</a> article). For a set of three categories, and a requirement of validity, one can generate a syllogism. There are two main methods in this: `makeSyllogism` and `parsify`.

## How to use
Start with a set of three items that *can be pluralised in the most common way*. For example, the set {'gadget', 'grommet', 'widget'} is fine, but {'man','woman','person'} will not produce a grammatical syllogism. Choose a random number between 1 and 4 *(future project: have the figure choice as an optional parameter)* corresponding to the figure; i.e. the structure and placement of the predicate, middle, and subject. Choose if you want the generated syllogism to be valid - if it is to be valid, also choose whether it is only valid under an additional assumption. `makeSyllogism` then generates a HTML representation corresponding to this system.

For example, taking ['gadget','grommet','widget'], figure 1, and the syllogism to be true under an additional assumption would be entered as
```JavaScript
makeSyllogism(['gadget','grommet','gadget'],1,true,true);
// Output could be:
/* All gadgets are widgets;
All grommets are gadgets;
Therefore some grommet is a widget. */
```

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
```JavaScript
make_components(2,2,1)
\\ Output could be ['AND','NOT','P','Q']
```

### `parsify`
Takes an array corresponding to the structure of line of the syllogism, and an array of the middle, subject, predicate (in that order), and converts it into a grammatical English statement. In the first array, the ordering is [<Object>,<Relationship>,<Object>], where <Object> is one of M, S or P; relationship is converted as follows.
- A: "All...are..."
- E: "No...are..."
- I: "Some...are..."
- O: "Some...are not..."
 
For example
```Javascript
parsify([M,I,P],['gadget','grommet','widget'])
// Output is 'Some gadgets are widgets'
```

### `makeSyllogism`
Takes an array of middle, subject, predicate; a figure type; a determiner for the validity of the syllogism, and an existential determiner. The figure identifier corresponds to a structure; if 'M-P' corresponds to <middle><relationship><predicate>, then the syllogisms are structured as
1. M-P; S-M; S-P
2. P-M; S-M; S-P
3. M-P; M-S; S-P
4. P-M; M-S; S-P
 
From the figure and the 'truthiness' required, it generates the relationships: there are 64 possibilities, only 6 of which are valid. Following the convention described in `parsify`, the valid syllogisms are
1. AAA, EAE, AII, EIO, *AAI*, *EAO*
2. EAE, AEE, EIO, AOO, *EAO*, *AEO*,
3. AII, IAI, EIO, OAO, *EAO*, *AAI*
4. AEE, IAI, EIO, *AEO*, *EAO*, *AAI*

where the *italicised* patterns are valid under additional existence assumptions. If a false syllogism is required, it will randomly generate a string of three letters from {A,E,I,O} using `genPatt` and check that it isn't valid, regenerating as necessary.
Once this has been generated, `parsify` is use to convert the symbolic statement into English.

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
