window.onload = function(){
    document.getElementById("loadJS").addEventListener("click", function(){
        activeContent = "JS";
        editor.setValue(localStorage.getItem("textArea" + currentLabID));
    });
    document.getElementById("loadCSS").addEventListener("click", function(){
        activeContent = "CSS";
        editor.setValue(localStorage.getItem("textAreaCSS" + currentLabID) || newTest.css);
    });
    document.getElementById("loadHTML").addEventListener("click", function(){
        activeContent = "HTML";
        editor.setValue(localStorage.getItem("textAreaHTML" + currentLabID) || newTest.html);
    });

    var element = document.getElementsByClassName("heightAdjustment");
    var elementOffSetter = document.getElementById("navBar");
    fillVerticalHeight(element, elementOffSetter.offsetHeight);
    var x = elementOffSetter.offsetHeight;
    element = document.getElementById("codeEditor");
    elementOffSetter = document.getElementById("ConsoleContainer");
    var y = document.getElementById("runButtonContainer").offsetHeight;
    fillVerticalHeight(element, elementOffSetter.offsetHeight + x + y);
    document.getElementById("searchButton").addEventListener("click", function(){
        var newLabID = document.getElementById("searchField").value;
        if(window.location.href.match("simplejsclasses")){
            window.location.href = "/Interactive-JS-Lessons/?labID=" + newLabID;
        }else{
            window.location.href = "?labID=" + newLabID;
        }
    });
    fetchData();
}
window.onresize = function(){
    var element = document.getElementsByClassName("heightAdjustment");
    var elementOffSetter = document.getElementById("navBar");
    fillVerticalHeight(element, elementOffSetter.offsetHeight);
    var x = elementOffSetter.offsetHeight;
    element = document.getElementById("codeEditor");
    elementOffSetter = document.getElementById("ConsoleContainer");
    var y = document.getElementById("runButtonContainer").offsetHeight;
    fillVerticalHeight(element, elementOffSetter.offsetHeight + x + y);
}
function fillVerticalHeight(targetElement, offsetHeight){
    if(targetElement.length > 0){
        for(var i = 0; i < targetElement.length; i++){
            targetElement[i].style.height = (window.innerHeight - offsetHeight) + "px";
        }
    }else{
        targetElement.style.height = (window.innerHeight - offsetHeight) + "px";
    }
}