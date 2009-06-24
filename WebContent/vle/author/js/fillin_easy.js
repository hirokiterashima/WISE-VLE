var xmlPage;
var fullText;
var fillin = [];
var fillinIndexes = [];
var charCount;
var saved = true;

function generatePage(){
	var parent = document.getElementById('dynamicParent');
	
	//wipe out old elements and variables
	parent.removeChild(document.getElementById('dynamicPage'));
	
	fullText = generateFullText();
	
	//create new elements
	var pageDiv = createElement(document, 'div', {id:'dynamicPage'});
	var questionText = document.createTextNode('QUESTION');
	var questionText2 = document.createTextNode('Type your question below. To create fill-in blanks, highlight a section of text and click the TRANSFORM button. To edit or remove existing fillins, select the matching radio button.');
	var questionInput = createElement(document, 'textarea', {id: 'questionInput', cols: '90', rows: '30', wrap: 'hard', onkeyup: 'sourceUpdated()'});
	var fillinText = document.createTextNode('Edit/Remove existing fillins');
	questionInput.innerHTML = fullText;
	charCount = questionInput.value.length;
	
	var createFillin = createElement(document, 'input', {type: 'button', onclick: 'createFillin()', value: 'Transform Highlighted Text into Fill-Blank'});
	
	pageDiv.appendChild(questionText);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(questionText2);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(questionInput);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createFillin);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(fillinText);
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(generateFillins());
	
	parent.appendChild(pageDiv);
};

/**
 * Generates the fulltext from the xmlPage and sets the textarea's 
 * value with the fulltext
 */
function generateFullText(){
	fullText = "";
	fillin = [];
	fillinIndexes = [];
	
	var currentIndex = 0;
	var html = '';
	var text = xmlPage.getElementsByTagName('itemBody')[0];
	
	for(var x=0;x<text.childNodes.length;x++){
		if(text.childNodes[x].nodeName!="#text"){
			if(text.childNodes[x].nodeName=='htmltext' && text.childNodes[x].firstChild){
				html = html + spaceMaker(text.childNodes[x].firstChild.nodeValue);
				currentIndex += spaceMaker(text.childNodes[x].firstChild.nodeValue).length;
			} else if(text.childNodes[x].nodeName=='textEntryInteraction'){
				var indexes = currentIndex + "|";
				fillin.push(text.childNodes[x].getAttribute('responseIdentifier'));
				html = html + retrieveInteractionText(text.childNodes[x].getAttribute('responseIdentifier'));
				currentIndex += retrieveInteractionText(text.childNodes[x].getAttribute('responseIdentifier')).length;
				indexes += currentIndex;
				fillinIndexes.push(indexes);
			};
		};
	};
	fullText = html;
	return html;
};

/**
 * Ensures that the index of the modification does not
 * overlap with any current fillins.
 */
function validate(){
	var start = document.getElementById('questionInput').selectionStart + 1;
	var end = document.getElementById('questionInput').selectionEnd + 1;
	
	if(overlaps(start, end)){
		alert('You can not change this text because it is part of a fillin! If you want to change/edit/remove the fillin text, then do so below.');
		return false;
	};
	return true;
};

/**
 * Returns the difference in the number of characters from
 * previous textarea and current modified textarea
 */
function getDifference(){
	return charCount - document.getElementById('questionInput').value.length;
};

/**
 * Creates and returns a table with the existing fillins
 */
function generateFillins(){
	var fillinTable = createElement(document, 'table', {id: 'fillinTable'});
	var headerRow = createElement(document, 'tr', {id: 'headerRow'});
	var fillinTD = createElement(document, 'td', {id: 'fillinTD'});
	var placeholderAllowableTD = createElement(document, 'td', {id: 'allowableTable'});
	
	//cycle through existing fillins and create and append
	//the appropriate elements to the the fillinTD
	for(var g=0;g<fillin.length;g++){
		var endStart = fillinIndexes[g].split('|');
		var text = document.createTextNode('Blank #' + (g + 1) + ':');
		var removeButton = createElement(document, 'input', {type: 'button', value: 'Remove Fillin', onclick: 'removeFillin()'});
		var radio = createElement(document, 'input', {type: 'radio', id: 'radio_' + g, value: fillin[g], name: 'fillinRadio', onclick: 'fillinClick("' + fillin[g] + '", ' + g + ')'});
		var input = createElement(document, 'input', {type: 'text', id: 'input_' + g, name: 'input_' + g, onclick: 'fillinClick("' + fillin[g] + '", ' + g + ')', onkeyup: 'changeSelected(' + g + ')', value: fullText.substring(endStart[0], endStart[1])});
		
		fillinTD.appendChild(createBreak());
		fillinTD.appendChild(text);
		fillinTD.appendChild(radio);
		fillinTD.appendChild(input);
	};
	
	fillinTD.appendChild(createBreak());
	if(removeButton){
		fillinTD.appendChild(removeButton);
	};
	headerRow.appendChild(fillinTD);
	headerRow.appendChild(placeholderAllowableTD);
	fillinTable.appendChild(headerRow);
	return fillinTable;
};

