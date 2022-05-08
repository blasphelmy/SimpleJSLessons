`use strict`//yeah okay
var functionTestArray = [];
function createNewFNtab(name) {
  if (!name) {
    return;
  }
  let click = function (e) {
    activeFunctiontestTab = e.currentTarget.id;
    setActiveFunctionsTab(activeFunctiontestTab);
    editor.getDoc().setValue(function () {
      return functionMaps.get(activeFunctiontestTab);
    }());
  }
  let fnTabsContainer = document.getElementById("tabsContainer");
  let root = ReactDOM.createRoot(fnTabsContainer);
  let number = document.getElementsByClassName("functionTestTab").length;
  let id = "fnest-" + number;
  activeFunctiontestTab = "fnest-" + (number + 1);
  let element = function () {
    if (number === 0) {
      return (<div id={id} onClick={click} class="functionTestTab left">{name}</div>);
    }
    return (<div id={id} onClick={click} class="functionTestTab">{name}</div>);
  }();
  functionTestArray.push(element);
  root.render(functionTestArray);
  functionMaps.set(id, editor.getValue());
  editor.getDoc().setValue(`//your function here`);
  document.getElementById(`functNameInput`).value = "";
  // document.getElementById(id).addEventListener("click", function(){
  //   console.log("hello");
  // });
}