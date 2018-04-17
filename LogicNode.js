/*Comments!
To do: add valuations to this script (don't forget about the "implies" fuckery)
Parse tree visualisation!
*/

"use strict";
var counter = 1;
class LogicNode
{
	constructor(value)
	{
		this.parent = null;
		this.value = value;
		this.children = [];
		this.unique = null;
	}

	get parent(){return this._parent}
	set parent(val){this._parent = val}
	
	get unique(){return this._unique}
	set unique(val){this._unique = counter; counter++}
	
	get value(){return this._value}
	set value(val){this._value = val}

	get children(){return this._children}
	set children(child)
	{
		if (this._children instanceof Array)
		{
			if (this._children.length < this.expected())
				this._children.push(child);
			else {}
		}
		else
			this._children = [];
	}

	addChild(child)
	{
		this.children = child;
		child.parent = this;
	}

	removeChild()
	{
		this.children.shift();
	}

	expected()
	{
		if (this.value == "AND" || this.value == "OR" || this.value == "IMPLIES")
			return 2;
		else if (this.value == "NOT")
			return 1;
		else
			return 0;
	}

	complete()
	{
		return this.children.length == this.expected();		
	}
	
	collapse(method)
	{
		var i, kids = this.children.length;
		if (!this.complete())
		{
			console.log("Can't collapse node " + this.unique + ".");
			return null;
		}
		switch (kids)
		{
			case 2:
				if (method == "in")
					this.value = "(" + this.children[0].value + " " + this.value + " " + this.children[1].value + ")";
				else if (method == "pre")
					this.value = this.value + " " + this.children[0].value + " " + this.children[1].value;
				else if (method == "post")
					this.value = this.children[0].value + " " + this.children[1].value + " " + this.value;
				break;
			case 1:
				if (method == "in")
					this.value = "(" +  this.value + " " + this.children[0].value + ")";
				else if (method == "pre")
					this.value = this.value + " " + this.children[0].value;
				else if (method == "post")
					this.value = this.children[0].value + " " + this.value;
				break;
			default:
		}
		for (i=0; i<kids; i++)
			this.removeChild();
	}
}

function shuffle(arr)
{
	var j, x, i;
	for (i=arr.length-1; i>0; i--)
	{
		j = Math.floor(Math.random()*(i+1));
		x = arr[i];
		arr[i] = arr[j];
		arr[j] = x;
	}
	return arr;
}

function findNode(arr,unique)
{
	var i;
	for (i=0; i<arr.length; i++)
	{
		if (arr[i].unique == unique)
			return i;
	}
	return -1;
}

function copyNode(original)
{
	return new LogicNode(original.value);
}

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
			outArr.push(shuffle(varArr)[0]);
	}
	for (k=0; k<nots; k++)
		outArr.push("NOT");
	for (k=0; k<operands-1; k++)
		outArr.push(shuffle(opArr)[0]);
	while(!isValid(outArr))
		shuffle(outArr);
	return outArr;
}

function node_array_from_args(valArr)
{
	var outArr = [], i;
	for (i=0; i<valArr.length; i++)
		outArr.push(new LogicNode(valArr[i]));
	return outArr;
}

function build_tree(nodeArr)
{
	var mainArr = [], i;
	for (i=0; i<nodeArr.length; i++)
		mainArr.push(copyNode(nodeArr[i]));
	var ind = 0;
	for (i=0; i<mainArr.length; i++)
	{
		var node = mainArr[i];
		if (node.expected() > 1)
		{
			ind++;
			node.addChild(mainArr[ind]);
		}
		if (node.expected() > 0)
		{
			ind++;
			node.addChild(mainArr[ind]);
		}
	}
	return mainArr;
}

function string_from_tree(nodeArr,method)
{
	var tempArr = build_tree(nodeArr), i;
	while (tempArr.length > 1)
	{
		var parent = tempArr[tempArr.length-1].parent;
		if (parent == null)
			break;
		if (parent.children.length==1)
		{
			tempArr.splice(findNode(tempArr,parent.children[0].unique),1);
			parent.collapse(method);
		}
		else if (parent.children.length == 2)
		{
			tempArr.splice(findNode(tempArr,parent.children[0].unique),1);
			tempArr.splice(findNode(tempArr,parent.children[1].unique),1);
			parent.collapse(method);
		}
	}
	var result = tempArr[0].value;
	if (method == "in")
		result = result.slice(1,result.length-1);
	return result;
}

var testCpts = make_components(6,4,2);
var testNodes = build_tree(node_array_from_args(testCpts));
console.log(string_from_tree(testNodes,"in"));
console.log(string_from_tree(testNodes,"pre"));
console.log(string_from_tree(testNodes,"post"));
