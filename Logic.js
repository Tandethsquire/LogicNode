/** Takes an integer and converts it to an array of bitwise values.
* The second argument indicates how many bits are required.
* Eg int_to_binary_array(6,4)=[0,1,0,1].
* @param {Int}
* @param {Int}
*
* @returns {Array[Int]}
*/
function int_to_binary_array(n, len)
{
  var outArr = [];
  while (n>0)
  {
    outArr.push(n%2);
    n = Math.floor(n/2);
  }
  while (outArr.length < len)
    outArr.push(0);
  return outArr.reverse();
}

/** Checks validity of an array, for building a parse tree.
* A valid array must begin with AND/OR/NOT, it must always have as many variables
* as operators (until the final element), and it must end with two variables.
* @param {Array[String]}
*
* @returns {Boolean}
*/
function isValid(arr)
{
  if (arr[0]!="AND"&&arr[0]!="OR"&&arr[0]!="IMPLIES")
    return false;
  if (arr[arr.length-1].length!=1||arr[arr.length-2].length!=1)
    return false;
  var i, varct = 0, opct = 0;
  for (i=0; i<arr.length-1; i++)
  {
    if (arr[i].length==1)
      varct++;
    if (arr[i]=="OR"||arr[i]=="AND"||arr[i]=="IMPLIES")
      opct++;
    if (varct>opct)
      return false;
  }
  return true;
}

/** Makes an array of nodes for the construction of parse trees.
* Note: no more than 11 different variables can be used!
* @param {Integer}
* @param {Integer}
* @param {Integer}
*
* @returns {Array[String]}
*/
function make_components(operands,variables,nots)
{
  var varArr = [], opArr = ["AND","OR","IMPLIES"], outArr = [], k;
  for (k=0; k<variables; k++)
    varArr.push(String.fromCharCode(80+k));
  for (k=0; k<operands; k++)
  {
    if (k<variables)
      outArr.push(varArr[k]);
    else
      outArr.push(Numbas.math.shuffle(varArr)[0]);
  }
  for (k=0; k<nots; k++)
    outArr.push("NOT");
  for (k=0; k<operands-1; k++)
    outArr.push(Numbas.math.shuffle(opArr)[0]);
  while(!isValid(outArr))
    outArr = Numbas.math.shuffle(outArr);
  return outArr;
}

/** Values a statement in infix form given a set of truth values for the variables.
The values can be presented as integers in {0,1} or as Boolean values.
* @param {String}
* @param {Array[Int]}
*
* @returns {Boolean}
*/
function evaluate(str,vals)
{
  str = str.replace(/NOT/g,"!").replace(/AND/g,"\&\&").replace(/OR/g,"||");
  for (i=0; i<vals.length; i++)
  {
    var reg = new RegExp(String.fromCharCode(80+i),"g");
    str = str.replace(reg,vals[i]);
  }
  return Boolean(eval(str));
}

/** Generates a full truth table for a statement.
* @param {String}
* @param {Int}
*
* @returns {Array[Boolean]}
*/
function truth_table(state, noofvals)
{
  var outArr = [], i;
  for (i=Math.pow(2,noofvals)-1; i>=0; i--)
    outArr.push(evaluate(state,int_to_binary_array(i,noofvals)));
  return outArr;
}

/** Checks whether an element is in an array.
* Maybe not necessary (might be a function in NUMBAS)
* @param {String}
* @param {Array}
*
* @returns {Boolean}
*/
function isInArr(elem,arr)
{
  var i;
  for (i=0; i<arr.length; i++)
  {
    if (arr[i] == elem)
      return true;
  }
  return false;
}

/** Generates a pattern for a syllogism. Used by makeSyllogism.
* Uses standard form : A is 'All X are Y', E is 'No X are Y', I is 'Some X are Y', O is 'Some X are not Y'.
* @returns {String}
*/
function genPatt()
{
  var opts = ["A","E","I","O"], outstr = "", i;
  for (i=0; i<3; i++)
  {
    outstr += Numbas.math.shuffle(opts)[0];
  }
  return outstr;
}

