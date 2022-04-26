function injectHelpers(array, start){
  // console.log("array before injection : ", array);
    var newArray = new Array();
    var newStack = new Stack();
    if(typeof(start) === "undefined"){
        start = 0;
    }
    for(i = start; i < array.length; i++){ //this is bound to cause bugs later on.
        if(array[i].match(/(^function)+([ ]+)/)){ 
            newStack.push("function");
            var functionName = array[i].split(/(^function)+([ ]+)/);
            var functionName = removeEmptyIndices(functionName)[1].split(/([a-zA-Z0-9 ]+)+([(])/)[1];
            var inputs = trimStringInArray(array[i].split("function ")[1].split(/[(|)]/)[1].split(","));
            // console.log("inputs: ", inputs);
            // console.log("functionName", functionName);
            newArray.push(`currentFrame.declaredFunctions.set("${functionName}", true);`);
            newArray.push(array[i]);
            i++;
            newArray.push(array[i]);
            newArray.push(`currentFrame = new Frame(currentFrame, "${functionName}");`);
            for(string of inputs){
              if(string !== ""){
                newArray.push(`currentFrame.addVariable("var", "${string}", ${string});`); //all javascript inputs are var's
              }
            }
            // newArray.push(`functionDeclared.set("${functionName}", currentFrame);`);
        }
        else if(array[i].match(/(^if)/) || array[i].match(/(^else)/)){ 
          newStack.push("ifelse");
          newArray.push(array[i]);
        }  
        else if(array[i].match(/(^var)+([ ]+)/)){
          var variableName = array[i].split(/^var/)[1].trim().split(/[=]/)[0].trim().split(/[;]/)[0];
          if(array[i+1].match(/[{]/)){ //tests if anon function is declared
            newArray.push(array[i]);
            i++;
            newArray.push(array[i]);
            newStack.push(variableName);
            newStack.push("var");
            newStack.push("anonFunctionOrObject");
            continue;
          }
          newArray.push(array[i]);
          newArray.push(`currentFrame.addVariable("var", "${variableName}", ${variableName});`);
        }
        else if(array[i].match(/(^let)+([ ]+)/)){
            var variableName = array[i].split(/^let/)[1].trim().split(/[=]/)[0].trim().split(/[;]/)[0];
            if(array[i+1].match(/[{]/)){
              newArray.push(array[i]);
              i++;
              newArray.push(array[i]);
              newStack.push(variableName);
              newStack.push("let");
              newStack.push("anonFunctionOrObject");
              continue;
            }
            newArray.push(array[i]);
            newArray.push(`currentFrame.addVariable("let", "${variableName}", ${variableName});`);
        }
        else if(array[i].match(/(^const)+([ ]+)/)){
          var variableName = array[i].split(/^const/)[1].trim().split(/[=]/)[0].trim().split(/[;]/)[0];
          if(array[i+1].match(/[{]/)){
            newArray.push(array[i]);
            i++;
            newArray.push(array[i]);
            newStack.push(variableName);
            newStack.push("const");
            newStack.push("anonFunctionOrObject");
            continue;
          }
          newArray.push(array[i]);
          newArray.push(`currentFrame.addVariable("const", "${variableName}", ${variableName});`);
      }
      else if(detectStatementVariableReassignment(array[i])){
          var variableName = array[i].split(/=/)[0].trim();  
          if(array[i+1].match(/[{]/)){
              newArray.push(array[i]);
              i++;
              newArray.push(array[i]);
              newStack.push(variableName);
              newStack.push("variableRedeclaration");
              continue;
            }
            newArray.push(array[i]);
            newArray.push(`currentFrame.updateVariable("${variableName}", ${variableName});`);
        }
        else if(array[i].match(/(^return)/)){
            newArray.push("currentFrame = currentFrame.returnParentFrame();")
            newArray.push(array[i]);
            // i++;
            // newArray.push(array[i]);
        }
        else if(array[i].match(/(^console.log)/)){ 
          // var logString = array[i].match(/(?<=\()(.+)(?=\))/)[0];
          var logString = array[i].split(/^([ ]*)+(?:[console])+([ ]*)+([.])+([ ]*)+(?:log)/gm)[5];
          // console.log("logstring is", logString);
          var logArray = JSON.stringify(logString.split(/,(?=(?:(?:[^"|^']*"){2})*[^"|^']*$)/));
          newArray.push(`{
            let logString = ${logArray}.map(log=>JSON.stringify(eval(log))).join(" ").replace(/["|']/g, '');
            logToPage(logString);
            storeLogs(logString);
          }`);
        }  
        else if(array[i].match(/}/g)){
          if(newStack.peek() === "anonFunctionOrObject"){
            // console.log("hello");
            newStack.pop();
            newArray.push(array[i]);
            let type = newStack.pop();
            let name = newStack.pop();
            newArray.push(`currentFrame.addVariable("${type}", "${name}", ${name});`);
          }
          else if(newStack.peek() === "function"){
            newArray.push("currentFrame = currentFrame.returnParentFrame();")
            newArray.push(array[i]);
            newStack.pop();
          }
          else if(newStack.peek() === "variableRedeclaration"){
            newStack.pop();
            let variableName = newStack.pop();
            newArray.push(array[i]);
            newArray.push(`currentFrame.updateVariable("${variableName}", ${variableName});`);
          }
          else if(newStack.peek().match(/{/g) || newStack.peek() === "ifelse"){
            newArray.push(array[i]);
            newStack.pop();
          }
        }
        else if(array[i].match(/{/)){
          newArray.push(array[i]);
          newStack.push("{");
        }
        else{
            newArray.push(array[i]);
        }
        // console.log(newStack);
    }
    newArray = trimStringInArray(newArray);
    newArray = removeEmptyIndices(newArray);
    return newArray;
}
function makeConsoleTester(logs){ //please remake this
    if(logs.length === 0){
      return ``
    }
    return `
    var logs = ${JSON.stringify(logs)};
    for(log of logs){
      if(storedLogs.indexOf(log) === -1 ){
        failedTests.push(log);
      }else{
        storedLogs.splice(storedLogs.indexOf(log), 1);
      }
    }
    `
  }
  function searchFramesForVariable(variableName, value, startingFrame, frameName){
    if(
      startingFrame.findVariable(variableName) && //we need to check if the variable exists (otherwise the next check will error)
      startingFrame.findVariable(variableName).value === value && //if it does exist we need to check that the values matches
      frameName === startingFrame.name)  // and we need to check if the frameNames match
    {
      return true;
    }
    for(child of startingFrame.childrenFrame){ //If we didn't find it in this frame, check all its children recursively
      if(searchFramesForVariable(variableName, value, child, frameName)){
        return true;
      }
    }
    return false;
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
        if(JSON.stringify(eval(variable.name)) !== JSON.stringify(variable.val)){
          failedTests.push(variable);
        }
      }else{
        if(searchFramesForVariable(variable.name, variable.val, currentFrame, variable.scopeName) === false){
          failedTests.push(variable);
          logToPage("Unable to find or match variable " + variable.name);
        };
      }
    }catch{
      failedTests.push(variable);
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
            failedTests.push(${JSON.stringify(fnCall)});
            console.log("in function : ${name}, your output: ", x, "expected output: ${test.output}");
            return;
          }
        }catch{
          failedTests.push(${JSON.stringify(fnCall)});
          console.log("error : function ${name} not found");
          return;
        }
        `);
      }
    }
    return newArray.join("\n");
  }
}