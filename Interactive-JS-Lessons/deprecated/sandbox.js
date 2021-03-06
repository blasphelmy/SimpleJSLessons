var editor;
const data = {labID: function(){
  try{
      var number = Number((window.location.href).split('?')[1].split('=')[1]);
  }catch{
      return 5341691975877615;
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
fetch('http://137.184.237.82:3000/requestLab', options).then((response) => response.json()).then((data) => {
  console.log(data);  
  var newTest = new Test(data);
  init(newTest);
});

window.onload = function (){
  var results = breakIntoComponents(localStorage.getItem("textArea"));
}

function init(newTest){
    editor = CodeMirror(document.querySelector('#code-editor'), {
        lineNumbers: true,
        firstLineNumber: 0,
        tabSize: 2,
        value: function(){
          document.getElementById("code-editor").addEventListener("keyup", function(){
            localStorage.setItem("textArea", editor.getValue());
          });
          if(localStorage.getItem("textArea")){
            return localStorage.getItem("textArea");
          }else{
            localStorage.setItem("textArea", `//your code here`);
            return localStorage.getItem("textArea");
          }
        }(),
        mode: {name: 'javascript'},
        theme: 'monokai'
      });
    displayTests(newTest);
    addRunButtonEventListener(document.getElementById("run"), newTest);
}

function addRunButtonEventListener(element, newTest){
  element.addEventListener("click", function(){
    runCurrentTest(newTest);
  });
}
var logToPage  = function(){
  if(window.testing !== true){
    var args = [...arguments];
    $("#console").append($(`<br>`));
    for(arg of args){
        $("#console").append($(`<console>${arg} </console>`));
    }
  }
};
function runCurrentTest(newTest){
    //******************
    //hijack console.log
    //******************
    if((typeof(newTest.returnCurrentQuestion()) === "undefined")){
      return;
    }
  
    window.logToPage = function(){
        var args = [...arguments];
        $("#console").append($(`<br>`));
        for(arg of args){
            $("#console").append($(`<span>${arg} </span>`));
        }
    };

    storedLogs = [];
    window.storeLogs = function(){
      storedLogs.push([...arguments].join(' '));
    }

    //**************
    //run user input
    //**************
    window.failedTests = []; //very interesting
    var injection = generateInjection(newTest);
    Function(injection.join("\n"))(); //we should look into this option, though I wasn't able to access internal variables and functions https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function

    //******************
    //analyze user input
    //******************

    //Very important, because eval treats the frame it was called in as its code's global frame from here we can access the user's global variables and functions
    //So any testing we'd want to do on a user's functions and variables will happen here

    if(failedTests.length === 0){
      $(`#test-num-${newTest.currentQuestion}`).css("background-color", "green");
      newTest.nextQuestion();
    }
    console.log("failed tests",failedTests);
}

function generateInjection(newTest){
  var newArray = new Array();
  //here, you inject any lines of code you want
  newArray.push(`
  var functionDeclared = new Map();
  var currentFrame = new Frame();
  `);

  //begin parsing of code in code editor;
  var newInjectedCode = breakIntoComponents(editor.getValue()).join("\n");
  newArray.push(newInjectedCode);

  //push other tests here.
  newArray.push("(()=>{");
  newArray.push(initializeTests());
  newArray.push(makeConsoleTester(newTest.returnCurrentQuestion().logs));
  newArray.push(makeVariableTester(newTest.returnCurrentQuestion().vars));
  newArray.push(makeFunctionTester(newTest.returnCurrentQuestion().functs));
  newArray.push(finishTests());
  newArray.push("})()");
  newArray.push(`
  window.currentFrame = currentFrame.returnDefaultFrame();
  `);
  return newArray;
}

