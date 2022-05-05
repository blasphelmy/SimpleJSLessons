var newClock = new Clock();
var editor;
var newTest;
var gutter;
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
  if (val === 0) {
    checkTests();
    gutterDelay = document.getElementById("exceSlider").value;
    document.getElementById("timingLabel").innerText = "Timing : " + (gutterDelay/1000).toLocaleString("en",{useGrouping: false,minimumFractionDigits: 2}) + "s ";
}  
});
var labID = function(){
  try{
      var number = Number((window.location.href).split('?')[1].split('=')[1]);
  }catch(error){
      return 268945738906855;
  }
  return number;
};
var currentLabID = labID();
function fetchData(newLabID){
  var data = {labID: newLabID || labID()};
  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }
  fetch('http://137.184.237.82:3000/requestLab', options).then((response) => response.json()).then((data) => {
    //i still need to create the ssl certs for the server. so we will just use http for now. I mean its not like im sending anything too interesting
      if(data.error){
          console.log(data.error);
          init()
      }else{
          newTest = new Test(data);
          console.log(newTest);
          init(newTest);
      }
  });
}

function checkTests(){
  if(window.failedTests.size() === 0){
    $(`#test-num-${newTest.currentQuestion}`).addClass("fadeOut");
    logToPage("you passed!");
    if(Number(newTest.currentQuestion) == newTest.testQuestionSet.length-1){
      alert("Congrats on getting to the end!");
    }
    newTest.nextQuestion();
  }else{
    logToPage("you failed!");
    while(window.failedTests.size() > 0){
      logToPage(window.failedTests.pop());
    }
  }
}

function init(newTest){
    editor = CodeMirror(document.querySelector('#codeEditor'), {
    lineNumbers: true,
    firstLineNumber: 0,
    tabSize: 2,
    value: function(){
        document.getElementById("codeEditor").addEventListener("keyup", function(){
            localStorage.setItem(("textArea" + currentLabID), editor.getValue());
        });
        if(localStorage.getItem(`${currentLabID}`)){
          newTest.currentQuestion = localStorage.getItem(`${currentLabID}`);
        }else{
          localStorage.setItem(`${currentLabID}`, 0);
        }
        if(localStorage.getItem(("textArea" + currentLabID)) && localStorage.getItem(("textArea" + currentLabID)) !== "//your code here"){
            return localStorage.getItem(("textArea" + currentLabID));
        }else{
            try{
              localStorage.setItem(("textArea" + currentLabID), newTest.returnCurrentQuestion().startingCode);
            }catch{
              localStorage.setItem(("textArea" + currentLabID), "//your code here");
            }
            return localStorage.getItem(("textArea" + currentLabID));
        }
    }(),
        theme: "myCodeEditorTheme",
        continueComments: "Enter",
        mode: 'javascript',
        lineWrapping: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        extraKeys: {"Ctrl-Q": "toggleComment"},
        scrollbarStyle: "null"
    });
    displayTests(newTest);
    addRunButtonEventListener(document.getElementById("run"), newTest);
}

function addRunButtonEventListener(element, newTest){
  element.addEventListener("click", function(){
    runCurrentTest(newTest);
  });
}

function runCurrentTest(newTest){
  if((typeof(newTest.returnCurrentQuestion()) === "undefined" || activeAnimationListener.active > 0)){
    return;
  }

  localStorage.setItem(("textArea" + currentLabID), editor.getValue());
  editor.getDoc().setValue(localStorage.getItem(("textArea" + currentLabID)));  
  enableLineAnimations = function(){
    return document.getElementById("lineAnimationCheckbox").checked;
  }();
  gutterDelay = document.getElementById("exceSlider").value;
  sandboxMode = document.getElementById("sandboxModeState").checked;
  editor.value = editor.doc.getValue();
  gutter = undefined;
  gutter = document.getElementsByClassName("CodeMirror-linenumber");
  for(line of gutter){
    line.style.background = "";
  }
  lineNumberMap = undefined;

  lineNumberMap = new Map(); //just use a hash map???
  gutterCounter = 0;
  //******************
  //hijack console.log
  //******************

  window.logToPage  = function(){
      var args = [...arguments];
      for(arg of args){
          $("#ConsoleContainer").append($(`<console class="${newClock.getTick()}">> ${arg} </console>`));
      }
      var element = document.getElementById("ConsoleContainer");
      element.scrollTop = element.scrollHeight;
  };

  storedLogs = [];
  window.storeLogs = function(){
    storedLogs.push([...arguments].join(' '));
  }
  //**************
  //run user input
  //**************
  window.failedTests = new Stack(); //very interesting
  try{
    var injection = generateInjection(newTest);
  }catch(error){
    window.failedTests.push(error);
    logToPage(error);
    console.log(error);
  }
  console.log("injection", injection.join("\n"));
  try{ //"just wrap it in a try catch"
    Function(injection.join("\n"))(); //we should look into this option, though I wasn't able to access internal variables and functions https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function
  }catch(error){
    window.failedTests.push(error);
    logToPage(error);
    console.log(error);
  }
  //******************
  //analyze user input
  //******************

  //Very important, because eval treats the frame it was called in as its code's global frame from here we can access the user's global variables and functions
  //So any testing we'd want to do on a user's functions and variables will happen here
  if(enableLineAnimations === false && !sandboxMode){
    checkTests();
  }
  //********************************
  // Clean up changes to console.log
  //********************************
}
function generateInjection(newTest){
  var newArray = new Array();
  //here, you inject any lines of code you want
  newArray.push(`
  var currentFrame = new Frame();
  var frameStack = new Stack();
  `);

  //begin parsing of code in code editor;
  var newInjectedCode = breakIntoComponents(editor.getValue()).join("\n");
  newArray.push(newInjectedCode);

  //push other tests here.
  newArray.push("currentFrame = currentFrame.returnDefaultFrame();")
  newArray.push("(()=>{");
  newArray.push(makeConsoleTester(newTest.returnCurrentQuestion().logs));
  newArray.push(makeVariableTester(newTest.returnCurrentQuestion().vars));
  newArray.push(makeFunctionTester(newTest.returnCurrentQuestion().functs));
  newArray.push("})()");
  newArray.push(`
  window.currentFrame = currentFrame;
  console.log(window.currentFrame);
  // logDup(typeof("currentFrame", currentFrame.variables.get("x").value));
  `);
  return newArray;
}