/** Pluralises a string. Definitely not complete, but works for a large variety of English words.
* @param {String}
*
* @returns {String}
*/
function pluralise(st)
{
	var str = st;
	if (isInArr(str,["sheep","fish","species","deer","series"]))
		return str;
	if (str!="human")
		str = str.replace(/(.*)man$/,'$1'+"men");
  str = str.replace(/(.*)(i|e)x$/,'$1'+"ices");
	str = str.replace(/(.*)person$/,'$1'+"people");
	str = str.replace(/(.*)child$/,'$1'+"children");
	str = str.replace(/(.*)us$/,'$1'+"i");
	str = str.replace(/(.*)is$/,'$1'+"es");
	if (!isInArr(str,["roof","belief","chef","chief"]))
		str = str.replace(/(.*)(f|fe)$/,'$1'+"ves");
	str = str.replace(/(.*[^aeiou])y$/,'$1'+"ies");
	if (!isInArr(str,["photo","piano","halo"]))
		str = str.replace(/(.*)o$/,function(x){return x+"es"});
	str = str.replace(/(.*)on$/,'$1'+"a");
	str = str.replace(/(t|g|f)oo(th|se|t)$/,'$1'+"ee"+'$2');
	if (str=="mouse")
		str = "mice";
	if (str == st)
		str = str.replace(/.*(s|ss|sh|ch|x)$/,function(x){return x+"es";});
	if (str == st)
		return str + "s";
	return str;
}

/** Takes a syllogism part in array form, with middle, subject and predicate,
* and turns it into a string.
* Syllogism array is [argument1,operator,argument2]; eg ['M','A','S'].
* mid-sub-pred array is in that order: [Middle, Subject, Predicate].
* Only works if the subject, middle and predicate pluralise in the most common
* English way (i.e. add an 's').
* @param {Array}
* @param {Array[String]}}
*
* @returns {String}
*/
function parsify(arr, msparr)
{
  var outstr;
  arr[0] = arr[0].replace(/M/,msparr[0]).replace(/S/,msparr[1]).replace(/P/,msparr[2]);
  arr[2] = arr[2].replace(/M/,msparr[0]).replace(/S/,msparr[1]).replace(/P/,msparr[2]);
  if (arr[1] == "A")
		outstr = "All " + pluralise(arr[0]) + " are " + pluralise(arr[2]);
	if (arr[1] == "E")
		outstr = "No " + pluralise(arr[0]) + " are " + pluralise(arr[2]);
	if (arr[1] == "I")
		outstr = "Some " + pluralise(arr[0]) + " are " + pluralise(arr[2]);
	if (arr[1] == "O")
		outstr = "Some " + pluralise(arr[0]) + " are not " + pluralise(arr[2]);
	return outstr;
}

/** Takes an array in order [middle,subject,predicate], and a figure type and truthiness,
* and generates a syllogism.
* There are four figures: see Wikipedia for details.
* There are three options for truthiness: the syllogism is true; it's true with
* a further existential assumption, or it's false.
* @param {Array[String]}
* @param {Int}
* @param {Boolean}
* @param {Boolean}
*
* @returns {String}
*/
function makeSyllogism(msparr,fig,isTrue,isExist)
{
  var props, truepatts, existpatts, patt, i;
	switch (fig)
	{
		case 1:
			props = ["MP","SM","SP"];
			truepatts = ["AAA","EAE","AII","EIO"];
			existpatts = ["AAI","EAO"];
			break;
		case 2:
			props = ["PM","SM","SP"];
			truepatts = ["EAE","AEE","EIO","AOO"];
			existpatts = ["EAO","AEO"];
			break;
		case 3:
			props = ["MP","MS","SP"];
			truepatts = ["AII","IAI","EIO","OAO"];
			existpatts = ["EAO","AAI"];
			break;
		case 4:
			props = ["PM","MS","SP"];
			truepatts = ["AEE","IAI","EIO"];
			existpatts = ["AEO","EAO","AAI"];
			break;
		default:
			break;
	}
	if (isTrue)
	{
		if (isExist)
			patt = existpatts[Math.floor(Math.random()*existpatts.length)];
		else
			patt = truepatts[Math.floor(Math.random()*truepatts.length)];
	}
	else
	{
		patt = genPatt();
		while (isInArr(patt,truepatts.concat(existpatts)))
			patt = genPatt();
	}
	var strarg = "";
	for (i=0; i<3; i++)
	{
		var argarr = [props[i][0],patt[i],props[i][1]];
		if (i==2)
		{
			var tempstr = parsify(argarr,msparr).replace(/[A-Z]/,function (x){return x.toLowerCase();});;
			strarg += "Therefore " + tempstr + ".";
		}
		else
			strarg += parsify(argarr,msparr) + ";<br>";
	}
	return strarg;
}