/**
 * Updates the fillin responseDeclaration and allowable answers when text
 * changes and updates text area to reflect changes
 */
function changeSelected(index){
	var inputElement = document.getElementById('input_' + index);
	var value = inputElement.value;
	var declaration = xmlPage.getElementsByTagName('responseDeclaration')[index];
	var correct = declaration.getElementsByTagName('correctResponse')[0].getElementsByTagName('value')[0];
	
	if(value!=correct.firstChild.nodeValue){ //then text has changed and we must update, mustn't we
		correct.firstChild.nodeValue = value;
		declaration.getElementsByTagName('mapping')[0].getElementsByTagName('mapEntry')[0].setAttribute('mapKey', value);
		document.getElementById('entryInput_0').value = value;
		document.getElementById('questionInput').value = generateFullText();
		updatePreview();
	};
};

/**
 * Removes fillin responseDeclaration and textEntryInteraction with
 * the given identifier
 */
function removeFillin(){
	var identifier = getSelectedIdentifier();
	
	if(identifier){
		var declarations = xmlPage.getElementsByTagName('responseDeclaration');
		var foundIndex;
		
		//find the right location to remove because the remainder will need to be upddated
		for(var h=0;h<declarations.length;h++){
			if(declarations[h].getAttribute('identifier')==identifier){ // this is it, need to remove and update remaining identifiers
				var parent = xmlPage.getElementsByTagName('assessmentItem')[0];
				parent.removeChild(getDeclaration(identifier));
				
				parent = xmlPage.getElementsByTagName('itemBody')[0];
				parent.removeChild(getInteraction(identifier));
				foundIndex = h;
			};
		};
		
		//now update remaining
		for(var t=0;t<declarations.length;t++){
			if(t>=foundIndex){
				decrementIdentifiers(declarations[t]);
			};
		};
		
		generatePage();
		updatePreview();
	} else {
		alert('Please select a fillin that you wish to remove first');
	};
};

function decrementIdentifiers(declaration){
	var interactions = xmlPage.getElementsByTagName('textEntryInteraction');
	var identifier = declaration.getAttribute('identifier');
	var newNum = parseInt(identifier.substring(identifier.length - 1, identifier.length)) - 1;
	declaration.setAttribute('identifier', 'response_' + newNum);
		
	for(var z=0;z<interactions.length;z++){
		if(interactions[z].getAttribute('responseIdentifier')==identifier){
			interactions[z].setAttribute('responseIdentifier', 'response_' + newNum);
			break;
		};
	};
};

/**
 * Detects which fillin element is currently selected and 
 * returns the associated identifier
 */
 function getSelectedIdentifier(){
 	var identifier;
 	var checked = document.getElementsByName('fillinRadio');
	
	for(var x=0;x<checked.length;x++){
		if(checked[x].checked){
			identifier = checked[x].value;
		};
	};
	
	return identifier;
 };

/**
 * Detects which fillin element is currently selected and
 * returns it's index
 */
 function getSelectedIndex(){
 	var checked = document.getElementsByName('fillinRadio');
 	
 	for(var x=0;x<checked.length;x++){
 		if(checked[x].checked){
 			return x;
 		};
 	};
 };

/**
 * When fillin is clicked, sets the clicked fillin as selected and
 * generates the associated allowable answers table
 */
function fillinClick(identifier, index){
	var parent = document.getElementById('headerRow');
	
	//set the associated fillin as selected
	document.getElementById('radio_' + index).checked = true;
	
	//clear previous allowableTable
	parent.removeChild(document.getElementById('allowableTable'));
	
	//generate new allowableTable
	parent.appendChild(generateAllowableAnswers(identifier));
};

