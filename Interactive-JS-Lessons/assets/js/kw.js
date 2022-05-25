var RULES = [
       // ==================ILLEGAL STRINGS===================
    //ILLEGAL DEFAULT FUNCTIONS
    "fetch", "post", "localStorage", 
    //ILLEGAL FUNCTIONS
    "injectHelpers", "checkTests", "visualizeLineNumbers", "trimStringInArray",
    //ILLEGAL VARIABLES
    "currentFrame", "labID", "frameStack", "failedTests", "newData", "newStack", "newClock", "gutterLineMap", "gutterCounter",
    "editor", "activeAnimationListener", "currentLabID", "enableLineAnimations", "gutterDelay", "gutterCounter", "RULES",
];
var differce = ["parent","frameElement","navigator","origin","external","screen",
"innerWidth","innerHeight","scrollX","pageXOffset","scrollY","pageYOffset","visualViewport","screenX","screenY","outerWidth","outerHeight",
"devicePixelRatio","clientInformation","screenLeft","screenTop","defaultStatus","defaultstatus","styleMedia","onsearch","isSecureContext",
"performance","onappinstalled","onbeforeinstallprompt","crypto","indexedDB","webkitStorageInfo","sessionStorage","onbeforexrselect","onabort",
"onblur","oncancel","oncanplay","oncanplaythrough","onchange","onclick","onclose","oncontextlost","oncontextmenu","oncontextrestored","oncuechange",
"ondblclick","ondrag","ondragend","ondragenter","ondragleave","ondragover","ondragstart","ondrop","ondurationchange","onemptied","onended","onerror",
"onfocus","onformdata","oninput","oninvalid","onkeydown","onkeypress","onkeyup","onload","onloadeddata","onloadedmetadata","onloadstart","onmousedown",
"onmouseenter","onmouseleave","onmousemove","onmouseout","onmouseover","onmouseup","onmousewheel","onpause","onplay","onplaying","onprogress","onratechange",
"onreset","onresize","onscroll","onsecuritypolicyviolation","onseeked","onseeking","onselect","onslotchange","onstalled","onsubmit","onsuspend","ontimeupdate",
"ontoggle","onvolumechange","onwaiting","onwebkitanimationend","onwebkitanimationiteration","onwebkitanimationstart","onwebkittransitionend","onwheel","onauxclick",
"ongotpointercapture","onlostpointercapture","onpointerdown","onpointermove","onpointerup","onpointercancel","onpointerover","onpointerout","onpointerenter",
"onpointerleave","onselectstart","onselectionchange","onanimationend","onanimationiteration","onanimationstart","ontransitionrun","ontransitionstart","ontransitionend",
"ontransitioncancel","onafterprint","onbeforeprint","onbeforeunload","onhashchange","onlanguagechange","onmessage","onmessageerror","onoffline","ononline","onpagehide",
"onpageshow","onpopstate","onrejectionhandled","onstorage","onunhandledrejection","onunload","alert","atob","blur","btoa","cancelAnimationFrame","cancelIdleCallback","captureEvents",
"clearInterval","clearTimeout","close","confirm","createImageBitmap","find","focus","getComputedStyle","getSelection","matchMedia","moveBy","moveTo","open","postMessage","print","prompt",
"queueMicrotask","releaseEvents","reportError","requestAnimationFrame","requestIdleCallback","resizeBy","resizeTo","scroll","scrollBy","scrollTo","setInterval","setTimeout","stop","structuredClone",
"webkitCancelAnimationFrame","webkitRequestAnimationFrame","chrome","caches","cookieStore","ondevicemotion","ondeviceorientation","ondeviceorientationabsolute",
"getScreenDetails","showDirectoryPicker","showOpenFilePicker","showSaveFilePicker","originAgentCluster","trustedTypes","speechSynthesis","onpointerrawupdate","crossOriginIsolated",
"scheduler","openDatabase","webkitRequestFileSystem","webkitResolveLocalFileSystemURL","$","jQuery","uidEvent","bootstrap","CodeMirror","Babel","sendCompletedTest",
"returnFrameContainingVariable","returnFrameContainingFunctionDEF","searchFramesForFunctionDef","searchFramesForVariable","searchFramesForConsoleLogging","frameCounter",
"lineNumberMap","sandboxMode","variablesInjecters","makeConsoleTester","makeVariableTester","makeFunctionTester","encodeImageFileAsURL","splitBySemi","findMatching","detectFunctionCalls",
"cleanString","hash","checkForIllegalKW","breakIntoComponents","commentsCleanse","splitByBrackets","removeEmptyIndices","combineSemiColonsWithPreviousLines","detectStatementVariableReassignment",
"gutter","getInitStartingCode","activeContent","urlParameters","lessonPageIFrame","demoImage","reqURL","postURL","aspReqURL","fetchData","init","addRunButtonEventListener","runCurrentTest","generateInjection",
"logToPage","clearDemoButtons","React","ReactDOM","fillVerticalHeight","extractURLParems","parameter","displayContents","displayTests","displayDemo","displayError",
"TEMPORARY","PERSISTENT","hasOwnProperty","differce", "__lookupGetter__","__lookupSetter__","isPrototypeOf"];