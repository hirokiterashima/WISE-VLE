/**
 * Utility functions specific to the VLE view
 */
View.prototype.utils.setStyleOnElement = function(elementToHighlight, styleName, styleValue){
	if (elementToHighlight && elementToHighlight != null) {
		elementToHighlight.setStyle(styleName, styleValue);
	};
};

/**
 * Closes currently-opened dialogs. If a name is specified, it closes the specified popup.
 * @name optional, name of the poup. if none specified, 
 * tries to close all popups. Choices: {note, journal}
 */
View.prototype.utils.closeDialogs = function(name){
	if (name != null) {
		this.closeDialog(name);
	} else {
		this.closeDialog('journalPanel');
		this.closeDialog('notePanel');
		this.closeDialog('hintsPanel');
		console.log('closeDialogs');
	}
};

/**
 * closes specified dialog.
 */
View.prototype.utils.closeDialog = function(name){
	$('#' + name).dialog('close');
};

/**
 * Resize the given panel to the values for the given size
 * @param panel - the panel that we want to resize
 */
View.prototype.utils.resizePanel = function(panelname, size){
	var maxHeight = $(window).height()*.97;
	var maxWidth = $(window).width()*.97;
	var centeredTop = $(window).height()/2-maxHeight/2-4;
	var centeredLeft = $(window).width()/2-maxWidth/2-4;
	var titlebarHeight = $("#" + panelname).prev().height();
	
	if(size == "minimize") {
		//resize the note to only display the resize buttons
		$('#' + panelname).parent().css({height:'100px',width:'430px'});
		$("#" + panelname).css({height:100-titlebarHeight + 'px'});
	} else if(size == "original") {
		//resize the note to display all the note elements easily
		$('#' + panelname).parent().css({height:'450px',width:'650px'});
		$("#" + panelname).css({height:450-titlebarHeight + 'px'});
	} else if(size == "narrow") {
		//resize the note to fit over the left nav area
		$('#' + panelname).parent().css({height:maxHeight + 'px',width:'215px', top:centeredTop + 'px'});
		$("#" + panelname).css({height:maxHeight-titlebarHeight + 'px'});
	} else if(size == "wide") {
		//resize the note to be short and wide
		$('#' + panelname).parent().css({height:'200px',width:maxWidth + 'px', left:centeredLeft + 'px'});
		$("#" + panelname).css({height:200-titlebarHeight + 'px'});
	} else if(size == "maximize") {
		//resize the note to fit over the whole vle
		$('#' + panelname).parent().css({height:maxHeight + 'px', width:maxWidth + 'px', top:centeredTop + 'px', left:centeredLeft + 'px'});
		$("#" + panelname).css({height:maxHeight-titlebarHeight + 'px'});
	}
};

/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/vle/vleview_utils.js');
};