/**
 * returns the text associated with the given identifier of a
 * textEntryInteraction
 */
function retrieveInteractionText(identifier){
	var declaration = getDeclaration(identifier);
	return spaceMaker(declaration.getElementsByTagName('correctResponse')[0].getElementsByTagName('value')[0].firstChild.nodeValue);
};

/**
 * Generates and returns a TD element that contains the allowable
 * answers and editing options that are associated with the given
 * identifier
 */
function generateAllowableAnswers(identifier){
	var allowableTD = createElement(document, 'td', {id: 'allowableTable'});
	var allowableText = document.createTextNode('Edit/add allowable answers for blank #' + getLineNumber(identifier));
	var declaration = getDeclaration(identifier);
	var addButton = createElement(document, 'input', {type: 'button', value: 'Add New', onclick: 'addNewAllowable("' + identifier + '")'});
	
	allowableTD.appendChild(allowableText);
	var mapEntries = declaration.getElementsByTagName('mapEntry');
	for(var i=0;i<mapEntries.length;i++){
		if(mapEntries[i].getAttribute('mappedValue')>0){
			var entryInput = createElement(document, 'input', {type: 'text', id: 'entryInput_' + i, onkeyup: 'entryChanged(' + i + ')'});
			entryInput.value = mapEntries[i].getAttribute('mapKey');
			var removeButton = createElement(document, 'input', {type: 'button', id: 'entryButton_' + i, value: 'remove', onclick: 'removeAllowable("' + identifier + '", ' + i + ')'});
			allowableTD.appendChild(createBreak());
			allowableTD.appendChild(entryInput);
			if(i!=0){
				allowableTD.appendChild(removeButton);
			};
		};
	};
	allowableTD.appendChild(createBreak());
	allowableTD.appendChild(addButton);
	return allowableTD;
};

/**
 * Returns the blank number associated with this identifier
 */
function getLineNumber(identifier){
	return parseInt(identifier.substring(identifier.length - 1, identifier.length)) + 1;
};

/**
 * Changes the appropriate mapping when an allowable answer is modified
 */
 function entryChanged(index){
 	var entryElement = document.getElementById('entryInput_' + index);
 	var value = entryElement.value;
 	var identifier = getSelectedIdentifier();
 	var declaration = getDeclaration(identifier);
 	var interaction = getInteraction(identifier);
 	
 	var mapEntry = declaration.getElementsByTagName('mapEntry')[index];
 	if(mapEntry.getAttribute('mapKey')!=value){
 		mapEntry.setAttribute('mapKey', value);
 		if(index==0){ //then this is also the most correctResponse and also needs to be updated
 			declaration.getElementsByTagName('correctResponse')[0].getElementsByTagName('value')[0].firstChild.nodeValue = value;
 			document.getElementById('input_' + getSelectedIndex()).value = value;
 			document.getElementById('questionInput').value = generateFullText();
 		};
 		
 		//extend the expected lines if necessary
 		if(interaction.getAttribute('expectedLength') < value.length){
 			interaction.setAttribute('expectedLength', value.length + 2);
 		};
 		updatePreview();
 	};
 };

/**
 * Removes an allowable answer for the responseDeclaration given the
 * identifier and the index of the allowable input
 */
 function removeAllowable(identifier, index){
 	var declaration = getDeclaration(identifier);
 	var entry = declaration.getElementsByTagName('mapEntry')[index];
 	var parent = document.getElementById('allowableTable').parentNode;
 	
 	declaration.getElementsByTagName('mapping')[0].removeChild(entry);
 	parent.removeChild(document.getElementById('allowableTable'));
 	parent.appendChild(generateAllowableAnswers(getSelectedIdentifier()));
 	updatePreview();
 };

/**
 * Adds a new allowable answer for the responseDeclaration associated
 * with the given identifier
 */
 function addNewAllowable(identifier){
 	var declaration = getDeclaration(identifier);
 	var parent = document.getElementById('allowableTable').parentNode;
 	var newEntry = xmlPage.createElement('mapEntry');
 	
 	newEntry.setAttribute('mapKey', '');
 	newEntry.setAttribute('mappedValue', '1');
 	declaration.getElementsByTagName('mapping')[0].appendChild(newEntry);
 	parent.removeChild(document.getElementById('allowableTable'));
 	parent.appendChild(generateAllowableAnswers(identifier));
 	updatePreview();
 };

