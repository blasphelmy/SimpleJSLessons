var newClock = new Clock();
var editor;
var newData;
var gutter;
var getInitStartingCode;
var activeContent = "JS";
var urlParameters = new Map();
var lessonPageIFrame;
var activeAnimationListener = {
  aInternal: 0,
  aListener: function (val) { },
  set active(val) {
    this.aInternal = val;
    this.aListener(val);
  },
  get active() {
    return this.aInternal;
  },
  registerListener: function (listener) {
    this.aListener = listener;
  }
}
activeAnimationListener.registerListener(function (val) {
  if (val === 0 && newData.type !== "demo") {
    checkTests();
    gutterDelay = document.getElementById("exceSlider").value;
    document.getElementById("timingLabel").innerText = "Timing : " + (gutterDelay / 1000).toLocaleString("en", { useGrouping: false, minimumFractionDigits: 2 }) + "s ";
  }
});
var currentLabID;
function fetchData(newLabID) {
  var data = { labID: newLabID || labID() };
  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }
  fetch('https://simplejsclasses.net/requestLab', options).then((response) => response.json()).then((data) => {
    //i still need to create the ssl certs for the server. so we will just use http for now. I mean its not like im sending anything too interesting
    if (data.error) {
      console.log(data.error);
      displayContents = displayError;
      getInitStartingCode = function(){
        return "//your code here";
      }
      init(data);
    }
    else {
      if (data.type === "demo") {
        $("#btnContainer").css("display", "inline");
        newData = new Data(data);
        newData.html = localStorage.getItem("textAreaHTML" + currentLabID) || newData.html;
        newData.css = localStorage.getItem("textAreaCSS" + currentLabID) || newData.css;
        getInitStartingCode = function () {
          if (localStorage.getItem(("textArea" + currentLabID)) && localStorage.getItem(("textArea" + currentLabID)) !== "//your code here") {
            return localStorage.getItem(("textArea" + currentLabID));
          } else {
            try {
              localStorage.setItem(("textArea" + currentLabID), data.js);
            } catch {
              localStorage.setItem(("textArea" + currentLabID), "//your code here");
            }
            return localStorage.getItem(("textArea" + currentLabID));
          }
        }
        $("#sandboxModeState").prop("checked", true);
        $("#sandboxModeState").prop("disabled", true);
        $("#lineAnimationCheckbox").prop("disabled", true);
        displayContents = displayDemo;
        init(newData);
      } else if (data.testQuestionSet) {
        newData = new Data(data);
        getInitStartingCode = function () {
          if (localStorage.getItem(`${currentLabID}`)) {
            newData.currentQuestion = localStorage.getItem(`${currentLabID}`);
          } else {
            localStorage.setItem(`${currentLabID}`, 0);
          }
          if (localStorage.getItem(("textArea" + currentLabID)) && localStorage.getItem(("textArea" + currentLabID)) !== "//your code here") {
            return localStorage.getItem(("textArea" + currentLabID));
          } else {
            try {
              localStorage.setItem(("textArea" + currentLabID), function(){
                if(newData.returnCurrentQuestion().startingCode === "keep previous"){
                  let currentQuestion = newData.currentQuestion;
                  let startingCode = newData.testQuestionSet[currentQuestion--].startingCode;
                  while(startingCode === "keep previous"){
                    startingCode = newData.testQuestionSet[currentQuestion--].startingCode;
                  }
                  return startingCode;
                }else{
                  return newData.returnCurrentQuestion().startingCode;
                }
              }());
            } catch {
              localStorage.setItem(("textArea" + currentLabID), "//your code here");
            }
            return localStorage.getItem(("textArea" + currentLabID));
          }
        }
        displayContents = displayTests;
        init(newData);
      }
    }
  });
}

var checkTests = function () {
  if (window.failedTests.size() === 0 && (newData.type === "lesson" || newData.type === "lessonAnswers")) {
    let testNum = lessonPageIFrame.contentDocument.getElementById(`test-num-${newData.currentQuestion}`);
    testNum.classList.add("fadeOut");
    logToPage("you passed!");
    if (Number(newData.currentQuestion) == newData.testQuestionSet.length - 1) {
      logToPage("Congrats on getting to the end!");
    }
    newData.nextQuestion();
  } else {
    logToPage("you failed!");
    while (window.failedTests.size() > 0) {
      logToPage(window.failedTests.pop());
    }
  }
}

