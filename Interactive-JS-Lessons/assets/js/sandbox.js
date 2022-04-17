var editor;
var newTest;
var newClock = new Clock();
const data = {labID: function(){
  try{
      var number = Number((window.location.href).split('?')[1].split('=')[1]);
  }catch{
      return 5830658810471045;
  }
  return number;
}()};
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
}
fetch('http://127.0.0.1:3000/requestLab', options).then((response) => response.json()).then((data) => {
    if(data.error){
        console.log(data.error);
    }else{
        newTest = new Test(data);
        console.log(newTest);
        init(newTest);
    }
});
function init(newTest){
    editor = CodeMirror(document.querySelector('#codeEditor'), {
    lineNumbers: true,
    firstLineNumber: 0,
    tabSize: 2,
    value: function(){
        document.getElementById("codeEditor").addEventListener("keyup", function(){
            localStorage.setItem("textArea", editor.getValue());
        });
            if(localStorage.getItem("textArea")){
            return localStorage.getItem("textArea");
        }else{
            localStorage.setItem("textArea", `//your code here`);
            return localStorage.getItem("textArea");
        }
    }(),
        theme: "myCodeEditorTheme",
        continueComments: "Enter",
        mode: 'javascript',
        lineWrapping: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        extraKeys: {"Ctrl-Q": "toggleComment"},
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
  //******************
  //hijack console.log
  //******************
  if((typeof(newTest.returnCurrentQuestion()) === "undefined")){
    return;
  }
  window.logDup = console.log;           //hang on to an original console.log
  var logToPage  = function(){
      var args = [...arguments];
      // $("#ConsoleContainer").append($(`<br>`));
      for(arg of args){
          $("#ConsoleContainer").append($(`<console class="${newClock.getTick()}">> ${arg} </console>`));
      }
      var element = document.getElementById("ConsoleContainer");
      element.scrollTop = element.scrollHeight;
  };

  storedLogs = [];
  var storeLogs = function(){
    logDup(storedLogs)
    storedLogs.push([...arguments].join(' '));
  }

  console.log = function(){
      //hijack it here
      logDup(...arguments);
      storeLogs(...arguments);
      logToPage(...arguments);
  }
  //**************
  //run user input
  //**************
  failedTests = []; //very interesting
  var injection = generateInjection(newTest);
  try{ //"just wrap it in a try catch"
    Function(injection.join("\n"))(); //we should look into this option, though I wasn't able to access internal variables and functions https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function
  }catch{
    console.log("execution error...");
    failedTests.push("execution error...");
  }
  //******************
  //analyze user input
  //******************

  //Very important, because eval treats the frame it was called in as its code's global frame from here we can access the user's global variables and functions
  //So any testing we'd want to do on a user's functions and variables will happen here

  //********************************
  // Clean up changes to console.log
  //********************************
  console.log = logDup;
  window.logDup = undefined;
  if(failedTests.length === 0){
  $(`#test-num-${newTest.currentQuestion}`).addClass("fadeOut");
  newTest.nextQuestion();  
  }
  console.log("ft",failedTests);
}
function generateInjection(newTest){
  var newArray = new Array();
  //here, you inject any lines of code you want
  newArray.push(`
  var currentFrame = new Frame();
  `);

  //begin parsing of code in code editor;
  var newInjectedCode = breakIntoComponents(editor.getValue()).join("\n");
  newArray.push(newInjectedCode);

  //push other tests here.
  newArray.push("(()=>{");
  newArray.push(makeConsoleTester(newTest.returnCurrentQuestion().logs));
  newArray.push(makeVariableTester(newTest.returnCurrentQuestion().vars));
  newArray.push(makeFunctionTester(newTest.returnCurrentQuestion().functs));
  newArray.push("})()");
  newArray.push(`
  currentFrame = currentFrame.returnDefaultFrame();
  logDup(currentFrame);
  // logDup(typeof("currentFrame", currentFrame.variables.get("x").value));
  `);
  return newArray;
}