/**
 * Given an identifier, returns the associated responseDeclaration
 * element from the xmlPage
 */
 function getDeclaration(identifier){
 	var declaration;
 	var declarations = xmlPage.getElementsByTagName('responseDeclaration');
 	
 	for(var t=0;t<declarations.length;t++){
 		if(declarations[t].getAttribute('identifier')==identifier){
 			declaration = declarations[t];
 		};
 	};
 	return declaration;
 };
 
 /**
  * Given an identifier, returns the associated textEntryInteraction
  * element from the xmlPage
  */
  function getInteraction(identifier){
  	var interaction
  	var textInteractions = xmlPage.getElementsByTagName('textEntryInteraction');
  	
  	for(var a=0;a<textInteractions.length;a++){
		if(textInteractions[a].getAttribute('responseIdentifier')==identifier){
			interaction = textInteractions[a];
		};
	};
	
	return interaction;
  };

/**
 * Creates a new fillin based on the selected text
 * in the questionInput textarea
 */
function createFillin(){
	var start = document.getElementById('questionInput').selectionStart;
	var end = document.getElementById('questionInput').selectionEnd;
	
	//make sure there are no overlaps
	if(overlaps(start, end)){
		alert('The existing selection overlaps with another fillin. Either edit the existing fillin or remove it before proceeding. Exiting...');
		return;
	};
	
	//make sure text is selected
	if(start==end){
		alert('Please select some text before creating a fillin. Exiting...');
		return;
	};
	
	//determine the location to insert new responseDeclaration in xmlPage
	var location = 0;
	for(var k=0;k<fillinIndexes.length;k++){
		var startEnd = fillinIndexes[k].split('|');
		location = k;
		if(start<startEnd[0]){
			break;
		};
		if(k==fillinIndexes.length - 1){
			location = k + 1;
		};
	};
	
	//then update xmlPage (textentry interaction, responsedeclaration, refresh)
	var identifier = 'response_' + location;
	createResponseDeclaration(identifier, fullText.substring(start, end), location);
	createTextInteraction(identifier, start, end, fullText.substring(start, end));
	generatePage();
	updatePreview();
};

/**
 * Creates a qti type responseDeclaration (for an assesmentItem) given
 * an identifier and a correctResponse
 */
function createResponseDeclaration(identifier, correctResponse, location){
	var parent = xmlPage.getElementsByTagName('assessmentItem')[0];
	var nextNode;
	var declarations = xmlPage.getElementsByTagName('responseDeclaration');
	var interactions = xmlPage.getElementsByTagName('textEntryInteraction');
	
	//get nextNode to insert responseDeclaration in right place and change identifiers for 
	//existing declarations appropriately as well as their associated textEntryInteractions
	//the following code assumes that both responseDeclarations and textEntryInteractions are
	//ordered the same
	if(declarations.length>0 && location < declarations.length){
		nextNode = declarations[location];
		for(var s=location;s<declarations.length;s++){
			declarations[s].setAttribute('identifier', 'response_' + (s + 1));
			interactions[s].setAttribute('responseIdentifier', 'response_' + (s + 1));
		};
	} else { //no declarations exist or this will be the last, insert before outcomeDeclaration
		nextNode = xmlPage.getElementsByTagName('outcomeDeclaration')[0];
	};
	
	//create declaration with appropriate attributes and childNodes
	var declaration = xmlPage.createElement('responseDeclaration');
	var responseElement = xmlPage.createElement('correctResponse');
	var responseValue = xmlPage.createElement('value');
	var valueText = xmlPage.createTextNode(correctResponse);
	var mappingElement = xmlPage.createElement('mapping');
	var mappingEntry = xmlPage.createElement('mapEntry');
	
	declaration.setAttribute('identifier', identifier);
	declaration.setAttribute('cardinality', 'single');
	declaration.setAttribute('baseType', 'string');
	
	mappingElement.setAttribute('defaultValue', '0');
	
	mappingEntry.setAttribute('mapKey', correctResponse);
	mappingEntry.setAttribute('mappedValue', '1');
	
	mappingElement.appendChild(mappingEntry);
	responseValue.appendChild(valueText);
	responseElement.appendChild(responseValue);
	declaration.appendChild(responseElement);
	declaration.appendChild(mappingElement);
	
	parent.insertBefore(declaration, nextNode);
};

