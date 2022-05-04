class Test{
  title;
  text;
  testQuestionSet;
  currentQuestion;
  constructor(data){
    this.title = data.title;
    this.text = data.text;
    this.testQuestionSet = new Array();
    this.currentQuestion = 0;
    if(data){
      for(var i = 0; i < data.testQuestionSet.length; i++){
        var newQuestion = new Question(data.testQuestionSet[i]);
        this.addQuestion(newQuestion);
      }
    }
  }
  //add question setters and getters
  addQuestion(newQuestion){
    this.testQuestionSet.push(newQuestion);
  }
  nextQuestion(){
    this.currentQuestion++;
    if(this.testQuestionSet[this.currentQuestion].startingCode !== ("keep previous" || undefined)){
      editor.getDoc().setValue(this.testQuestionSet[this.currentQuestion].startingCode);  
    }
    localStorage.setItem(("textArea" + currentLabID), editor.getValue());
    localStorage.setItem(`${currentLabID}`, newTest.currentQuestion);
    if(this.currentQuestion > this.testQuestionSet.length-1){
      localStorage.setItem(`${currentLabID}`, this.testQuestionSet.length+1);
    }
    if(this.currentQuestion >= this.testQuestionSet.length){
      this.currentQuestion = this.testQuestionSet.length-1;
    }
  }
  returnCurrentQuestion(){
    if(this.currentQuestion >= this.testQuestionSet.length){
      this.currentQuestion = this.testQuestionSet.length-1;
    }
    return this.testQuestionSet[this.currentQuestion];
  }
  returnQuestionSet(){
    return this.testQuestionSet;
  }
}
class Question{
  number;
  title;
  text; //Question - a string
  example;
  logs;//array of console.logs to be detected 
  vars; //variables to be detected
  functs; //functions to be made, along with tests.
  stringsTests;//stack of strings
  //we got three types of questions so far, asking for console.logs; asking to create variables with specific values, function name and expected inputs/outputs
  startingCode;
  constructor(data){
    this.number = data.number || "";
    this.text = data.text || "";
    this.logs = data.logs || [];
    this.vars = data.vars || [];
    this.functs = data.functs || [];
    this.stringsTests = data.stringTests || [];
    this.title = data.title || "";
    this.example = data.example || "";
    this.startingCode = data.startingCode || "//your code here";
  }
  returnText(){
    return this.text;
  }
  returnConsoleTests(){
    return this.logs;
  }
  returnVariableTests(){
    return this.vars;
  }
  returnFunctionTests(){
    return this.functs;
  }
  addConsoleRequirements(testCase){ //could be a number or string. 
    this.logs.push(testCase);
  }
  addVariableRequirements(newVariableTest){
    this.vars.push({name: newVariableTest.name, val: newVariableTest.val, path: newVariableTest.scopeName});
  }
  addFunctionRequirements(newFunctionTest){ //string, array[{input = "", output = ""}, ..]
    this.functs.push({name: newFunctionTest.name, tests : newFunctionTest.tests});
  }
  
}
class variableTest{
  type; //eg var, let, or... am i missing anything? *currently not used.
  name; //name
  val; //value. strings allowed
  scopeName;
  constructor(name, value, scopeName){
    this.name = name;
    this.val = value;
    this.scopeName = scopeName;
  }
}
class functionTest{
  name; //function name without the parenthesis
  tests; //
  functionDefinition;
  constructor(name){
    this.name = name;
    this.tests = new Array();
    this.functionDefinition = "";
  }
  addTest(testInput, expectedOutput){ //testInput = "<string>" ie: "3", 
    this.tests.push({input: testInput, output : expectedOutput});
  }
}

