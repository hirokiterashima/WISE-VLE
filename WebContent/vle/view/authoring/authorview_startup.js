/**
 * @author patrick lawler
 * @author jonathan breitbart
 */

/**
 * Sets variables so that the authoring tool is running in portal mode
 * and starts authoring tool in appropriate state.
 */
View.prototype.startPortalMode = function(url, curriculumBaseDir, command, id){
	this.portalUrl = url;
	this.portalCurriculumBaseDir = curriculumBaseDir;
	this.primaryPath = curriculumBaseDir;
	this.editingPollInterval = setInterval('eventManager.fire("whoIsEditing")', this.EDITING_POLL_TIME);
	this.authoringBaseUrl = this.portalUrl + '?forward=filemanager&command=retrieveFile&param1=';
	this.requestUrl = this.portalUrl;
	this.assetRequestUrl = this.portalUrl;
	this.minifierUrl = this.portalUrl;
	this.mode = "portal";

	//create the config url
	var configUrl = this.portalUrl + "?command=getConfig";
	
	//create the config
	this.config = this.createConfig(createContent(configUrl));
	
	if(this.config != null) {
		//set some variables from values in the config
		this.portalUsername = this.config.getConfigParam("username");
		this.vlewrapperBaseUrl = this.config.getConfigParam("vlewrapperBaseUrl");
	}
	
	if(command && command!=''){
		if(command=='cleanProject'){
			this.cleanMode = true;
		}
		
		if(command=='createProject'){
			this.createMode = true;
		} else if(command=='editProject' || command=='cleanProject'){
			var pathId = id.split('~');
			this.portalProjectId = pathId[1];
			this.authoringBaseUrl = this.portalUrl + '?forward=filemanager&projectId=' + this.portalProjectId + '&command=retrieveFile&param1=';
			var projectUrl = this.authoringBaseUrl + this.portalCurriculumBaseDir + pathId[0];
			this.loadProject(projectUrl, this.utils.getContentBaseFromFullUrl(projectUrl), true);
		}
	}
	
	this.onAuthoringToolReady();
	
	/* launch create project dialog if create mode has been set */
	if(this.createMode){
		this.createNewProject();
	}
	
	/* enable the edit project tags  (only available in portal mode) */
	//$('#editProjectTagsMenu').show();
};

/**
 * Creates a project of the given name with the given path in the portal
 */
View.prototype.createPortalProject = function(path, name, parentProjectId){
	var handler = function(responseText, responseXML, o){
		if(responseText){
			o.portalProjectId = responseText;
			o.authoringBaseUrl = o.portalUrl + '?forward=filemanager&projectId=' + o.portalProjectId + '&command=retrieveFile&param1=';
				
			/* load the newly created project */
			o.loadProject(o.authoringBaseUrl + o.portalCurriculumBaseDir + path, o.utils.getContentBaseFromFullUrl(o.authoringBaseUrl + o.portalCurriculumBaseDir + path), false);
		} else {
			o.notificationManager.notify('failed to create project in portal', 3);
		};
	};
	
	//remove base dir
	path = path.substring(this.portalCurriculumBaseDir.length, path.length);
	this.connectionManager.request('POST', 3, this.portalUrl, {command: 'createProject', param1: path, param2: name, parentProjectId: parentProjectId}, handler, this);
};

/**
 * Retrieves and parses settings.xml file for project paths, primaryPath locations.
 */
View.prototype.getProjectPaths = function(){
	var callback = function(text, xml, o){
		var settingsJSON = $.parseJSON(text);
		if(settingsJSON){
			/* get the mode that the authoring tool is to run in (portal/standalone) */
			if(settingsJSON.mode && settingsJSON.mode.portal && settingsJSON.mode.portalUrl) {
				var rawLoc = window.location.toString();
				var loginUrl = rawLoc.substring(0,rawLoc.indexOf('/vlewrapper/vle/author.html')) + settingsJSON.mode.portalUrl + '?redirect=/author/authorproject.html';
				window.location = loginUrl;
			}
			
			if(settingsJSON.projectPaths) {
				for(var u=0;u<settingsJSON.projectPaths.length;u++){
					if(settingsJSON.projectPaths[u]){
						o.projectPaths += settingsJSON.projectPaths[u];
						if(u!=settingsJSON.projectPaths.length-1){
							o.projectPaths += '~';
						}
					}
				}
			}
			
			if(settingsJSON.primaryPath) {
				o.primaryPath = settingsJSON.primaryPath;
				o.projectPaths += '~' + settingsJSON.primaryPath;
			} else {
				o.notificationManager.notify("Error: Primary Path not specified in settings.json");
			}
			
		} else {
			o.notificationManager.notify("Error retrieving settings", 3);
		}
		
		o.onAuthoringToolReady();
	};

	this.connectionManager.request('GET', 1, 'settings.json', null, callback, this);
};

/**
 * Attempts to retrieve the current user's username from the portal
 */
View.prototype.getPortalUsername = function(){
	if(this.portalUrl){
		this.connectionManager.request('POST', 1, this.portalUrl, {command: 'getUsername'}, this.getUsernameSuccess, this);
	};
};

/**
 * Sets this view's username if successfully retrieved from the portal
 */
View.prototype.getUsernameSuccess = function(t,x,o){
	if(t && t!=''){
		o.portalUsername = t;
	};
};

/**
 * Request the curriculum base url
 */
View.prototype.getCurriculumBaseUrl = function(){
	if(this.portalUrl){
		this.connectionManager.request('POST', 1, this.portalUrl, {command: 'getCurriculumBaseUrl'}, this.getCurriculumBaseUrlSuccess, this);
	};
};

/**
 * Called when we receive the response from the curriculum base url request
 * @param t
 * @param x
 * @param o
 * @return
 */
View.prototype.getCurriculumBaseUrlSuccess = function(t,x,o){
	if(t && t!=''){
		//set the vlewrapper base url into the view
		o.vlewrapperBaseUrl = t;
		
		//set the authoring mode to true in the view
		o.authoringMode = true;
	};
};

/**
 * Removes the splash screen and shows the authoring tool when all
 * necessary parts have loaded.
 * Creates authoring config
 */
View.prototype.onAuthoringToolReady = function(){
	notificationManager.setMode('authoring');
	$('#centeredDiv').show();
	$('#coverDiv').hide();
	$('#overlay').hide();
	//clearInterval(window.loadingInterval);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/authorview_startup.js');
};