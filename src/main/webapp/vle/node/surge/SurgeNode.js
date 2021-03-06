SurgeNode.prototype = new Node();
SurgeNode.prototype.constructor = SurgeNode;
SurgeNode.prototype.parent = Node.prototype;

/*
 * the name that displays in the authoring tool when the author creates a new step
 */
SurgeNode.authoringToolName = "Surge"; 

/*
 * will be seen by the author when they add a new step to their project to help
 * them understand what kind of step this is
 */
SurgeNode.authoringToolDescription = "This is a generic step only used by developers";

/**
 * This is the constructor for the Node
 * 
 * @param nodeType
 * @param view
 */
function SurgeNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
}

/**
 * This function is called when the vle loads the step and parses
 * the previous student answers, if any, so that it can reload
 * the student's previous answers into the step.
 * 
 * @param stateJSONObj
 * @return a new state object
 */
SurgeNode.prototype.parseDataJSONObj = function(stateJSONObj) {
	return SurgeState.prototype.parseDataJSONObj(stateJSONObj);
};

/**
 * This function is called if there needs to be any special translation
 * of the student work from the way the student work is stored to a
 * human readable form. For example if the student work is stored
 * as an array that contains 3 elements, for example
 * ["apple", "banana", "orange"]
 *  
 * and you wanted to display the student work like this
 * 
 * Answer 1: apple
 * Answer 2: banana
 * Answer 3: orange
 * 
 * you would perform that translation in this function.
 * 
 * Note: In most cases you will not have to change the code in this function
 * 
 * @param studentWork
 * @return translated student work
 */
SurgeNode.prototype.translateStudentWork = function(studentWork) {
	return studentWork;
};

/**
 * We do not need to do anything onExit for SURGE since 
 * we are saving state intermediately.
 */
SurgeNode.prototype.onExit = function() {
	//check if the content panel has been set
	/*
	if(this.contentPanel) {
		if(this.contentPanel.save) {
			//tell the content panel to save
			this.contentPanel.save();
		}
	}
	*/
};

/**
 * Renders the student work into the div. The grading tool will pass in a
 * div id to this function and this function will insert the student data
 * into the div.
 * 
 * @param divId the id of the div we will render the student work into
 * @param nodeVisit the student work
 * @param childDivIdPrefix (optional) a string that will be prepended to all the 
 * div ids use this to prevent DOM conflicts such as when the show all work div
 * uses the same ids as the show flagged work div
 * @param workgroupId the id of the workgroup this work belongs to
 * 
 * Note: you may need to add code to this function if the student
 * data for your step is complex or requires additional processing.
 * look at SensorNode.renderGradingView() as an example of a step that
 * requires additional processing
 */
SurgeNode.prototype.renderGradingView = function(divId, nodeVisit, childDivIdPrefix, workgroupId) {
	var gradingText = "";
	// Get all the trials (ie states) for this nodevisit
	var nodeStates = nodeVisit.nodeStates;
	
	if (nodeStates.length > 0) {
		// get the number of trials during this node visit.
		gradingText += "This visit has " + nodeStates.length + " trials.<br/><br/>";
		
		// get the best score
		gradingText += "The best medal earned for this level is "+nodeStates[nodeStates.length-1].getStudentWork().response.outcomeAbsoluteText+"<br/><br/>";
		
		for (var i=0; i<nodeStates.length; i++) {
			// loop through the trials 
			gradingText += "<b>Trial #"+(i+1)+"</b><br/>"
			//gradingText += JSON.stringify(nodeStates[i].getStudentWork().response).replace(/,/gi,",<br/>") + "<br/><br/>";
			gradingText += JSON.stringify(nodeStates[i].getStudentWork().response) + "<br/><br/>";
		}
		//Get the latest student state object for this step
		//var surgeState = nodeVisit.getLatestWork();
		
		/*
		 * get the step work id from the node visit in case we need to use it in
		 * a DOM id. we don't use it in this case but I have retrieved it in case
		 * someone does need it. look at SensorNode.js to view an example of
		 * how one might use it.
		 */
		//var stepWorkId = nodeVisit.id;
		
		//var studentWork = surgeState.getStudentWork();
		
		//put the student work into the div
		$('#' + divId).html(gradingText);
	}
};

/**
 * Get the html file associated with this step that we will use to
 * display to the student.
 * 
 * @return a content object containing the content of the associated
 * html for this step type
 */
SurgeNode.prototype.getHTMLContentTemplate = function() {
	return createContent('node/surge/surge.html');
};

/**
 * Process the student work to see if we need to display a colored
 * star next to the step in the nav menu
 * @param studentWork the student's surge state
 */
SurgeNode.prototype.processStudentWork = function(studentWork) {
	if(studentWork != null) {
		if(studentWork.response != null && studentWork.response != "") {
			var className = "";
			
			//get the top score
			var topScore = studentWork.response.topScore;
			
			if(topScore == 10) {
				className = "bronzeStar";
			} else if(topScore == 20) {
				className = "silverStar";
			} else if(topScore == 30) {
				className = "goldStar";
			}
			
			//display the star next to the step in the nav menu
			eventManager.fire('updateStepRightIcon', [this.id, className]);			
		}
	}
};

//Add this node to the node factory so the vle knows it exists.
NodeFactory.addNode('SurgeNode', SurgeNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/surge/SurgeNode.js');
};