//frame objects
function returnFrameContainingVariable(newFrame, variableName){
  while (!newFrame.variables.has(variableName) && typeof (newFrame.previousFrame) !== "undefined") {
    newFrame = newFrame.previousFrame;
  }
  return newFrame;
}
function returnFrameContainingFunctionDEF(newFrame, functionName){
  while (!newFrame.declaredFunctions.has(functionName) && typeof (newFrame.previousFrame) !== "undefined") {
    newFrame = newFrame.previousFrame;
  }
  return newFrame;
}
function searchFramesForFunctionDef(functionName, startingFrame){
  if(startingFrame.declaredFunctions.get(functionName)){
    return startingFrame.declaredFunctions.get(functionName);
  }
  for(child of startingFrame.childrenFrame){ //If we didn't find it in this frame, check all its children recursively
    if(searchFramesForFunctionDef(functionName, child)){
      return child;
    }
  }
  return startingFrame.returnDefaultFrame();
}
function searchFramesForVariable(variableName, value, type, startingFrame, frameName){
  if(
    startingFrame.variables.get(variableName) && //we need to check if the variable exists (otherwise the next check will error)
    startingFrame.variables.get(variableName).value === value &&
    startingFrame.variables.get(variableName).type === type && //if it does exist we need to check that the values matches
    frameName === startingFrame.name
    )  // and we need to check if the frameNames match
    {
    return true;
  }
  for(child of startingFrame.childrenFrame){ //If we didn't find it in this frame, check all its children recursively
    if(searchFramesForVariable(variableName, value, type, child, frameName)){
      return true;
    }
  }
  return false;
}
function searchFramesForConsoleLogging(consoleString, frameName, startingFrame){
  if(startingFrame.searchInConsoleLog(consoleString) && startingFrame.name === frameName){
    startingFrame.consoleLogs[startingFrame.consoleLogs.indexOf(consoleString)] = null;
    return true;
  }
  for(child of startingFrame.childrenFrame){
    if(searchFramesForConsoleLogging(consoleString, frameName, child)){
      return true;
    }
  }
  return false;
}
var frameCounter;
class Frame { //SHOULD PROBABLY ABSTRACT
  name; //ie convertFtoC or "default", "if", "else", "while", "for" etc....
  type; //blocked or function scoped? "blocked" "scoped"
  declaredFunctions; //blocks share the same pool of functions as its parent scope, and any functions declared within a block gets its declaration hoisted to the next function or global scope => 2
  variables;
  consoleLogs;
  previousFrame;
  childrenFrame; //2 => however, a function that gets called gets its scope attacted to the block or function it was declared inside. so that means a block frame can function scopes as a child frame
  blockFrames;
  counter;
  constructor(currentFrame, newName, type){
    this.variables = new Map();
    this.childrenFrame = new Array();
    this.blockFrames = new Array();
    this.declaredFunctions = new Map(); //{functionName, [reference to declaration]}
    this.consoleLogs = new Array(); //(expression), results
    if(typeof(newName) === "undefined"){
      this.name = "default";
      this.type = "scoped";
      this.counter = frameCounter = 0;
      frameCounter++;
    }else if(type === "blocked"){
      this.name = newName;
      this.type = type;
      this.counter = frameCounter;
      frameCounter++;
      this.previousFrame = currentFrame;
      currentFrame.childrenFrame.push(this);
    }
    else{
      this.counter = frameCounter;
      frameCounter++;
      this.name = newName;
      this.type = type;
      currentFrame = returnFrameContainingFunctionDEF(currentFrame, newName);
      currentFrame.childrenFrame.push(this); //adds to beggining of array so the most recent versions will always be used
      this.previousFrame = currentFrame;
    }
  }
  searchInConsoleLog(searchString){
    for(let i = 0; i < this.consoleLogs.length; i++){
      if(this.consoleLogs[i] == searchString){
        return true;
      }
    }
    return false;
  }
  returnDefaultFrame(){
    var newFrame = this;
    while(typeof(newFrame.previousFrame) !== "undefined"){
      newFrame = newFrame.previousFrame;
    }
    return newFrame;
  }
  returnParentFrame(){
    if(typeof(this.previousFrame) === "undefined"){
      return this;
    }
    if(this.type === "blocked"){
      var newFrame = this;
      while(newFrame.type === "blocked"){
        newFrame = newFrame.previousFrame;
        if(newFrame.name === "default"){
          return newFrame;
        }
      }
      return newFrame.previousFrame;
    }
    return this.previousFrame;
  }
  returnPreviousFunctionScope(){
    let newFrame = this;
    while(newFrame.type === "blocked" && typeof(newFrame.previousFrame) !== "undefined"){
      newFrame = newFrame.previousFrame;
    }
    return newFrame;
  }
  addVariable(type, name, value){
    if(type === "var"){
      var newFrame = this;
      while(newFrame.type === "blocked"){
        newFrame = newFrame.previousFrame;
      }
      newFrame.variables.set(name, new Variable(type, name, value));
    }else if(type === "const" || type === "let" || type === "default"){
      this.variables.set(name, new Variable(type, name, value));
    }
  }
  addConsoleLogs(results){
    this.consoleLogs.push(results)
  }
  updateVariable(name, value){
    var newFrame = returnFrameContainingVariable(this, name);
    //logdup(newFrame.name + " contains " + name);
    if(newFrame.variables.has(name)){
      var newVariable = newFrame.variables.get(name);
      newVariable.value = value;
      newFrame.variables.set(name, newVariable)
    }else{
      newFrame.addVariable("default", name, value);
    }
  }
  findVariable(variableName, scope){
    return this.variables.get(variableName);
  }

}

class Variable{
  type; //lets, or vars
  name; //variable name
  value; //value
  constructor(type, name, value){
    this.type = type;
    this.name = name;
    this.value = value;
  }
}
//general
class Stack {
  top;
  newStack;
  constructor(data){
    if(data){
      this.newStack = data;
      this.top = this.newStack.length-1;
    }else{
      this.newStack = [];
      this.top = -1;
    }
  }
  push(data){
    this.top++;
    this.newStack[this.top] = data;
  }
  pop(index){
    if(index === 0 || index){ 
        do{
          this.newStack[index] = this.newStack[index+1];
          index++;
        }while(index <= this.top)
    }else{
      var newData = this.newStack[this.top];
      this.newStack[this.top] = null;
    }
    this.top--;

    if(this.top < -1){ //prevent the marker from going out of bounds/overflow
      this.top = -1;
    }
    return newData;
  }
  peek(){
    return this.newStack[this.top];
  }
  size(){
    return this.top + 1;
  }
  getIndexOfandPop(string){
    if(this.top < 0){
      return;
    }
    let index = function(newStack, top, string){
      for(let i = 0; i <= top; i++){
        if(cleanString(newStack[i]) == cleanString(string)){
          return i;
        }
      }
      return -1;
    }(this.newStack, this.top, string);
    if(index === -1){
      return undefined;
    }
   this.pop(index);
  }
}
//others
class Clock{
  tick;
  constructor(){
      this.tick = "tock";
  }
  getTick(){
      switch(this.tick){
          case "tick" : this.tick = "tock"; break;
          case "tock" : this.tick = "tick"; break;
      }
      return this.tick;
  }
}