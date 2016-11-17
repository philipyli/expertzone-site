var concierge =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var messageTypes            = __webpack_require__(1);
	
	var concierge = (function () {
	    'use strict';
	
	    var VERSION = 1;
	
	    var applicationKey = null;
	    var firebirdsUrl = null; //Uses production if not set
	    var WIDGET_DOMAIN = 'https://websdk.live.gotoassist.com';
	
	
	    var APP_KEY_SESSION_STORAGE_KEY = 'concierge-widget-app-key';
	    var IS_SESSION_ACTIVE_SESSION_STORAGE_KEY = 'is-session-active-key';
	
	    var iframe;
	    var spinnerView;
	    var defaultButton;
	
	    var doAllowAudioCalls = true;
	    var isHttps = window.location.protocol === 'https:';
	    var customerName = null;
	    var customAttributes = null;
	    var conciergeSessionActive = false;
	    var fallbackEmail = null;
	    var fallbackPhoneNumber = null;
	    var fallbackWebsite = null;
	
	    function messageHandler(event) {
	        var data = event.data;
	        var body = document.getElementsByTagName('body')[0];
	
	        switch (data.type) {
	            case messageTypes.widgetToSnippet.WIDGET_LOADED:
	                if (spinnerView) body.removeChild(spinnerView);
	                spinnerView = null;
	                break;
	            case messageTypes.widgetToSnippet.SESSION_STARTED:
	                persistIsConciergeSessionActive(true);
	                break;
	            case messageTypes.widgetToSnippet.REQUEST_HEIGHT:
	                if (iframe) {
	                    iframe.style.height = data.height;
	                }
	                break;
	            case messageTypes.widgetToSnippet.SESSION_ENDED:
	                persistIsConciergeSessionActive(false);
	                cleanUpSessionStorage();
	                var body  = document.getElementsByTagName('body')[0];
	                if (iframe) body.removeChild(iframe);
	                if (spinnerView) body.removeChild(spinnerView);
	                iframe = null;
	                spinnerView = null;
	
	                if (window.removeEventListener) {
	                    window.removeEventListener('message', messageHandler);
	                } else {
	                    window.detachEvent('onmessage', messageHandler);
	                }
	
	                window.removeEventListener('message', messageHandler);
	                break;
	            default:
	                //Unknown message received (may be from a newer version of the widget)
	                break;
	        }
	    }
	
	    function persistIsConciergeSessionActive(isActive) {
	        conciergeSessionActive = isActive;
	
	        if (sessionStorage) {
	            sessionStorage.setItem(IS_SESSION_ACTIVE_SESSION_STORAGE_KEY, isActive);
	        }
	    }
	
	    function createIframe(url, left, right, top, bottom, width, height) {
	        iframe = document.createElement('iframe');
	        iframe.id = 'concierge-widget';
	        iframe.setAttribute('frameBorder', 0);
	
	        try {
	            iframe.style.zIndex = 2147483647;
	            iframe.style.width = width;
	            iframe.style.height = height;
	            iframe.style.position = 'fixed';
	            iframe.style.top = top;
	            iframe.style.bottom = bottom;
	            iframe.style.left = left;
	            iframe.style.right = right;
	            iframe.style.overflow = 'hidden';
	        } catch(e) {
	            //IE7 doesn't support setting unsupported CSS properties using javascript
	        }
	
	        iframe.src = url;
	
	        return iframe;
	    }
	
	    function createSpinnerView(left, right, top, bottom, width, height) {
	        spinnerView = document.createElement('div');
	        spinnerView.id = 'concierge-spinner';
	
	        try {
	            spinnerView.style.zIndex = 2147483646;
	            spinnerView.style.borderWidth = 0;
	            spinnerView.style.width = width;
	            spinnerView.style.height = height;
	            spinnerView.style.position = 'fixed';
	            spinnerView.style.top = top;
	            spinnerView.style.bottom = bottom;
	            spinnerView.style.left = left;
	            spinnerView.style.right = right;
	            spinnerView.style.overflow = 'hidden';
	            spinnerView.style.backgroundImage = 'url("data:image/gif;base64,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")';
	            spinnerView.style.backgroundRepeat = 'no-repeat';
	            spinnerView.style.backgroundPosition = 'center';
	            spinnerView.style.backgroundColor = 'white';
	            spinnerView.style.borderRadius = '10px';
	            spinnerView.style.textAlign = 'center';
	            spinnerView.style.lineHeight = '92px';
	            spinnerView.style.boxShadow = '2px 2px 8px 0 rgba(0,0,0,.4)';
	        } catch(e) {
	            //IE7 doesn't support setting unsupported CSS properties using javascript
	        }
	
	        return spinnerView;
	    }
	
	    function getUrl() {
	        var url = WIDGET_DOMAIN + '/index.html?';
	        url += 'applicationKey=' + applicationKey;
	        url += (customerName) ? '&customerName=' + customerName : '';
	        url += (firebirdsUrl) ? '&firebirdsUrl=' + firebirdsUrl : '';
	        url += (fallbackPhoneNumber) ? '&fallbackPhoneNumber=' + fallbackPhoneNumber : '';
	        url += (fallbackWebsite) ? '&fallbackWebsite=' + fallbackWebsite : '';
	        url += (fallbackEmail) ? '&fallbackEmail=' + fallbackEmail : '';
	        url += '&allowAudioCalls=' + doAllowAudioCalls;
	        url += '&isHttps=' + isHttps;
	
	        var customAttributesString;
	        try {
	            customAttributesString = (customAttributes) ? JSON.stringify(customAttributes) : null;
	        } catch(e) {
	            customAttributesString = null;
	        }
	
	        url += (customAttributesString) ? '&customAttributes=' + customAttributesString : '';
	
	        return url;
	    }
	
	    function open() {
	        if (!applicationKey) {
	            console.error('No application key set. Call concierge.setApplicationKey to set the application key.');
	            return;
	        }
	
	        if (!document.body) {
	            console.error('Can\'t call concierge.open() before the document has loaded');
	            return;
	        }
	
	        if (!iframe) {
	            var body = document.getElementsByTagName('body')[0];
	            iframe = createIframe(getUrl(), 'auto', 0, 'auto', 0, '300px', '100%'); //'115px'
	            spinnerView = createSpinnerView('auto', '7px', 'auto', '10px', '279px', '92px');
	
	            body.appendChild(spinnerView);
	            body.appendChild(iframe);
	
	            if (window.addEventListener) {
	                window.removeEventListener('message', messageHandler);
	                window.addEventListener('message', messageHandler);
	            } else {
	                window.detachEvent('onmessage', messageHandler);
	                window.attachEvent('onmessage', messageHandler);
	            }
	        }
	    }
	
	    function updateDefaultButtonUrl() {
	        //In case properties are updated after the default button has been inserted
	        if (defaultButton) {
	            defaultButton.href = getUrl();
	        }
	    }
	
	    function onBodyReady(callback) {
	        if (document.body) {
	            callback();
	        } else {
	            if (document.addEventListener) {
	                document.addEventListener('DOMContentLoaded', callback);
	            } else {
	                document.attachEvent("onreadystatechange", function(){
	                    if (document.readyState === "complete"){
	                        callback();
	                    }
	                });
	            }
	        }
	    }
	
	    function addDefaultButton(label) {
	        try {
	            defaultButton = document.createElement('a');
	            defaultButton.innerText = label || 'Concierge';
	            defaultButton.textContent = label || 'Concierge';
	            defaultButton.style.zIndex = 2147483645;
	            defaultButton.style.borderWidth = 0;
	            defaultButton.style.textAlign = 'center';
	            defaultButton.style.backgroundColor = '#1FC659';
	            defaultButton.style.color = '#ffffff';
	            // defaultButton.style.minWidth = '160px';
	            defaultButton.style.maxWidth = '230px';
	            // defaultButton.style.height = '45px';
	            defaultButton.style.position = 'fixed';
	            defaultButton.style.bottom = '40px';
	            defaultButton.style.right = '40px';
	            defaultButton.style.borderRadius = '25px';
	            defaultButton.style.fontSize = '15px';
	            defaultButton.style.fontFamily = "'Helvetica Neue', helvetica, arial, verdana, sans-serif";
	            defaultButton.style.outline = '0';
	            defaultButton.style.cursor = 'pointer';
	            defaultButton.style.textDecoration = 'none';
	            defaultButton.style.lineHeight = '45px';
	            defaultButton.style.fontWeight = '200';
	            defaultButton.style.padding = '20px';
	            defaultButton.style.letterSpacing = '2px';
	            defaultButton.style.boxSizing = 'content-box';
	            defaultButton.style.boxShadow = 'rgba(0, 0, 0, 0.2) 1px 1px 3px 0px';
	
	            //Is IE8 or older. Note that this way of checking isn't 100% bullet proof (hostpage could have defined addEventListener), but we only
	            //use this for minor, non critical styling adjustments.
	            if (window.attachEvent && !window.addEventListener) {
	                defaultButton.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='images/logo.gif', sizingMethod='scale')"; //Because background size doesn't work in IE8 and below
	                defaultButton.style.backgroundPosition = '0 0';
	            }
	        } catch(e) {
	            //IE7 doesn't support setting unsupported CSS properties using javascript
	        }
	
	        updateDefaultButtonUrl();
	
	        function defaultButtonClickHandler(e) {
	            open();
	            e.preventDefault ? e.preventDefault() : e.returnValue = false;
	            return false;
	        }
	
	        function defaultButtonActive() {
	            defaultButton.style.backgroundColor = 'rgb(130,130,130)';
	        }
	
	        function defaultButtonNormal() {
	            defaultButton.style.backgroundColor = '#1FC659';
	        }
	
	        function defaultButtonHover() {
	            defaultButton.style.backgroundColor = 'rgba(20, 171, 72)';
	        }
	
	        if (defaultButton.addEventListener) {
	            defaultButton.addEventListener('mousedown', defaultButtonActive, false);
	            defaultButton.addEventListener('mouseover', defaultButtonHover, false);
	            defaultButton.addEventListener('mouseup', defaultButtonNormal, false);
	            defaultButton.addEventListener('mouseout', defaultButtonNormal, false);
	            defaultButton.addEventListener('click', defaultButtonClickHandler, false);
	        }
	        else {
	            defaultButton.attachEvent('onmousedown', defaultButtonActive);
	            defaultButton.attachEvent('onmouseover', defaultButtonHover);
	            defaultButton.attachEvent('onmouseup', defaultButtonNormal);
	            defaultButton.attachEvent('onmouseout', defaultButtonNormal);
	            defaultButton.attachEvent('onclick', defaultButtonClickHandler);
	        }
	
	        onBodyReady(function () {
	            document.getElementsByTagName('body')[0].appendChild(defaultButton);
	        });
	    }
	
	    function preloadWidget() {
	        var link = document.createElement('link');
	        link.setAttribute('rel', 'prefetch');
	        link.setAttribute('href', WIDGET_DOMAIN + '/concierge-widget.bundle.min.js');
	
	        var head = document.getElementsByTagName('head')[0];
	        head.appendChild(link);
	    }
	
	    function cleanUpSessionStorage() {
	        if (sessionStorage) {
	            sessionStorage.removeItem(APP_KEY_SESSION_STORAGE_KEY);
	            sessionStorage.removeItem(IS_SESSION_ACTIVE_SESSION_STORAGE_KEY);
	        }
	    }
	
	    function setCustomAttributes(data) {
	        customAttributes = data;
	        updateDefaultButtonUrl();
	    }
	
	    function isConciergeSessionActive() {
	        return conciergeSessionActive;
	    }
	
	    function setCustomerName(name) {
	        customerName = name;
	        updateDefaultButtonUrl();
	    }
	
	    function allowAudioCalls(doAllow) {
	        doAllowAudioCalls = !!doAllow;
	        updateDefaultButtonUrl();
	    }
	
	    function version() {
	        return VERSION;
	    }
	
	    function setApplicationKey(key) {
	        if (sessionStorage) {
	            sessionStorage.setItem(APP_KEY_SESSION_STORAGE_KEY, key);
	        }
	
	        applicationKey = key;
	        updateDefaultButtonUrl();
	    }
	
	    function setFirebirdsUrl(env) {
	        firebirdsUrl = env;
	        updateDefaultButtonUrl();
	    }
	
	    function setFallbackOptions(options) {
	        fallbackEmail = options.fallbackEmail;
	        fallbackPhoneNumber = options.fallbackPhoneNumber;
	        fallbackWebsite = options.fallbackWebsite;
	
	        updateDefaultButtonUrl();
	    }
	
	    function setWidgetDomain(widgetDomain) {
	        WIDGET_DOMAIN = widgetDomain;
	        preloadWidget();
	    }
	
	    function reOpenIfSessionIsActive() {
	        if (sessionStorage) {
	            applicationKey = sessionStorage.getItem(APP_KEY_SESSION_STORAGE_KEY);
	            var isSessionActive = sessionStorage.getItem(IS_SESSION_ACTIVE_SESSION_STORAGE_KEY);
	
	            if (applicationKey && isSessionActive) {
	                onBodyReady(open);
	            }
	        }
	    }
	
	    //Initialization
	    preloadWidget();
	    reOpenIfSessionIsActive();
	
	    return {
	        isConciergeSessionActive: isConciergeSessionActive,
	        setFallbackOptions: setFallbackOptions,
	        setCustomAttributes: setCustomAttributes,
	        setApplicationKey: setApplicationKey,
	        setCustomerName: setCustomerName,
	        allowAudioCalls: allowAudioCalls,
	        addDefaultButton: addDefaultButton,
	        version: version,
	        open: open,
	        /* The methods below are for testing purposes only */
	        __setFirebirdsUrl: setFirebirdsUrl,
	        __setWidgetDomain: setWidgetDomain
	    };
	}());
	
	module.exports = concierge;

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = {
	    snippetToWidget: {
	        //Nothing so far...
	    },
	    widgetToSnippet: {
	        WIDGET_LOADED: 'concierge-widget-loaded',
	        SESSION_STARTED: 'concierge-session-started',
	        SESSION_ENDED: 'concierge-session-ended',
	        REQUEST_HEIGHT: 'concierge-request-height'
	    },
	    chromeExtensionToWidget: {
	        SCREEN_SHARING_DIALOG_SUCCES: 'concierge-screen-sharing-dialog-success',
	        SCREEN_SHARING_DIALOG_CANCEL: 'concierge-screen-sharing-dialog-cancel',
	        TAB_SHARING_STREAM: 'concierge-tab-sharing-stream'
	    },
	    widgetToChromeExtension: {
	        SCREEN_SHARING_REQUEST: 'concierge-screen-sharing-dialog-request',
	        TAB_SHARING_REQUEST: 'concierge-tab-sharing-request'
	    },
	    backgroundTabToWidget: {
	        SESSION_ENDED: 'concierge-session-ended',
	        VIDEO_FRAME: 'video-frame'
	    },
	    widgetToBackgroundTab: {
	        REQUEST_FRAME: 'request-frame',
	        END_SESSION: 'end-session'
	    }
	};

/***/ }
/******/ ]);
//# sourceMappingURL=concierge.js.map