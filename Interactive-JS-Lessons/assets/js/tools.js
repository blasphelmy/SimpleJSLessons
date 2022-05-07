var lineNumberMap = new Map(); //just use a hash map???
var enableLineAnimations = false;
var sandboxMode = false;//disables all injection and testing
var gutterCounter = 0;
var gutterDelay; //x seconds
var labID = function(){
  try{
      var number = Number((window.location.href).split('?')[1].split('=')[1]);
  }catch(error){
      return 374760806408347;
  }
  return number;
};
async function visualizeLineNumbers(hash, logs){
  if(lineNumberMap.get(hash) || lineNumberMap.get(hash) === 0){
    let lineNum = lineNumberMap.get(hash);
    setTimeout(function(){
      activeAnimationListener.active++;
      if(typeof(logs) !== "undefined"){
        logToPage(logs);
      }
      if(typeof(gutter[lineNum]) !== "undefined"){
        gutter[lineNum].style.background = "limegreen";
      }

      setTimeout(function(){
        if(typeof(gutter[lineNum]) !== "undefined"){
          gutter[lineNum].style.background = "none";
        }
        activeAnimationListener.active--;
      }, (Number(gutterDelay) + 15));


    }, gutterDelay * gutterCounter);

      gutterCounter++;
  }
}
var injectHelpers = function (array, start){
  // console.log("array before injection : ", array);
    var newArray = new Array();
    var newStack = new Stack();
    let stringtestdata = function(){
      if(newTest.js){
        return [];
      }else{
        return newTest.returnCurrentQuestion().stringsTests;
      }
    }();
    let stringTests = new Stack(JSON.parse(JSON.stringify(stringtestdata))) || new Stack();
    if(sandboxMode){
      let newArray = new Array();
      for(let string of array){
        string = string.trim();
        if(string.match(/(^console.log)/)){
          var logString = string.split(/^([ ]*)+(?:[console])+([ ]*)+([.])+([ ]*)+(?:log)/gm)[5];
          logString = logString.split(/\/\//)[0];
          logString = logString.split(";")[0];
          logString = logString.slice(1, logString.length - 1);
          var logArray = JSON.stringify(logString.split(/,(?=(?:(?:[^"|^']*"){2})*[^"|^']*$)/));
          newArray.push(`{
          let logString = ${logArray}.map(log=>JSON.stringify(eval(log))).join(" ").replace(/["|']/g, '');
          logToPage(logString);
          }`);
        }else{
          newArray.push(string);
        }  
      }
      return newArray;
    }
    
    if(typeof(start) === "undefined"){
        start = 0;
    }

    for(let string of array){
      string = string.split(/\/\//)[0];
      stringTests.getIndexOfandPop(string.toString());
    }
    while(stringTests.size() > 0){
      let failedTest = "Failed to detect line : " + stringTests.pop();
      window.failedTests.push(failedTest);
    }

    for(let i = start; i < array.length; i++){ //this is bound to cause bugs later on.
      let x = i; //preserve line number
      array[i] = array[i].trim();
        if(array[i].match(/(^function)+([ ]+)/)){ 
            newStack.push("function");
            var functionName = array[i].split(/(^function)+([ ]+)/);
            if(enableLineAnimations === true){
              var hash = array[i+2].split(/\/\//)[1].split(/[=]/)[1];
            }
            functionName = removeEmptyIndices(functionName)[1].split(/([a-zA-Z0-9 ]+)+([(])/)[1];
            var inputs = trimStringInArray(array[i].split("function ")[1].split(/[(|)]/)[1].split(","));
            // console.log("inputs: ", inputs);
            // console.log("functionName", functionName);
            newArray.push(`{
              let tempFrame = currentFrame.returnPreviousFunctionScope();
              tempFrame.declaredFunctions.set("${functionName}", currentFrame);
              if(enableLineAnimations === true){visualizeLineNumbers(${hash});}
            }`);
            // newArray.push(`visualizeLineNumbers(${hash});`);
            newArray.push(array[i]);
            i++;
            newArray.push(array[i]);
            newArray.push(`var parentFrame = currentFrame;`)
            newArray.push(`{`);
            newArray.push(`let currentFrame = new Frame(parentFrame, "${functionName}", "scoped");`);
            for(string of inputs){
              if(string !== ""){
                newArray.push(`currentFrame.addVariable("var", "${string}", ${string});`); //all javascript inputs are var's
              }
            }
            if(enableLineAnimations === true){
              newArray.push(`visualizeLineNumbers(${hash});`);
            }
            // newArray.push(`functionDeclared.set("${functionName}", currentFrame);`);
        }
        else if(array[i].match(/(function)+([ ]*)+([(])/)){
          let end = findMatching(array, i, "{");
          do{
            newArray.push(array[i]);
            i++;
          }while(i <= end);
          newArray.push(array[i]);
        }
        else if(array[i].match(/^class/)){
          let end = findMatching(array, i, "{");
          do{
            newArray.push(array[i]);
            i++;
          }while(i <= end);
        }
        else if(array[i].match(/^switch/)){
          let end = findMatching(array, i, "{");
          do{
            newArray.push(array[i]);
            i++;
          }while(i <= end);
        }
        else if(array[i].match(/(^if)/) || array[i].match(/(^else)/)){ 
          var hash;
          if(enableLineAnimations === true){
            if(array[i].match(/^if/)){
              hash = array[i+2].split(/\/\//)[1].split(/[=]/)[1];
              newArray.push(`visualizeLineNumbers(${hash});`);
              hash = undefined;
            }else{
              hash = array[i+2].split(/\/\//)[1].split(/[=]/)[1];
            }
          }
          newStack.push("ifelse"); 
          newArray.push(array[i]);
          if(array[i].match(/(^if)/)){
            i++;
            newArray.push(array[i]);
            newArray.push(`currentFrame = new Frame(currentFrame, "ifBlock", "blocked");`);
          }else{
            i++;
            newArray.push(array[i]);
            newArray.push(`currentFrame = new Frame(currentFrame, "elseBlock", "blocked");`);
          }
          if(enableLineAnimations === true){
            newArray.push(`visualizeLineNumbers(${hash});`);
          }
        } 
        else if((/(^for)/g).test(array[i])){
          var hash = array[i+2].split(/\/\//)[1].split(/[=]/)[1];
          newStack.push(hash);
          newStack.push("forBlockscope");
          newArray.push(`let f${hash} = false`)
          newArray.push(array[i]);
          i++;
          newArray.push(array[i]);
          i++;
          newArray.push(array[i]);
          if(enableLineAnimations === true){
            newArray.push(`visualizeLineNumbers(${hash});`);
          }
          newArray.push(`if(f${hash} === false){currentFrame = new Frame(currentFrame, "forLoopBlock", "blocked");}f${hash} = true`);
        } 
        else if((/(^while)/g).test(array[i])){
          if(enableLineAnimations === true){
            var hash = array[i+2].split(/\/\//)[1].split(/[=]/)[1];
          }
          newStack.push("blockscope");
          newArray.push(array[i]);
          i++;
          newArray.push(array[i]);
          if(enableLineAnimations === true){
            newArray.push(`visualizeLineNumbers(${hash});`);
          }
          newArray.push(`currentFrame = new Frame(currentFrame, "whileLoopBlock", "blocked");`);
        }
        else if(array[i].match(/(^var)+([ ]+)/)){
          var variableName = array[i].split(/\/\//)[0].split(/^var/)[1].trim().split(/[=]/)[0].trim().split(/[;]/)[0];
          if(i !== (array.length -1) && array[i+1].match(/[{]/) && (array[i].split("=")[1].trim() === "" || array[i].split("=")[1].trim().match(/(^function)/))){ //tests if anon function is declared
            if(enableLineAnimations === true){
              var hash = array[i+2].split(/\/\//)[1].split(/[=]/)[1];
            }
            newArray.push(array[i]);
            i++;
            newArray.push(array[i]);  
            newStack.push(variableName);
            newStack.push("var");
            if(enableLineAnimations === true){
              newStack.push(hash);
            }
            newStack.push("anonFunctionOrObject");
            continue;
          }
          if(enableLineAnimations === true){
            var hash = array[i].split(/\/\//)[1].split(/[=]/)[1];
            newArray.push(`visualizeLineNumbers(${hash});`);
          }
          newArray.push(array[i]);
          newArray.push(`currentFrame.addVariable("var", "${variableName}", ${variableName});`);
        }
        else if(array[i].match(/(^let)+([ ]+)/)){
            var variableName = array[i].split(/\/\//)[0].split(/^let/)[1].trim().split(/[=]/)[0].trim().split(/[;]/)[0];
            if(i !== (array.length -1) && array[i+1].match(/[{]/) && (array[i].split("=")[1].trim() === "" || array[i].split("=")[1].trim().match(/(^function)/))){ //tests if anon function is declared
              if(enableLineAnimations === true){
                var hash = array[i+2].split(/\/\//)[1].split(/[=]/)[1];
              }
              newArray.push(array[i]);
              i++;
              newArray.push(array[i]);  
              newStack.push(variableName);
              newStack.push("let");
              if(enableLineAnimations === true){
                newStack.push(hash);
              }
              newStack.push("anonFunctionOrObject");
              continue;
            }
            if(enableLineAnimations === true){
              var hash = array[i].split(/\/\//)[1].split(/[=]/)[1];
              newArray.push(`visualizeLineNumbers(${hash});`);
            }
            newArray.push(array[i]);
            newArray.push(`currentFrame.addVariable("let", "${variableName}", ${variableName});`);
        }
        else if(array[i].match(/(^const)+([ ]+)/)){
          var variableName = array[i].split(/\/\//)[0].split(/^const/)[1].trim().split(/[=]/)[0].trim().split(/[;]/)[0];
          if(i !== (array.length -1) && array[i+1].match(/[{]/) && (array[i].split("=")[1].trim() === "" || array[i].split("=")[1].trim().match(/(^function)/))){ //tests if anon function is declared
            if(enableLineAnimations === true){
              var hash = array[i+2].split(/\/\//)[1].split(/[=]/)[1];
            }
            newArray.push(array[i]);
            i++;
            newArray.push(array[i]);  
            newStack.push(variableName);
            newStack.push("const");
            if(enableLineAnimations === true){
              newStack.push(hash);
            }
            newStack.push("anonFunctionOrObject");
            continue;
          }
          if(enableLineAnimations === true){
            var hash = array[i].split(/\/\//)[1].split(/[=]/)[1];
            newArray.push(`visualizeLineNumbers(${hash});`);
          }
          newArray.push(array[i]);
          newArray.push(`currentFrame.addVariable("const", "${variableName}", ${variableName});`);
      }
      else if(array[i].match(/(^window)/)){
        var variableName = array[i].split(/\/\//)[0].split("=")[0];
        if(i !== (array.length -1) && array[i+1].match(/[{]/) && (array[i].split("=")[1].trim() === "" || array[i].split("=")[1].trim().match(/(^function)/))){ //tests if anon function is declared
          if(enableLineAnimations === true){
            var hash = array[i+2].split(/\/\//)[1].split(/[=]/)[1];
          }
          newArray.push(array[i]);
          i++;
          newArray.push(array[i]);  
          newStack.push(variableName);
          newStack.push("window");
          if(enableLineAnimations === true){
            newStack.push(hash);
          }
          newStack.push("anonFunctionOrObject");
          continue;
        }
        if(enableLineAnimations === true){
          var hash = array[i].split(/\/\//)[1].split(/[=]/)[1];
          newArray.push(`visualizeLineNumbers(${hash});`);
        }
        newArray.push(array[i]);
        newArray.push(`currentFrame.addVariable("window", "${variableName}", ${variableName});`);
      }
      else if(detectStatementVariableReassignment(array[i])){
          var variableName = array[i].split(/=/)[0].trim();  
          if(i !== (array.length -1) && array[i+1].match(/[{]/) && (array[i].split("=")[1].trim() === "" || array[i].split("=")[1].trim().match(/(^function)/))){
            if(enableLineAnimations === true){
              var hash = array[i+2].split(/\/\//)[1].split(/[=]/)[1];
            }
              newArray.push(array[i]);
              i++;
              newArray.push(array[i]);
              newStack.push(variableName);
              if(enableLineAnimations === true){
                newStack.push(hash);
              }
              newStack.push("variableRedeclaration");
              continue;
            }
            if(enableLineAnimations === true){
              var hash = array[i].split(/\/\//)[1].split(/[=]/)[1];
              newArray.push(`visualizeLineNumbers(${hash});`);
            }
            newArray.push(array[i]);
            newArray.push(`currentFrame.updateVariable("${variableName}", ${variableName});`);
        }
        else if(array[i].match(/(^return)/)){
          if(enableLineAnimations === true){
            var hash = array[i].split(/\/\//)[1].split(/[=]/)[1];
            newArray.push(`visualizeLineNumbers(${hash});`);
          }
          newArray.push(array[i]);
          // i++;
          // newArray.push(array[i]);
        }
        else if(array[i].match(/(^console.log)/)){
          if(enableLineAnimations === true){ 
            var hash = array[i].split(/\/\//)[1].split(/[=]/)[1];
          }
          var logString = array[i].split(/^([ ]*)+(?:[console])+([ ]*)+([.])+([ ]*)+(?:log)/gm)[5];
          logString = logString.split(/\/\//)[0];
          logString = logString.split(";")[0];
          logString = logString.slice(1, logString.length - 1);
          var logArray = JSON.stringify(logString.split(/,(?=(?:(?:[^"|^']*"){2})*[^"|^']*$)/));
          newArray.push(`{
          let logString = ${logArray}.map(log=>JSON.stringify(eval(log))).join(" ").replace(/["|']/g, '');
          if(enableLineAnimations === false){logToPage(logString);};
          storeLogs(logString);
          currentFrame.addConsoleLogs(logString)
          if(enableLineAnimations === true){
            visualizeLineNumbers(${hash}, logString);
          }
          }`);
        }  
        else if(array[i].match(/([}])(?![^(|"|']*\)|"|')/g)){
            if(newStack.peek() === "{"){
              newArray.push(array[i]);
              newStack.pop();
            }
            else if(newStack.peek() === "anonFunctionOrObject"){
            // console.log("hello");
            newStack.pop();
            if(enableLineAnimations === true){
              var hash = newStack.pop();
            }
            let type = newStack.pop();
            let name = newStack.pop();
            newArray.push(array[i]);
            if(enableLineAnimations === true){
              newArray.push(`visualizeLineNumbers(${hash});`);
            }
            newArray.push(`currentFrame.addVariable("${type}", "${name}", ${name});`);
          }
          else if(newStack.peek() === "function"){
            newArray.push(`}`)
            if(enableLineAnimations === true){
              var hash = array[i+1].split(/\/\//)[1].split(/[=]/)[1];
              newArray.push(`visualizeLineNumbers(${hash});`);
            }
            newArray.push(array[i]);
            newStack.pop();
          }
          else if(newStack.peek() === "variableRedeclaration"){
            newStack.pop();
            if(enableLineAnimations === true){
              var hash = newStack.pop();
            }
            let variableName = newStack.pop();
            newArray.push(array[i]);
            if(enableLineAnimations === true){
              newArray.push(`visualizeLineNumbers(${hash});`);
            }
            newArray.push(`currentFrame.updateVariable("${variableName}", ${variableName});`);
          }
          else if(newStack.peek() === "blockscope"){
            if(enableLineAnimations === true){
              var hash = array[i+1].split(/\/\//)[1].split(/[=]/)[1];
              newArray.push(`visualizeLineNumbers(${hash});`);
            }
            newArray.push('currentFrame = currentFrame.previousFrame;');
            newArray.push(array[i]);
            newStack.pop();
          }
          else if(newStack.peek() === "forBlockscope"){
            newStack.pop();
            let fhash = "f" + newStack.pop();
            if(enableLineAnimations === true){
              var hash = array[i+1].split(/\/\//)[1].split(/[=]/)[1];
              newArray.push(`visualizeLineNumbers(${hash});`);
            }
            newArray.push(array[i]);
            newArray.push(`${fhash} = undefined; currentFrame = currentFrame.previousFrame;`);
          }
          else if(newStack.peek() === "ifelse"){
            newArray.push('currentFrame = currentFrame.previousFrame;');
            newArray.push(array[i]);
            newStack.pop();
          }
        }
        else if(array[i].match(/([{])(?![^(|"|']*\)|"|')/)){
          if(newStack.peek() === "anonFunctionOrObject" || newStack.peek() === "variableRedeclaration"  || newStack.peek() === "{"){ //i learned a new syntax today
            newArray.push(array[i]);
            newStack.push("{");
          }else{
            if(enableLineAnimations === true){
              var hash = array[i+1].split(/\/\//)[1].split(/[=]/)[1];
              newArray.push(`visualizeLineNumbers(${hash});`);
            }
            newArray.push(array[i]);
            newArray.push(`currentFrame = new Frame(currentFrame, "genericBlock", "blocked");`);
            newStack.push("blockscope");
          }
        }else if(detectFunctionCalls(array[i])){
          if(enableLineAnimations === true){
            var hash = array[i].split(/\/\//)[1].split(/[=]/)[1];
            newArray.push(`visualizeLineNumbers(${hash});`);
          }
          newArray.push(array[i]);
        }
        else{
          if(enableLineAnimations === true && newStack.peek() !== "variableRedeclaration" && newStack.peek() !== "anonFunctionOrObject" && !array[i].match(/[:]/)){
          var hash = array[i].split(/\/\//)[1].split(/[=]/)[1];
          if(!array[i].match(/(^\/\/)/)){
            newArray.push(`visualizeLineNumbers(${hash});`);
          }
        }
          newArray.push(array[i]);
        }
        // console.log(newStack);
    }
    newArray = trimStringInArray(newArray);
    newArray = removeEmptyIndices(newArray);
    return newArray;
}
function variablesInjecters(data){
  let array = data.tokenArray;
  let i = data.index;
  let newArray = data.currentArray;
  let newStack = data.stack;
  let variableName = data.name;
  let variableType = data.type;

}
function makeConsoleTester(logs){ //please remake this
    if(logs.length === 0){
      return ``
    }
    return `
    var logs = ${JSON.stringify(logs)};
    for(log of logs){
      if(!searchFramesForConsoleLogging(log.val, log.scopeName, currentFrame)){
         window.failedTests.push("Expected scope : " + log.scopeName);
        window.failedTests.push("Failed to detect console.log output: " + log.val);
      }
    }
    `
  }
  
function makeVariableTester(vars){
  if(vars.length === 0){
    return ``
  }
  return `
  var vars = ${JSON.stringify(vars)};
  for(variable of vars){
    try{
      if(variable.scopeName === undefined){
        if(JSON.stringify(eval(variable.name)) != JSON.stringify(variable.val)){
          window.failedTests.push("Unable to find or match variable " + variable.name + " of type " + variable.type);
        }
      }else{
        if(searchFramesForVariable(variable.name, variable.val, variable.type, currentFrame, variable.scopeName) === false){
          window.failedTests.push("Unable to find or match variable " + variable.name + " of type " + variable.type);
        };
      }
    }catch{
      window.failedTests.push("Unable to find or match variable " + variable.name + " of type " + variable.type);
    }
  }
  `
}
   
  
function makeFunctionTester(functs){
  if(functs.length === 0){
    return ``;
  }else{
    var newArray = new Array();
    for(funct of functs){
      var name = funct.name;
      for(test of funct.tests){
        var fnCall = name + "(" + test.input +")";
        newArray.push(`
        try{
          var x = ${fnCall};
          if(x !== ${test.output}){
            window.failedTests.push(${JSON.stringify(fnCall)});
            console.log("in function : ${name}, your output: ", x, "expected output: ${test.output}");
            return;
          }
        }catch{
          window.failedTests.push(${JSON.stringify(fnCall)});
          console.log("error : function ${name} not found");
          return;
        }
        `);
      }
    }
    return newArray.join("\n");
  }
}