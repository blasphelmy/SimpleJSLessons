// var newTest = {
//     title: "",
//     text : "",
//       currentQuestion: 0,
//       testQuestionSet: [
//       {
//             title: "",
//             text: ``,
//             example: ``,
//             startingCode: ``,
//             functs: [],
//             logs: [],
//             vars: []
//         }

//       ],
// };

var newTest = {
    title: "Javascript Scoping Rules",
    text : "A lesson on Javascript's scoping rules. Below is a set of 14 questions designed to help you understand scoping in Javascript. In case you're unfamiliar with the term scoping, it's the set of rules that governs variables and functions inheritance given the context of where you are in your program",
      currentQuestion: 0,
      testQuestionSet: [
        // Part 1: Code Blocks Reference
        {
            text: `<h1>Part 1, Code Blocks Reference</h1><p>let's and const's are block framed, that means they are accessible only within the {} in which they were defined.</p>`,
            example:`Hit Run Code to begin lesson`,
            startingCode: ``
        },
        //Q1:1
        {
            number: "1",
            title: "Move the console.log inside the {}'s so that it no longer errors",
            text: "Fix up the code in the code editor so you no longer get an error message.",
            startingCode: `{
    let a = 0;
}
console.log(a);`,
            functs: [],
            logs: [{val: "0", scopeName: "genericBlock"}],
            vars: [{name: "a", val: 0, type: "let", scopeName : "genericBlock"}]
        },
        {
            text: "While we can't reference variables that are in a block we are not in, we can reference variables in blocks that are wrapping the block we are in.",
            example:`Hit Run Code to start the next question`,
            startingCode: "keep previous",
        },
        //Q1:2
        {
            number: "2",
            title: "Add a console.log(a,b) somewhere it'll be able to successfully reference both a and b.",
            text: `In other words, while only adding a console.log(a,b) somewhere get this code to console.log(0,1);`,
            startingCode: `{ // wrapping block
    let a = 0;
    { // inner block
        const b = 1;
    }
}`,
            functs: [],
            logs: [{val: "0 1", scopeName: "genericBlock"}],
            vars: [{name: "a", val: 0, type: "let", scopeName : "genericBlock"}, {name: "b", val: 1, type: "const", scopeName : "genericBlock"}]
        },
        //Q1:3
        {
            number: "3",
            text: `When referencing a variable, the variable that is referenced is the closest one out from where the reference happens. Here the console.log(a,b,c) will console.log out 2, 1, 0 because when it goes looking for a, b, and c it'll first find the a in the inner block, then it'll look in the middle block and find b, and then it'll look in the outer block and find c.`,
            example:`Hit Run Code to start the question`,
            startingCode: `{ // outer block
                let a = 0;
                const b = 0;
                let c = 0;
                { // middle block
                    const a = 1;                  
                    let b = 1;     
                    { // inner block
                        let a = 2; 
                        console.log(a,b,c);
                    }
                }
            }`,
        },
        {
            title: "Without touching the console.log change this code so that the console.log(a,b,c) logs out 0 0 0.",
            startingCode: "keep previous",
            functs: [],
            logs: [{val: "0 0 0", scopeName: "genericBlock"}],
            vars: [{name: "a", val: 0, type: "let", scopeName : "genericBlock"}],
            stringTests: ["console.log(a,b,c)"]

        },
        //Q1:4
        {
            number: "4",
            title: "Add a console.log(a) inside of every block where it'll log out a 1",
            text: ``,
            startingCode: `{
    let a = 0;
    {
        const a = 1;
        {
            let a = 2;
        }
        { 
        }
    }
}`,
            functs: [],
            logs: [{val: "1", scopeName: "genericBlock"}, {val: "1", scopeName: "genericBlock"}],
            vars: [],
            stringTests: ["console.log(a)", "console.log(a)"]
        },
        // Part 2: Code Block Assignment
        {
            
            text: "<h1>Part 2, Code Blocks Assignment</h1><p>In the last section we explained the innermost block rule for reference. When you reference a variable with (for example) a console.log(a),  JavaScript will first look in the local code block the console.log(a) is inside, then it will look in the code block that wraps that code block, and then the code block that wraps that one. The same rule applies to untagged assignment, start in the local block, go outward, and stop as soon as you find one.</p>",
            example:`Hit Run Code to start this section`,
            startingCode: `{//wrapper for wrapper for wrapper for local
    let a = 0; //the console.log never get's here
    {// wrapper for wrapper for local
        let a = 1; // looks here third and finds it!
        {// wrapper for local
            // looks here second
            {// local code block
                // looks here first
                console.log(a); // will log out 1
            }
        }
    }
}`
        },
        //Q2:1
        {
            number: "5",
            title: "Add a console.log(a) as the last line of each code block",
            startingCode: `{//wrapper for wrapper for wrapper for local
    let a = 0; // the a = 2 never gets here
    {// wrapper for wrapper for local
        let a = 1; // looks here third and finds it!
        {// wrapper for local
            // looks here second
            {// local code block
                // looks here first for an "a" we can set equal to 2
                a = 2;
                // here
            }
            // here
        }
        // here
    }
    // and here
}`,
            functs: [],
            logs: [{val: "0", scopeName: "genericBlock"}, {val: "2", scopeName: "genericBlock"}, {val: "2", scopeName: "genericBlock"}, {val: "2", scopeName: "genericBlock"}],
            stringTests: ["console.log(a)", "console.log(a)", "console.log(a)", "console.log(a)"],
            vars: [{name: "a", val: 0, type: "let" , scopeName: "genericBlock"}, {name: "a", type: "let", val: 2, scopeName: "genericBlock"}]
        },
        {
            text: `You should see a 2 2 2 0. The 2's are because all three inner blocks will log out the "a" contained in the "wrapper for the wrapper for local", and the a = 2 changed that variable to 2. The 0 is because that code block has it's own "a", and that "a" wasn't changed by the a = 2. The let a = 1 in some sense blocked the a = 2 from effecting it.`,
            example: "Hit Run Code to start the next question",
            startingCode: "keep previous",
        },
        // Q2:2
        {
            number: "6",
            title: "Now by removing one line of code make this code console.log out 2 2 2 2",
            text: ``,
            startingCode: "keep previous",
            functs: [],
            logs: [{val: "2", scopeName: "genericBlock"}, {val: "2", scopeName: "genericBlock"}, {val: "2", scopeName: "genericBlock"}, {val: "2", scopeName: "genericBlock"}],
            vars: [{name: "a", val: 2, type: "let", scopeName: "genericBlock"}],
            stringTests: ["console.log(a)", "console.log(a)", "console.log(a)", "console.log(a)"]
        },
        //Q2:3
        {
            number: "7",
            title: "Now add a new untagged assignment b = 3 under the a = 2. And a console.log(b) outside all the code blocks",
            text: `Because there are no b's in any of the wrapping code blocks
that assignment will search all the way out to the global frame outside all the blocks. When it get's there there is nowhere else for it to look so it will create a new global variable b and set it equal to 3. Place a console.log(b) outside all the code blocks.`,
            startingCode: `
{
    let a = 0; //the a = 2 never gets here
    {// wrapper for wrapper for local
        //looks here third
        {// wrapper for local
            //looks here second
            {// local code block
                //looks here first 
                a = 2;
                //assignment here
                console.log(a);
            }
            console.log(a);
        }
        console.log(a); 
    }
    console.log(a);
}
//console.log here
`,
            functs: [],
            logs: [{val: "3", scopeName: "default"}],
            vars: [{name: "b", val: 3, type:"default", scopeName: "default"}],
            stringTests: ["console.log(b)"]
        },
        {
            number: "8",
            text:`If you'd placed a console.log(a) where the console.log(b) is it would have error-ed out because there was no "a" there. Try doing that replacement, then after it errors out, try turning the a = 2 into a window.a = 2`,
            startingCode: "keep previous",
            vars:[{name: "a", val: 2, type:"default", scopeName: "default"}],
            stringTests: ["window.a = 2","console.log(a)", "console.log(a)", "console.log(a)", "console.log(a)", "console.log(b)"]
        },
        //Q2:4
        {
            text: `window is one of the more fun and horrible things in JavaScript. It is the global frame, and so no matter where you are in your code you can jump straight out and access and modify global variables without having to go through your wrapping blocks.`,
            example: `Hit Run Code to finish this module`,
            startingCode: "keep previous",
        },
        
    ],
};