/**
 * Given an identifier that is associated with a responseDeclaration,
 * the start and end indexes of the characters in the full text that 
 * were selected by the user and the actual text between those points,
 * creates a textEntryInteraction element in the xmlPage at the appropriate
 * point and modifies the existing elements to accomodate the changes
 */
function createTextInteraction(identifier, start, end, fillinText){
	var textInteraction = xmlPage.createElement('textEntryInteraction');
	textInteraction.setAttribute('identifier', identifier);
	textInteraction.setAttribute('expectedLength', (end - start) + 2);
	
	var runningText = '';
	var body = xmlPage.getElementsByTagName('itemBody')[0];
	for(var x=0;x<body.childNodes.length;x++){
		if(body.childNodes[x].nodeName!="#text"){
			if(body.childNodes[x].nodeName=='htmltext' && body.childNodes[x].firstChild){
				//grab current text
				var currentText = spaceMaker(body.childNodes[x].firstChild.nodeValue);
				//if start and end is included - then we need to modify existing element
				//and insert new element here
				if((runningText + currentText).length > start){ 
					var interaction = xmlPage.createElement('textEntryInteraction');
					var nextNode = body.childNodes[x].nextSibling;
					var remainder = xmlPage.createElement('htmltext');
					var remainderText = xmlPage.createTextNode(currentText.substring(end - runningText.length, (runningText + currentText).length));
					
					interaction.setAttribute('responseIdentifier', identifier);
					interaction.setAttribute('expectedLength', (end - start) + 2);
					body.childNodes[x].firstChild.nodeValue = currentText.substring(0, start - runningText.length);
					remainder.appendChild(remainderText);
					if(nextNode!=null){
						body.insertBefore(interaction, nextNode);
						body.insertBefore(remainder, nextNode);
					} else {
						body.appendChild(interaction);
						body.appendChild(remainder);
					};
					return;
				} else {
					runningText += currentText;
				};
			} else if(body.childNodes[x].nodeName=='textEntryInteraction'){
				runningText += retrieveInteractionText(body.childNodes[x].getAttribute('responseIdentifier'));
			};
		};
	};
};

/**
 * if the provided start or end overlaps with an existing fillin
 * this function returns true, otherwise, returns false
 */
function overlaps(start, end){
	var runningText = '';
	var body = xmlPage.getElementsByTagName('itemBody')[0];
	var difference = getDifference();
	var realStart;
	var realEnd;
	
	if(difference > 0){ //deleting text
		realStart = start;
		realEnd = end + difference;
	} else { //adding text
		realStart = start + difference - 1;
		realEnd = end - 1;
	};
		
	if(difference==0){//no change
		return false;
	} else {//changed look for overlap
		for(var x=0;x<body.childNodes.length;x++){
			if(body.childNodes[x].nodeName!="#text"){
				if(body.childNodes[x].nodeName=='htmltext' && body.childNodes[x].firstChild){
					runningText += spaceMaker(body.childNodes[x].firstChild.nodeValue);
				} else if(body.childNodes[x].nodeName=='textEntryInteraction'){
					var currentText = retrieveInteractionText(body.childNodes[x].getAttribute('responseIdentifier'));
					var fullLength = (runningText + currentText).length;
					if((runningText.length > realStart && runningText.length < realEnd) || (fullLength > realStart && runningText < realEnd)){
						return true;
					};
					if(realStart >= runningText.length && realStart < fullLength){
						return true;
					};
					runningText += currentText;
				};
			};
		};
	};
	return false;
};

/**
 * Returns a string with all '&nbsp;' replaced with a space
 */
function spaceMaker(text){
	return text.toString().replace(/&nbsp;/g, ' ');
};

