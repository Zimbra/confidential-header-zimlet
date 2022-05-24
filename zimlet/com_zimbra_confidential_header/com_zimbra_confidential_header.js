//Constructor
function com_zimbra_confidential_header_HandlerObject() {
};


com_zimbra_confidential_header_HandlerObject.prototype = new ZmZimletBase();
com_zimbra_confidential_header_HandlerObject.prototype.constructor = com_zimbra_confidential_header_HandlerObject;

com_zimbra_confidential_header_HandlerObject.prototype.toString =
function() {
   return "com_zimbra_confidential_header_HandlerObject";
};

/** 
 * Creates the Zimlet, extends {@link https://files.zimbra.com/docs/zimlet/zcs/8.6.0/jsapi-zimbra-doc/symbols/ZmZimletBase.html ZmZimletBase}.
 * @class
 * @extends ZmZimletBase
 *  */
var ConfHeaderZimlet = com_zimbra_confidential_header_HandlerObject;

/** 
 * This method gets called when Zimbra Zimlet framework initializes.
 */
ConfHeaderZimlet.prototype.init = function() {
   AjxPackage.require({name:"MailCore", callback:new AjxCallback(this, this._applyRequestHeaders)});
   var zimletInstance = appCtxt._zimletMgr.getZimletByName('com_zimbra_confidential_header').handlerObject;
   if(!zimletInstance.sensitivity)
   {
      zimletInstance.sensitivity = [];
   }
   
};

/** This method is called from init and makes a header available
 * See {@link https://files.zimbra.com/docs/zimlet/zcs/8.6.0/jsapi-zimbra-doc/symbols/ZmMailMsg.html#.addRequestHeaders ZmMailMsg.html#.addRequestHeaders}.
 * */
ConfHeaderZimlet.prototype._applyRequestHeaders =
function() {   
   ZmMailMsg.requestHeaders["Sensitivity"] = "Sensitivity";
};

/** This method is called when a message is viewed in Zimbra. 
 * See {@link https://files.zimbra.com/docs/zimlet/zcs/8.6.0/jsapi-zimbra-doc/symbols/ZmZimletBase.html#onMsgView}.
 * @param {ZmMailMsg} msg - an email in {@link https://files.zimbra.com/docs/zimlet/zcs/8.6.0/jsapi-zimbra-doc/symbols/ZmMailMsg.html ZmMailMsg} format
 * @param {ZmMailMsg} oldMsg - unused
 * @param {ZmMailMsgView} msgView - the current ZmMailMsgView (upstream documentation needed)
 * */
ConfHeaderZimlet.prototype.onMsgView = function (msg, oldMsg, msgView) {
   var zimletInstance = appCtxt._zimletMgr.getZimletByName('com_zimbra_confidential_header').handlerObject;
   try {
      var infoBarDiv = document.getElementById(msgView._infoBarId);      
      if (infoBarDiv) {
         if(msg.attrs)
         {
            if(msg.attrs['Sensitivity'])
            {
               var z = document.createElement('div');
               switch(msg.attrs['Sensitivity']) {
                  case 'Personal':
                     z.innerText = '🤐 ' + zimletInstance.getMessage('ConfHeaderZimlet_Personal');
                  break;
                  case 'Private':
                     z.innerText = '🤐 ' + zimletInstance.getMessage('ConfHeaderZimlet_Private');
                  break;
                  default:
                     z.innerText = '🤐 ' + zimletInstance.getMessage('ConfHeaderZimlet_CompanyConfidential');
               }
               z.className = 'ConfHeaderZimlet-infobar';
               infoBarDiv.insertBefore(z, infoBarDiv.firstChild);
            }
         }
      }
   } catch (err)
   {
      console.log(err);
   }
}

/** Add sensitivity buttons to the toolbar in the compose tab. 
  * This method is called by the Zimlet framework when application toolbars are initialized.
  * See {@link https://files.zimbra.com/docs/zimlet/zcs/8.6.0/jsapi-zimbra-doc/symbols/ZmZimletBase.html#initializeToolbar ZmZimletBase.html#initializeToolbar}
  * 
  * @param	{ZmApp}				app				the application
  * @param	{ZmButtonToolBar}	toolbar			the toolbar
  * @param	{ZmController}		controller		the application controller
  * @param	{string}			   viewId			the view Id
 * */
