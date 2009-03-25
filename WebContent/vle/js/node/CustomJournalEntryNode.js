/*
 * CustomJournalEntryNode is an open_response
 * author: patrick lawler
 */

CustomJournalEntryNode.prototype = new JournalEntryNode();
CustomJournalEntryNode.prototype.constructor = CustomJournalEntryNode;
CustomJournalEntryNode.prototype.parent = JournalEntryNode.prototype;
function CustomJournalEntryNode(nodeType) {
	this.type = nodeType;
	this.vle;
}

CustomJournalEntryNode.prototype.render = function(contentpanel){
	var states = [];
	for (var i=0; i < this.vle.state.visitedNodes.length; i++) {
		var nodeVisit = this.vle.state.visitedNodes[i];
		if (nodeVisit.node.id == this.id) {
			for (var j=0; j<nodeVisit.nodeStates.length; j++) {
				states.push(nodeVisit.nodeStates[j]);
			}
		}
	}
	window.parent.parent.frames["journaliframe"].frames["journalentryiframe"].loadContentXMLString(this.element);
	window.parent.parent.frames["journaliframe"].frames["journalentryiframe"].loadStateAndRender(this.vle, states);
}


CustomJournalEntryNode.prototype.load = function() {
	alert("loading JournalEntryNode");
}

CustomJournalEntryNode.prototype.setCurrentNode = function() {
	if (this.vle.audioManager != null) {
		this.vle.audioManager.setCurrentNode(this);
	}
}