function init(data) {
  console.log(data);
  editor = CodeMirror(document.querySelector('#codeEditor'), {
    lineNumbers: true,
    firstLineNumber: 0,
    tabSize: 2,
    value: getInitStartingCode(),
    theme: "myCodeEditorTheme",
    continueComments: "Enter",
    mode: 'javascript',
    lineWrapping: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    extraKeys: { "Ctrl-Q": "toggleComment" },
    scrollbarStyle: "null"
  });
  document.getElementById("codeEditor").addEventListener("keyup", function () {
    if (activeContent === "JS") {
      localStorage.setItem(("textArea" + currentLabID), editor.getValue());
    } else if (activeContent === "CSS") {
      localStorage.setItem(("textAreaCSS" + currentLabID), editor.getValue());
    } else if (activeContent === "HTML") {
      localStorage.setItem(("textAreaHTML" + currentLabID), editor.getValue());
    }
  });
  displayContents(data);
  addRunButtonEventListener(document.getElementById("run"), data);
}

function addRunButtonEventListener(element, newData) {
  element.addEventListener("click", function () {
    runCurrentTest(newData);
  });
}
window.logToPage = function () {
  var args = [...arguments];
  for (arg of args) {
    $("#ConsoleContainer").append($(`<console class="${newClock.getTick()}">> ${arg} </console>`));
  }
  var element = document.getElementById("ConsoleContainer");
  element.scrollTop = element.scrollHeight;
};

var runCurrentTest = function (newData) {
  if (activeAnimationListener.active > 0) {
    return;
  }
  if (newData.type === "demo") {
    newData.html = localStorage.getItem("textAreaHTML" + currentLabID) || newData.html;
    newData.css = localStorage.getItem("textAreaCSS" + currentLabID) || newData.css;
    if (checkForIllegalKW(newData.html) || checkForIllegalKW(newData.css)) {
      return;
    }
    lessonPageIFrame.srcdoc = `
    <div id="lessonPage" class="heightAdjustment" style="width: 100%;height:100vh;">
      <section>
        <div>${newData.html}</div>
        <style>${newData.css}</style>
        <script>${localStorage.getItem("textArea" + currentLabID) || newData.css}</script>
      </section>
    </div>`
return;
  }
  // editor.getDoc().setValue(localStorage.getItem(("textArea" + currentLabID)));  
  enableLineAnimations = document.getElementById("lineAnimationCheckbox").checked;
  gutterDelay = document.getElementById("exceSlider").value;
  sandboxMode = document.getElementById("sandboxModeState").checked;
  gutter = undefined;
  gutter = document.getElementsByClassName("CodeMirror-linenumber");
  for (line of gutter) {
    line.style.background = "";
  }
  lineNumberMap = undefined;
  lineNumberMap = new Map(); //just use a hash map???
  gutterCounter = 0;
  //******************
  //hijack console.log
  //******************

  storedLogs = [];
  window.storeLogs = function () {
    storedLogs.push([...arguments].join(' '));
  }
  //**************
  //run user input
  //**************
  window.failedTests = new Stack(); //very interesting
  try {
    var injection = generateInjection();
  } catch (error) {
    window.failedTests.push(error);
    console.log(error);
  }
  console.log("injection", injection.join("\n"));
  try { //"just wrap it in a try catch"
    Function(injection.join("\n"))(); //we should look into this option, though I wasn't able to access internal variables and functions https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function
  } catch (error) {
    window.failedTests.push(error);
    logToPage(error);
    console.log(error);
  }
  //******************
  //analyze user input
  //******************

  //Very important, because eval treats the frame it was called in as its code's global frame from here we can access the user's global variables and functions
  //So any testing we'd want to do on a user's functions and variables will happen here
  if (!enableLineAnimations && !sandboxMode && newData.type !== "demo") {
    checkTests();
  }
  //********************************
  // Clean up changes to console.log
  //********************************
}
function generateInjection() {
  var newArray = new Array();
  //here, you inject any lines of code you want
  newArray.push(`
  var currentFrame = new Frame();
  var frameStack = new Stack();
  `);

  //begin parsing of code in code editor;
  console.log(localStorage.getItem("textArea" + currentLabID));
  var newInjectedCode = breakIntoComponents(localStorage.getItem("textArea" + currentLabID)).join("\n");
  newArray.push(newInjectedCode);

  //push other tests here.
  newArray.push("currentFrame = currentFrame.returnDefaultFrame();")
  if (newData.type !== "demo") {
    newArray.push("(()=>{");
    newArray.push(makeConsoleTester(newData.returnCurrentQuestion().logs));
    newArray.push(makeVariableTester(newData.returnCurrentQuestion().vars));
    newArray.push(makeFunctionTester(newData.returnCurrentQuestion().functs));
    newArray.push("})()");
  }
  newArray.push(` 
  window.currentFrame = currentFrame;
  console.log(window.currentFrame);
  // logDup(typeof("currentFrame", currentFrame.variables.get("x").value));
  `);
  return newArray;
}