ConfHeaderZimlet.prototype.initializeToolbar =
function(app, toolbar, controller, viewId) {
   var zimletInstance = appCtxt._zimletMgr.getZimletByName('com_zimbra_confidential_header').handlerObject;
   // bug fix #7192 - disable detach toolbar button
   toolbar.enable(ZmOperation.DETACH_COMPOSE, false);   
   
   if(viewId.indexOf("COMPOSE") >=0){
      if (toolbar.getButton('SENSITIVITY'))
      {
         //button already defined
         return;
      }
      var buttonArgs = {
         text: "🤐  " +  zimletInstance.getMessage('ConfHeaderZimlet_sensitivityBtn'),
         index: 1,
         showImageInToolbar: false,
         showTextInToolbar: true
      };
      var button = toolbar.createOp("SENSITIVITY", buttonArgs);
      button.addSelectionListener(new AjxListener(zimletInstance, zimletInstance.askSendOptions, controller));
   }
};

ConfHeaderZimlet.prototype.askSendOptions =
function(controller) {    
   var zimletInstance = appCtxt._zimletMgr.getZimletByName('com_zimbra_confidential_header').handlerObject;
   zimletInstance._dialog = new ZmDialog( { title:zimletInstance.getMessage('ConfHeaderZimlet_sensitivityBtn'), parent:this.getShell(), standardButtons:[DwtDialog.CANCEL_BUTTON,DwtDialog.OK_BUTTON], disposeOnPopDown:true } );
   
   zimletInstance._dialog.setContent(
   '<div style="width:450px; height:125px;">'+
   '<br><span>'+zimletInstance.getMessage('ConfHeaderZimlet_sensitivityDialog')+':'+
   '<br><br><select id="ConfHeaderZimletsensitivity"> <option value="Company-Confidential">'+zimletInstance.getMessage('ConfHeaderZimlet_sensitivityOptionConfidential')+'</option><option value="Personal">'+zimletInstance.getMessage('ConfHeaderZimlet_sensitivityOptionPersonal')+'</option><option value="Private">'+zimletInstance.getMessage('ConfHeaderZimlet_sensitivityOptionPrivate')+'</option> <option value=""></option></select></div>'
   );
   
   zimletInstance._dialog.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(zimletInstance, zimletInstance.setSensitivity, [controller]));
   zimletInstance._dialog.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(zimletInstance, zimletInstance._cancelBtn, [controller]));
   document.getElementById(zimletInstance._dialog.__internalId+'_handle').style.backgroundColor = '#eeeeee';
   document.getElementById(zimletInstance._dialog.__internalId+'_title').style.textAlign = 'center';
   
   zimletInstance._dialog.popup(); 
}

ConfHeaderZimlet.prototype.setSensitivity =
function(controller) {
   var zimletInstance = appCtxt._zimletMgr.getZimletByName('com_zimbra_confidential_header').handlerObject;
   zimletInstance.sensitivity[appCtxt.getCurrentViewId()] = document.getElementById('ConfHeaderZimletsensitivity').value;
   try{
      zimletInstance._dialog.setContent('');
      zimletInstance._dialog.popdown();
   }
   catch (err) {}
};

/** This method is called when the dialog "CANCEL" button is clicked.
 * It pops-down the current dialog.
 * 
 * Cancel also means no sensitivity is set on this email.
 */
ConfHeaderZimlet.prototype._cancelBtn =
function(controller) {
   var zimletInstance = appCtxt._zimletMgr.getZimletByName('com_zimbra_confidential_header').handlerObject;
   try{
      zimletInstance._dialog.setContent('');
      zimletInstance._dialog.popdown();
   }
   catch (err) {}
};

//zmprov mcf +zimbraCustomMimeHeaderNameAllowed Sensitivity
ConfHeaderZimlet.prototype.addCustomMimeHeaders =
function(customHeaders) {
   var zimletInstance = appCtxt._zimletMgr.getZimletByName('com_zimbra_confidential_header').handlerObject;
   if(zimletInstance.sensitivity) {
      if(zimletInstance.sensitivity[appCtxt.getCurrentViewId()])
      {
         var zimletInstance = appCtxt._zimletMgr.getZimletByName('com_zimbra_confidential_header').handlerObject;   
         var controller = appCtxt.getCurrentController();
         var sensitivity = zimletInstance.sensitivity[appCtxt.getCurrentViewId()];
         switch (sensitivity) {
            case 'Personal':
               customHeaders.push({name:"Sensitivity", _content:'Personal'});
            break;
            case 'Private':
               customHeaders.push({name:"Sensitivity", _content:'Private'});
            break;            
            case 'Company-Confidential':
               customHeaders.push({name:"Sensitivity", _content:'Company-Confidential'});
            break;
         }
         zimletInstance.sensitivity[appCtxt.getCurrentViewId()] = "";
      }
   }
};
