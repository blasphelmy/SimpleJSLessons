window.onload = function(){
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