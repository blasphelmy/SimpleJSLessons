window.onmessage = function(e) {
    if (e.data) {
        logToPage(e.data)
    }
};
window.onload = function () {
    lessonPageIFrame = document.getElementById('lessonPage');
    var element = document.getElementsByClassName("heightAdjustment");
    // var elementOffSetter = document.getElementById("navBar");
    var elementOffSetter = {
        offsetHeight: 0
    }
    fillVerticalHeight(element, elementOffSetter.offsetHeight);
    var x = elementOffSetter.offsetHeight;
    element = document.getElementById("codeEditor");
    elementOffSetter = document.getElementById("ConsoleContainer");
    var y = document.getElementById("runButtonContainer").offsetHeight;
    fillVerticalHeight(element, elementOffSetter.offsetHeight + x + y);
    // document.getElementById("searchButton").addEventListener("click", function () {
    //     var newLabID = document.getElementById("searchField").value;
    //     if (window.location.href.match("simplejsclasses")) {
    //         window.location.href = "/Interactive-JS-Lessons/?labID=" + newLabID;
    //     } else {
    //         window.location.href = "?key=" + newLabID;
    //     }
    // });
    extractURLParems();
    currentLabID = urlParameters.get("key") || 268945738906855;
    localStorage.setItem("saveTokenID", urlParameters.get("saveTokenID") || localStorage.getItem("saveTokenID"));
    fetchData(currentLabID);
}
window.onresize = function () {
    var element = document.getElementsByClassName("heightAdjustment");
    // var elementOffSetter = document.getElementById("navBar");
    var elementOffSetter = {
        offsetHeight: 0
    }
    fillVerticalHeight(element, elementOffSetter.offsetHeight);
    var x = elementOffSetter.offsetHeight;
    element = document.getElementById("codeEditor");
    elementOffSetter = document.getElementById("ConsoleContainer");
    var y = document.getElementById("runButtonContainer").offsetHeight;
    fillVerticalHeight(element, elementOffSetter.offsetHeight + x + y);
}
function fillVerticalHeight(targetElement, offsetHeight) {
    if (targetElement.length > 0) {
        for (var i = 0; i < targetElement.length; i++) {
            targetElement[i].style.height = (window.innerHeight - offsetHeight) + "px";
        }
    } else {
        targetElement.style.height = (window.innerHeight - offsetHeight) + "px";
    }
}
function extractURLParems() {
    try {
        let parameters = window.location.href.split("?")[1].split("&");
        for (parameter of parameters) {
            let keyValue = parameter.split("=");
            urlParameters.set(keyValue[0], keyValue[1]);
        }
    } catch (error) {
        console.log(error);
    }
}