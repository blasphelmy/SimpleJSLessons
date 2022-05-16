'use strict';
var displayContents;

function displayTests (newData){
  var lessonPage = document.getElementById("lessonPage");
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
          if(newQuestion.example.trim() === ""){
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

function displayDemo(data){
  var lessonPage = document.getElementById("lessonPage");
  var root = ReactDOM.createRoot(lessonPage);
  var elements = new Array();
  elements.push(function(){
    return (
      <section className="reset-this">
      {function(){
        if(newData.signature){
          return <h2>Created by {newData.signature}</h2>
        }
      }()}  
        <style dangerouslySetInnerHTML={ { __html: data.css}}></style>
        <div dangerouslySetInnerHTML={ { __html: data.html}}></div>
      </section>
      );
  }());
  root.render(elements);
}

function displayError(data){
  ReactDOM.createRoot(lessonPage).render(function(){
    return <section><p>{data.error}</p></section>;
  }())
}