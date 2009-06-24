/**
 * Object for storing VLE Configuration
 * These include:
 * - postDataUrl, where to post student data
 * - getDataUrl, where to get the student data from
 * - contentUrl, where the .project file is
 * - contentBaseUrl, base url of content
 * - userInfoUrl, where to get user information
 * - theme, currently only UCCP and WISE are allowed
 */
function VLEConfig() {
	this.mode;
	this.runId;
	this.postDataUrl;
	this.getDataUrl;
	this.contentUrl;
	this.contentBaseUrl;
	this.userInfoUrl;
	this.runInfoUrl;
	this.runInfoRequestInterval;
	this.getFlagsUrl;
	this.theme;
}

/**
 * function for parsing the response into attributes.
 * @param response
 * @return
 */
VLEConfig.prototype.parse = function(responseXML) {
	this.mode = responseXML.getElementsByTagName("mode")[0].firstChild.nodeValue;
	this.contentUrl = responseXML.getElementsByTagName("contentUrl")[0].firstChild.nodeValue;
	this.contentBaseUrl = responseXML.getElementsByTagName("contentBaseUrl")[0].firstChild.nodeValue;
	this.userInfoUrl = responseXML.getElementsByTagName("userInfoUrl")[0].firstChild.nodeValue;
	this.runId = responseXML.getElementsByTagName('runId')[0].firstChild.nodeValue;
	this.theme = responseXML.getElementsByTagName('theme')[0];

	if (responseXML.getElementsByTagName('startNode') &&
			responseXML.getElementsByTagName('startNode')[0] != null) {
		this.startNode = responseXML.getElementsByTagName('startNode')[0].firstChild.nodeValue;
	}
	
	if (responseXML.getElementsByTagName('mainNav') &&
			responseXML.getElementsByTagName('mainNav')[0] != null) {
		this.mainNav = responseXML.getElementsByTagName('mainNav')[0].firstChild.nodeValue;
	}
	
	//check to make sure theme was defined in xml, if so, check to see if value is valid and set it,
	//otherwise default to WISE as a theme.
	if(this.theme != null && this.theme.firstChild && this.isValidTheme(this.theme.firstChild.nodeValue)){
		this.theme = this.theme.firstChild.nodeValue;
	} else {
		this.theme = 'WISE';
	};
	
	if (this.mode == "run") {
		this.getFlagsUrl = responseXML.getElementsByTagName("getFlagsUrl")[0].firstChild.nodeValue;
		this.getDataUrl = responseXML.getElementsByTagName("getDataUrl")[0].firstChild.nodeValue;
		this.postDataUrl = responseXML.getElementsByTagName("postDataUrl")[0].firstChild.nodeValue;
		this.runInfoUrl = responseXML.getElementsByTagName("runInfoUrl")[0].firstChild.nodeValue;
		this.runInfoRequestInterval = responseXML.getElementsByTagName("runInfoRequestInterval")[0].firstChild.nodeValue;
	}
}

/**
 * Returns true if theme is an allowableTheme, false otherwise
 */
VLEConfig.prototype.isValidTheme = function(theme){
	var allowableThemes = ['UCCP', 'WISE'];
	return allowableThemes.contains(theme);
};

//used to notify scriptloader that this script has finished loading
scriptloader.scriptAvailable(scriptloader.baseUrl + "vle/config/vleconfig.js");