/** Generates the valuation for a given row of a truth table.
* Used to furnish the Disjunctive/Conjunctive Normal forms.
* The array given is a set of valuations for [P,Q,R...].
* isDNF indicates whether we want disjunctive (connected by AND)
* or conjunctive (connected by OR) form.
* @param {Array[Int]}
* @param {Boolean}
*
* @returns {String}
*/
function statement_from_truth(arr,isDNF)
{
  var i, outstr = "(";
	if (isDNF)
		var connective = "AND", falsey = " NOT ", truthy = " ";
	else
		var connective = "OR", falsey = " ", truthy = " NOT ";
  for (i=0; i<arr.length; i++)
  {
    if (arr[i] == 0)
      outstr += falsey + String.fromCharCode(80+i) + " ";
    else
      outstr += truthy + String.fromCharCode(80+i) + " ";
		if (i!=arr.length-1)
    	outstr += " " + connective + " ";
  }
  outstr += ")";
  return outstr.replace(/\(\s/g,"(").replace(/\s\)/g,")").replace(/\s+/g," ");
}

/** Generates the DNF or CNF for a truth table.
* @param {Array[Int]}
* @param {Int}
* @param {Boolean}
*
* @returns {String}
*/
function normalForm(table,noofvbls,isDNF)
{
  var i, outstr = "";
	if (isDNF)
		var connective = " OR ";
	else
		var connective = " AND ";
  for (i=0; i<table.length; i++)
  {
    if (table[i]==isDNF)
    {
      var pos = int_to_binary_array(Math.pow(2,noofvbls)-1-i,noofvbls);
      outstr += statement_from_truth(pos,isDNF);
      outstr += connective;
    }
  }
  return outstr.replace(/(?:\sAND\s|\sOR\s)$/,"");
}

/** For producing models (with make_model below). Checks whether an array,
* when partitioned into 2-sets, has a set with identical elements. Also checks
* that two partitions contain the same two elements (to remove the possibility
* that 'R OR Q' and 'Q OR R' are considered different).
* @param {Array[String]}
*
* @returns {Boolean}
*/
function validModel(arr)
{
	if (arr.length%2!=0)
		return false;
	var i, j, k;
	for (i=0; i<arr.length/2; i++)
	{
		if (arr[2*i]==arr[2*i+1])
			return false;
	}
  for (j=0; j<arr.length/2; j++)
  {
    for (k=j+1; k<arr.length/2; k++)
    {
      var arr1 = [arr[j],arr[j+1]];
      var arr2 = [arr[k],arr[k+1]];
      if ((arr1[0]==arr2[0] && arr1[1]==arr2[1])||(arr1[1]==arr2[0]&&arr1[0]==arr2[1]))
        return false;
    }
  }
	return true;
}

/** 'Prettifies' the output of a string: adds in the LaTeX symbols and strips out
some unecessary brackets.
* @param {string}
*
* @returns {string}
*/
function texify(rawstr, ownline)
{
  rawstr = rawstr.replace(/\((NOT\s.)\)/g,'$1');
  rawstr = rawstr.replace(/AND/g,"\\wedge").replace(/OR/g,"\\vee").replace(/IMPLIES/g,"\\rightarrow").replace(/NOT/g,"\\neg");
  if (ownline)
    return "$$" + rawstr + "$$";
  else
    return "$" + rawstr + "$";
}