function sourceUpdated() {
	if(validate()){
		var difference = getDifference();
		//alert(difference);
		if(difference==0){ //do nothing, no changes
			return;
		} else if(difference>0){ //text has been removed
			saved = false;
			var start = document.getElementById('questionInput').selectionStart;
			var end = start + difference;
			var body = xmlPage.getElementsByTagName('itemBody')[0];
			var runningText = '';
			//alert('s ' + start + '   e ' + end);
			for(var x=0;x<body.childNodes.length;x++){
				if(body.childNodes[x].nodeName!="#text"){
					if(body.childNodes[x].nodeName=='htmltext' && body.childNodes[x].firstChild){
						var currentText = spaceMaker(body.childNodes[x].firstChild.nodeValue);
						//alert('current ' + currentText + '  total len ' + (runningText + currentText).length);
						if(start <= (runningText + currentText).length){ //this is where the change was made, update text
							if(end <= (runningText + currentText).length){ //entire deletion occurs within this node
								body.childNodes[x].firstChild.nodeValue = currentText.substring(0, start - runningText.length) + currentText.substring(end - runningText.length, currentText.length);
								charCount -= difference;
								generateFullText();
								updatePreview();
								return;
							} else { //deletion goes beyond this node
								body.childNodes[x].firstChild.nodeValue = currentText.substring(0, start - runningText.length);
								runningText += currentText;
								start = runningText.length
							};
						} else { //keep looking, the change was not here
							runningText += currentText;
						};
					} else if(body.childNodes[x].nodeName=='textEntryInteraction'){ //should never be the case that changed text is here, validate won't allow it.
						runningText += retrieveInteractionText(body.childNodes[x].getAttribute('responseIdentifier'));
					};
				};
			};
			charCount -= difference;
			generateFullText();
			updatePreview();
		} else { //text has been added
			saved = false;
			var end = document.getElementById('questionInput').selectionStart;
			var start = end + difference;
			var newText = document.getElementById('questionInput').value.substring(start, end); //get new chars
			var body = xmlPage.getElementsByTagName('itemBody')[0];
			var runningText = '';
			//alert('s ' + start + '  e ' + end + '  newText ' + newText);
			//start += 1;
			if(body.childNodes.length>0 && (body.getElementsByTagName('htmltext').length > 0 || body.getElementsByTagName('textEntryInteraction').length > 0)){
				for(var x=0;x<body.childNodes.length;x++){
					if(body.childNodes[x].nodeName!="#text"){
						if(body.childNodes[x].nodeName=='htmltext'){
							if(body.childNodes[x].firstChild){
								var currentText = spaceMaker(body.childNodes[x].firstChild.nodeValue);
								//alert('total l ' + (runningText + currentText).length + '  s ' + start + '  e ' + end);
								if(start <= (runningText + currentText).length){ //this is where the change was made, update text
									body.childNodes[x].firstChild.nodeValue = currentText.substring(0, start - runningText.length) + newText + currentText.substring(start - runningText.length, currentText.length);
									charCount += newText.length;
									generateFullText();
									updatePreview();
									return;
								} else {
									runningText += currentText;
								};
							} else { // no data in prompt - if this is the location add it here
								var newTextNode = xmlPage.createTextNode(newText);
								body.childNodes[x].appendChild(newTextNode);
								charCount += newText.length;
								generateFullText();
								updatePreview();
								return;
							};
						} else if(body.childNodes[x].nodeName=='textEntryInteraction'){
							runningText += retrieveInteractionText(body.childNodes[x].getAttribute('responseIdentifier'));
						};
					};
				};
			} else {
				var newTextNode = xmlPage.createTextNode(newText);
				var newTextEl = xmlPage.createElement('htmltext');
				newTextEl.appendChild(newTextNode);
				body.appendChild(newTextEl);
				charCount += newText.length;
				generateFullText();
				updatePreview();
				return;
			};
		};
	} else {
		generatePage();
	};
};

function updatePreview(){
	saved = false;
	
	window.frames["previewFrame"].loadFromXMLString(xmlDoc);
};

/**
 * Load the authoring view from the specified filename
 * filename points to a plain old file.
 */
function loadAuthoringFromFile(filename, projectName, projectPath, pathSeparator) {
	var callback =
	{
	  success: function(o) { 
	  var xmlDocToParse = o.responseXML;
	  
		/**
		 * sets local xml and then generates the left panel
		 * of this page dynamically
		 */
		xmlPage = xmlDocToParse;
		generatePage();
		
		window.frames["previewFrame"].loadFromXMLString(xmlPage);

	  },
		  failure: function(o) { alert('failure');},
		  scope: this
	}
	
	YAHOO.util.Connect.asyncRequest('POST', '../filemanager.html', callback, 'command=retrieveFile&param1=' + projectPath + pathSeparator + filename);
}
//used to notify scriptloader that this script has finished loading
scriptloader.scriptAvailable(scriptloader.baseUrl + "vle/author/js/fillin_easy.js");