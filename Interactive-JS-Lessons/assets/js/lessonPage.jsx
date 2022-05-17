'use strict';
var displayContents;

function displayTests (newData){
  var lessonPage = lessonPageIFrame.contentDocument.getElementById("lessonPage");
  var root = ReactDOM.createRoot(lessonPage);
  var elements = new Array();
  if(newData.signature){
    elements.push(<section><h1>Answers by {newData.signature}</h1></section>)
  }
  elements.push(function(){
      return (
        <section><h1>{newData.title}</h1><p>{newData.text}</p></section>
        );
    }());
  for(let i in newData.returnQuestionSet()){
    let newQuestion = newData.returnQuestionSet()[i];
    if(newData.signature){
    } 
    elements.push(function(){
      return (<section id={`test-num-${i}`} className={function(){
        if(Number(i) < localStorage.getItem(`${currentLabID}`)){
          return "fadeOut";
        }
      }()}>    
      {function(){
        if(newQuestion.title !== '' || newQuestion.number !== ''){
          return <h2>{newQuestion.number ? newQuestion.number+")" : ""}{newQuestion.title ? newQuestion.title : ""}</h2>
        }
      }()}
      <p dangerouslySetInnerHTML={ { __html: newQuestion.text}}></p>
      {function(){
      if(newData.type === "lessonAnswers"){
        return <div style={{marginBottom: 20}} className={`example` + function(){
          if(newQuestion.startingCode.trim() === ""){
            return "hide";
          }else{
            return '';
          }
        }()}><p dangerouslySetInnerHTML={ { __html: "Your Answer: \n"+ newQuestion.startingCode}}></p></div>
      }
    }()}
    <div className={`example` + function(){
      if(newQuestion.example.trim() === ""){
        return "hide";
      }else{
        return '';
      }
    }()}><p dangerouslySetInnerHTML={ { __html: newQuestion.example}}></p></div>
  </section>)
    }());
  }
  root.render(elements);
}

function displayDemo(){
  lessonPageIFrame.srcdoc = `
    <div id="lessonPage" class="heightAdjustment" style="width: 100;height:100vh;overflow: scroll;">
      <section>
        <div>${newData.html}</div>
        <style>${newData.css}</style>
      </section>
    </div>`
}

function displayError(data){
  ReactDOM.createRoot(lessonPage).render(function(){
    return <section><p>{data.error}</p></section>;
  }())
}