var moreTests = [// Part 3: Functions Reference
{ 
    text: `<h1>Part 3, Functions Reference</h1><p>The rule for code blocks was relatively straightforward. You started locally and then you went outward through the nesting blocks. The rule for functions is a little more annoying. Instead of the "parent frame" being the wrapping code block the "parent frame" for a function call is the frame where the function was declared. The simplest version of this is for a function defined in the global frame.</p>`,
    example:`Hit Run Code to begin lesson`,
    startingCode: `var a = 2; // then we look in the parent frame and find that a is 2
    function example(){
        //We look here in the local frame first
        console.log(a);
    }
    example();`
},
//Q3:1
{
    number: "9",
    title: "Add a console.log(a) or console.log(b) after the var a = 1 so that the code logs out 0.",
    text: ``,
    example: `var a = 0;
var b = 0;
function example(){
var a = 1;
}
example();`,
    startingCode: `var a = 0;
var b = 0;
function example(){
var a = 1;
}
example();`,
    functs: [],
    logs: [{val: "0", scopeName: "example"}],
    vars: [{name:"a", type:"var", val:0, scopeName:"default"}, {name:"b", type:"var", val:0, scopeName:"default"}, {name:"a", type:"var", val:1, scopeName:"example"}],
    stringTests:["console.log(b)"]
},
//Q3:2
{
    number: "10",
    title: "Add a console.log(a,b,c) after the a = 2;",
    text: `This looks very similar to how things worked in the code blocks examples. But that's because every 
function is being called in the same frame where it was defined. And functions can be called from elsewhere. 
Let's take the example function defined inside definesFunction and call it from the global scope`,
    example: `var a = 0;
var b = 0;
var c = 0;
function definesFunction(){
var a = 1;
var b = 1;
function example(){
var a = 2;
}
example();
}
definesFunction();`,
    startingCode: `var a = 0;
var b = 0;
var c = 0;
function definesFunction(){
var a = 1;
var b = 1;
function example(){
var a = 2;
}
example();
}
definesFunction();`,
    functs: [],
    logs: [{val: "2 1 0", scopeName: "example"}],
    vars: [],
    stringTests: ["console.log(a,b,c)"]
},
//Q3:3
{
    number: "11",
    title: `replace the "example();" with "return example;" "definesFunction();" with "example = definesFunction();" and
add a "example();"" as the last line of the code.`,
    text: `example still has the same behavior, even though example is being called from the global frame! It still checks the definesFunction
variables (in particular the var b = 1) before looking at the global variables (including b = 0). This leads to some fun possibilities 
we'll explore in detail in the next part.`,
    example: `var a = 0;
var b = 0;
var c = 0;
function definesFunction(){
var a = 1;
var b = 1;
function example(){
var a = 2;
console.log(a,b,c);
}
example(); 
}
definesFunction(); 
`,
    startingCode: `var a = 0;
var b = 0;
var c = 0;
function definesFunction(){
var a = 1;
var b = 1;
function example(){
var a = 2;
console.log(a,b,c);
}
example(); 
}
definesFunction(); 
`,
    functs: [],
    logs: [],
    vars: [],
    stringTests: ["return example", "example = definesFunction()", "example()"]
},
//Q3:4
{
    number: "12",
    title: "Last challenge: add two lines below this code to trigger the console.log(num) inside function d.",
    text: ``,
    example: `var num = 0;
function a(){
var num = 1;
function b(){
function c(){            
    function d(){
        console.log(num);
    }
    window.d = d;
}
c();
}
b();
}
`,
    startingCode: `var num = 0;
function a(){
var num = 1;
function b(){
function c(){            
    function d(){
        console.log(num);
    }
    window.d = d;
}
c();
}
b();
}
`,
    functs: [],
    logs: [{val: "1", scopeName: "d"}],
    vars: [{name: "num", val: 1, type: "var", scopeName: "a"}],
    stringTests : ["console.log(num);", "a()", "d()"]
},
// Part 4 Function Assignment

{ 
    text: `<h1>Part 4, Functions Assignment</h1><p> The rules for block assignment parallelled the rules for block reference. Similarly the rules for function assignment parallel the rules for function reference. When doing an untagged assignment in a function, we first check if the local function has a preexisting variable of that name, then we check our "parent frame", then our "grandparent frame", and on like that. The change will happen to the first variable we find. And like with code blocks, if we eventually make it all the way to the global frame we'll create a global variable to take the assignment.</p>`,
    example:`Hit Run Code to begin lesson`,
    startingCode: ``
},

//Q4:1
{
    number: "13",
    title: `create a function called changeVariable with the lines "functionScoped = 1;" and "newGlobalScoped = 2;"`,
    text: `Make sure that these are untagged assignments I.e. do not have "var functionScoped = 1" or "let functionScoped = 1".`,
    example: ``,
    startingCode: ``,
    functs: [],
    logs: [],
    vars: []
}         

// {
//     title: "",
//     text: ``,
//     example: ``,
//     startingCode: ``,
//     functs: [],
//     logs: [],
//     vars: []
// } 
]