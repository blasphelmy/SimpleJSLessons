function splitBySemi(array) {
  let newArray = new Array();
  for (string of array) {
    if (string.match(/[;]/g)) {
      let temp = string.split(/([;])/g);
      for (substring of temp) {
        newArray.push(substring);
      }
    } else {
      newArray.push(string);
    }
  }
  return newArray;
}
function findMatching(array, start, token) { //token = "(" pr "{"
  //raw string -> breakIntoComponents() first. start is the index of the array where a function declartion is detected.
  var token_2 = null;
  if (token === "{") {
    token_2 = "}";
  } else if (token === "(") {
    token = (/([(])/);
    token_2 = (/([)])/);
  }
  var count = 0;
  var endLine = -1;
  for (index = start; index < array.length; index++) {
    if (array[index].search(token) > -1) {
      count = count + 1;
    }
    if (array[index].search(token_2) > -1) {
      count = count - 1;
    }
    if (count === 0 && array[index].search(token_2) > -1) {
      endLine = index;
      break;
    }
    // console.log(count);
  }
  return endLine;
}
function detectFunctionCalls(string) {
  const detectFunctCalls = new RegExp(/(^[a-zA-Z0-9]+)+([ ]*)+([(])+([a-z,A-Z,0-9,\s,.,+,-,*,/,=,"]*)+([)])/gm);
  //make improvements here https://regex101.com/r/MqSsCA/1
  if (detectFunctCalls.test(string)) {
    return true;
  }
  else {
    return false;
  }
}
function cleanString(string) {
  string = string.trim();
  if (string.lastIndexOf(";") > -1) {
    if (string.match(/^for/)) {
      return string;
    }
    string = string.substring(0, string.lastIndexOf(";"));
  }
  return string;
}
function hash(str) {
  let h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};
function checkForIllegalKW(string) {
  for (word of RULES) {
    if (new RegExp(`\\b${word}\\b`).test(string)) {
      window.logToPage(`ILLEGAL WORD: ${word}`);
      return true;
    }
  }
  return false;
}
function breakIntoComponents(inputString) {
  inputString = inputString.split("\n");
      inputString = commentsCleanse(inputString);
      if (checkForIllegalKW(inputString.join("\n"))) {
        return;
      }
      let newSeed = Math.random() * 17;
      for (let i in inputString) {
        let newHash = hash(i + newSeed + "");
        inputString[i] = cleanString(inputString[i]) + "//lineNumber=" + newHash;
        lineNumberMap.set(newHash, Number(i));
      }
      inputString = trimStringInArray(inputString);
      inputString = removeEmptyIndices(inputString);
      // inputString.match(/[^\;]+\;?|\;/g);
      inputString = splitByBrackets(inputString);
      //  outputArray = combineSemiColonsWithPreviousLines(outputArray);
      inputString = removeEmptyIndices(inputString);
      inputString = injectHelpers(inputString);
  return inputString;
}
function commentsCleanse(array) {
  let newArray = new Array();
  for (string of array) {
    if (string.match(/(?:\/\/)/)) {
      let cleansedString = string.split(/(?:\/\/)/)[0];
      newArray.push(cleansedString);
    } else {
      newArray.push(string);
    }
  }
  // newArray = removeEmptyIndices(newArray);
  return newArray;
}
function splitByBrackets(inputString) {
  var outputArray = new Array();
  for (var x = 0; x < inputString.length; x++) {
    var temp = inputString[x].split(/([{}])(?![^(|"|']*\)|"|')/g);
    for (var index = 0; index < temp.length; index++) {
      outputArray.push(temp[index]);
    }
  }
  outputArray = trimStringInArray(outputArray);
  outputArray = removeEmptyIndices(outputArray);
  return outputArray;
}
function trimStringInArray(array) {
  // for (var index = 0; index < array.length; index++) {
  //   array[index] = array[index].trim();
  // }
  return array;
}
function removeEmptyIndices(array) {
  //clean array if nothing is detected on indexes
  var newArray = new Array();
  for (var index = 0; index < array.length; index++) {
    if (!(array[index].trim().length === 0)) {
      newArray.push(array[index]);
    }
  }
  return newArray;
}
function combineSemiColonsWithPreviousLines(array) { //cause i cant figure out how to split by semi colons on the 
  var newArray = new Array();                       //same line. whelps
  for (var index = 0; index < array.length; index++) {
    if (array[index].match(";")) {
      var temp = array[index - 1] + array[index];
      newArray.push(temp);
    } else if (index >= array.length - 1) {
      newArray.push(array[index] + ";");
    } else if (!array[index + 1].match(";")) {
      newArray.push(array[index]);
    }
  }
  newArray = trimStringInArray(newArray);
  newArray = removeEmptyIndices(newArray);
  return newArray;
}
function splitIntoTokens(array) { //ONLY USE THIS AFTER INPUT STRING IS COMPLETELY BROKEN DOWN AND CLEANSED.
  var newArray = new Array();
  for (var index = 0; index < array.length; index++) {
    //FOR FUNCTION DECLARATIONS
    if (array[index].match(/(^function)+([ ]+)/gm)) {
      var temp = array[index].split(/(^function)+([ ]+)/gm);
      temp = removeEmptyIndices(temp);
      temp[0] = temp[0] + " ";
      // console.log(temp);
      for (var x = 0; x < temp.length; x++) {
        newArray.push(temp[x]);
      }
    }
    //FOR VARIABLE DECLARATIONS
    else if (array[index].match(/(^var)+([ ]+)/gm)) {
      var temp = array[index].split(/(^var)+([ ]+)/gm);
      temp = removeEmptyIndices(temp);
      temp[0] = temp[0] + " ";
      for (var x = 0; x < temp.length; x++) {
        newArray.push(temp[x]);
      }
    } else if (array[index].match(/(^let)+([ ]+)/gm)) {
      var temp = array[index].split(/(^let)+([ ]+)/gm);
      temp = removeEmptyIndices(temp);
      temp[0] = temp[0] + " ";
      for (var x = 0; x < temp.length; x++) {
        newArray.push(temp[x]);
      }
    } else { //EVERYTHING ELSE SHOULD JUST BE REGULAR STATEMENTS, ei variable declare / redeclaration, function calls,  in theory this method should allow for the addition of if's loops etc...
      newArray.push(array[index]);
    }
  }
  return newArray;
}
function detectStatementVariableReassignment(string) {
  const detectVarReassignStatement = new RegExp(/^([a-zA-Z0-9]*[ ]*[=][ , a-zA-Z, 0-9, *, /, +, -, ;]*)/gm);
  //improve this regex here: https://regex101.com/r/Gp6J3c/1
  return detectVarReassignStatement.test(string);
}