Numbas.addExtension('Logic',['jme','jme-display','math'],function(logic)
{
  var logicScope = logic.scope;

  /** Create a logic node with a given node value.
  * @constructor
  * @memberof logic
  * @property {string} value
  * @property {LogicNode} parent
  * @property {Array[LogicNode]} children
  *
  * @param {string} value
  */

  var LogicNode = logic.LogicNode = function(value)
  {
    this.parent = null;
    this.value = value;
    this.children = [];
  }

  LogicNode.prototype = {
    /** String representation of the node value.
    * @returns {string}
    */
    toString: function() { return this.value; },
    /** LaTeX representation of the node value.
    * @returns {string}
    */
    toLaTeX: function(){
      var val = this.value;
      val = val.replace(/AND/g,"\\wedge").replace(/OR/g,"\\vee").replace(/IMPLIES/g,"\\rightarrow").replace(/NOT/g,"\\neg");
      return val;
    },
    /** Returns the number of children this node is expected to have.
    * @returns {string}
    */
    expected: function()
    {
      if (this.value == "AND" || this.value == "OR" || this.value == "IMPLIES")
        return 2;
      else if (this.value == "NOT")
        return 1;
      else
        return 0;
    },
    /** Add a child to the node. The child is added to children, and the child
    is assigned the parent.
    * @param {LogicNode}
    *
    * @returns {LogicNode}
    */
    add_child: function(child)
    {
      if (this.children.length < this.expected())
      {
        this.children.push(child);
        child.parent = this;
      }
      return this;
    },
    /** Removes the first child from the node. The child maintains the node as
    its parent (this is not a problem later due to the way collapse() works)
    * @param {LogicNode}
    */
    remove_child: function()
    {
      this.children.shift();
    },
    /** Collapses a node. Recursive: combines the collapsed value of the children
    node(s) appropriately dependent on the value of the node. The method is 'pre',
    'in' or 'post' (see string_from_tree)
    * @param {string}
    *
    * @returns {string}
    */
    collapse: function(method)
    {
      var i, kids =  this.children.length;
      switch (kids)
      {
        case 2:
  				if (method == "in")
  					this.value = "(" + this.children[0].collapse(method) + " " + this.value + " " + this.children[1].collapse(method) + ")";
  				else if (method == "pre")
  					this.value = this.value + " " + this.children[0].collapse(method) + " " + this.children[1].collapse(method);
  				else if (method == "post")
  					this.value = this.children[0].collapse(method) + " " + this.children[1].collapse(method) + " " + this.value;
  				break;
  			case 1:
  				if (method == "in")
  					this.value = "(" +  this.value + " " + this.children[0].collapse(method) + ")";
  				else if (method == "pre")
  					this.value = this.value + " " + this.children[0].collapse(method);
  				else if (method == "post")
  					this.value = this.children[0].collapse(method) + " " + this.value;
  				break;
  			case 0:
  			default:
      }
      return this.value;
    }
  }

  /** Takes a set of node values in specific order (usually from make_components)
  and assigns each node its parent and children. See readme for ordering.
  * @param {Array[string]}
  *
  * @returns {Array[LogicNode]}
  */
  function build_tree(valArr)
  {
    var mainArr = [], i;
    for (i=0; i<valArr.length; i++)
      mainArr.push(new LogicNode(valArr[i]));
    var ind = 0;
    for (i=0; i<mainArr.length; i++)
    {
      var node = mainArr[i];
      if (node.expected() > 1)
      {
        ind++;
        node.add_child(mainArr[ind]);
      }
      if (node.expected() > 0)
      {
        ind++;
        node.add_child(mainArr[ind]);
      }
    }
    return mainArr;
  }

  /** Takes a set of node values and constructs the logical statement.
  The method is either 'pre', 'in' or 'post' for Polish, standard or reverse
  Polish notation, respectively.
  * @param {Array[string]}
  * @param {string}
  *
  * @returns {string}
  */
  function string_from_tree(elem,method)
  {
    var i, nodeArr;
    if (elem[0] instanceof LogicNode)
      nodeArr = elem;
    else
      nodeArr = build_tree(elem);
    for (i=0; i<nodeArr.length; i++)
    {
      if (nodeArr[i].parent == null)
      {
        nodeArr[i].collapse(method);
        break;
      }
    }
    return nodeArr[0].value;
  }

  /** Values a statement given a set of truth values for its variables.
  The vals can be presented as integers in {0,1} or as Boolean values.
  * @param {Array[string]}
  * @param {Array[int]}
  *
  * @returns {Boolean}
  */
  function valuation(valArr,vals)
  {
    if (!(valArr instanceof Array))
    {
      return evaluate(valArr,vals);
    }
    var i, nodeArr = build_tree(valArr);
    for (i=0; i<nodeArr.length; i++)
    {
      var nd = nodeArr[i];
      if (nd.value == "IMPLIES")
      {
        nd.value = "OR";
        var tempnd = nd.children[0];
        var notNode = new LogicNode("NOT");
        nd.remove_child();
        nd.add_child(notNode);
        nd.children.reverse();
        notNode.add_child(tempnd);
        nodeArr.push(notNode);
      }
    }
    var infix = string_from_tree(nodeArr,"in");
    return evaluate(infix,vals);
  }

  /** Generates a full truth table for a statement.
  * @param {Array[string]}
  * @param {int}
  *
  * @returns {Array[Boolean]}
  */
  function truth_table(valArr, noofvals)
  {
    var outArr = [], i;
    for (i=Math.pow(2,noofvals)-1; i>=0; i--)
      outArr.push(valuation(valArr,int_to_binary_array(i,noofvals)));
    return outArr;
  }

  /** Generates a model from a required number of statements and the number of
  * arguments therein. Relies on validModel (above) to guarantee the model is
  * reasonable and/or has no redundant statements.
  * @param {Integer}
  * @param {Integer}
  *
  * @returns {String}
  */
  function make_model(statements,args)
  {
  	var i, j, outarr = [], argarr = [], feedarr = [];
  	for (j=0; j<Math.max(1,Math.floor(2*statements/args)); j++)
  	{
  		for (i=0; i<args; i++)
  		{
  			argarr.push(String.fromCharCode(80+i));
  		}
  	}
  	while ((argarr.length < statements*2)||(argarr.length%2==1))
  	{
  		argarr.push(Numbas.math.shuffle(argarr)[0]);
  	}
  	while (!validModel(argarr))
  		argarr = Numbas.math.shuffle(argarr);
  	for (i=0; i<statements; i++)
  	{
  		outarr.push(string_from_tree([["AND","OR","IMPLIES"][Math.floor(Math.random()*3)],argarr[2*i],argarr[2*i+1]],"in"));
  	}
  	return outarr;
  }

  var funcObj = Numbas.jme.funcObj;
  var TString = Numbas.jme.types.TString;
  var TNum = Numbas.jme.types.TNum;
  var TList = Numbas.jme.types.TList;
  var TBool = Numbas.jme.types.TBool;

  // Declarations for any functions required to generate NUMBAS variables.
  logicScope.addFunction(new funcObj('int_to_binary_array',[TNum,TNum],TList,function(n,len){return int_to_binary_array(n,len);},{unwrapValues: true}));
  logicScope.addFunction(new funcObj('make_components',[TNum,TNum,TNum],TList, function(ops,args,nots){return make_components(ops,args,nots);}, {unwrapValues: true}));
  logicScope.addFunction(new funcObj('string_from_tree',[TList,TString],TString, function(arr,how){return string_from_tree(arr,how);}, {unwrapValues: true}));
  logicScope.addFunction(new funcObj('evaluate',[TString,TList],TBool,function(str,arr){return evaluate(str,arr);}, {unwrapValues: true}));
  logicScope.addFunction(new funcObj('truth_value',[TList,TList],TBool, function(arr,vals){return valuation(arr,vals);}, {unwrapValues: true}));
  logicScope.addFunction(new funcObj('truth_table_results',[TList,TNum],TList,function(str,noofvals){ return truth_table(str,noofvals);}, {unwrapValues: true}));
  logicScope.addFunction(new funcObj('truth_table_results',[TString,TNum],TList,function(str,noofvals){ return truth_table(str,noofvals);}, {unwrapValues: true}));
  logicScope.addFunction(new funcObj('texify',[TString, TBool], TString, function(str,line){return texify(str,line);},{unwrapValues: true}));
  logicScope.addFunction(new funcObj('syllogism',[TList,TNum,TBool,TBool],TString, function(arr,fig,tr,ex){return makeSyllogism(arr,fig,tr,ex);},{unwrapValues: true}));
  logicScope.addFunction(new funcObj('normal_form',[TList,TNum,TBool],TString,function(tab,n,dnf){return normalForm(tab,n,dnf);},{unwrapValues: true}));
  logicScope.addFunction(new funcObj('make_model',[TNum,TNum],TList,function(statements,args){return make_model(statements,args);},{unwrapValues: true}));

})
