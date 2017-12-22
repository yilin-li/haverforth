// See the following on using objects as key/value dictionaries
// https://stackoverflow.com/questions/1208222/how-to-do-associative-array-hashing-in-javascript
var words = {
    "+": function(stack) {
        var second = stack.pop();
        var first = stack.pop();
        stack.push(first+second); },
    "-": function(stack) {
        var second = stack.pop();
        var first = stack.pop();
        stack.push(first-second); },
    "*": function(stack) {
        var second = stack.pop();
        var first = stack.pop();
        stack.push(first*second); },
    "/": function(stack) {
        var second = stack.pop();
        var first = stack.pop();
        stack.push(first/second); },
    "nip": function(stack) {
        var top = stack.pop();
        stack.pop();
        stack.push(top); },
    "swap": function(stack) {
        var second = stack.pop();
        var first = stack.pop();
        stack.push(second);
        stack.push(first); },
    "over": function(stack) {
        var second = stack.pop();
        var first = stack.pop();
        stack.push(first);
        stack.push(second);
        stack.push(first); },
    ">": function(stack) {
        var second = stack.pop();
        var first = stack.pop();
        if (first > second) {
            stack.push(-1);}
        else {
            stack.push(0);}},
    "=": function(stack) {
        var second = stack.pop();
        var first = stack.pop();
        if (first === second) {
            stack.push(-1);}
        else {
            stack.push(0);}},
    "<": function(stack) {
        var second = stack.pop();
        var first = stack.pop();
        if (first < second) {
            stack.push(-1);}
        else {
            stack.push(0);}
    },
    "circ": function(stack) {
        // consumes r, x, y
        //https://www.w3schools.com/tags/canvas_arc.asp
        var y = stack.pop();
        var x = stack.pop();
        var r = stack.pop();
        var c=document.getElementById("canvas");
        var ctx=c.getContext("2d");
        ctx.beginPath();
        ctx.arc(x,y,r,0,2*Math.PI);
        ctx.stroke();
    },
    "rect": function(stack) {
        // consumes x, y, width, height
        var h = stack.pop();
        var w = stack.pop();
        var y = stack.pop();
        var x = stack.pop();
        var c=document.getElementById("canvas");
        var ctx=c.getContext("2d");
        ctx.fillRect(x,y,w,h);
    }

};

var user_defined = {};

/**
 * Your thoughtful comment here.
 */
function emptyStack() {
    window.stack.clear();
}

/**
 * Print a string out to the terminal, and update its scroll to the
 * bottom of the screen. You should call this so the screen is
 * properly scrolled.
 * @param {Terminal} terminal - The `terminal` object to write to
 * @param {string}   msg      - The message to print to the terminal
 */
function print(terminal, msg) {
    terminal.print(msg);
    $("#terminal").scrollTop($('#terminal')[0].scrollHeight + 40);
}

var FUNC_NOTHING = 0;
var FUNC_NAME = 1;
var FUNC_DEF = 2;
var expecting = FUNC_NOTHING;
var func_name = ""
/**
 * Process a user input, update the stack accordingly, write a
 * response out to some terminal.
 * @param {Array[Number]} stack - The stack to work on
 * @param {string} input - The string the user typed
 * @param {Terminal} terminal - The terminal object
 */
function process(input_line, terminal) {
    stack = window.stack;
    inputs = input_line.trim().split(/ +/)
    console.log(input_line)
    for (index = 0; index < inputs.length; ++index) {
        input = inputs[index]
        if (input === ":") {
            print(terminal, "start function name")
            expecting = FUNC_NAME;
        } else if (expecting === FUNC_NAME) {
            print(terminal, "start function def")
            func_name = input;
            user_defined[func_name] = [];
            expecting = FUNC_DEF;
        } else if (input === ";") {
            print(terminal, "finish function def")
            var btn = $('<button/>',
            {
                text: func_name,
                click: function () {
                    process($(btn).text(), terminal);
                }
            });
            $("#user-defined-funcs").append(btn)
            expecting = FUNC_NOTHING;
            func_name = "";
        } else if (expecting === FUNC_DEF) {
            print(terminal, "recording function def")
            user_defined[func_name].push(input);
        } else if (!(isNaN(Number(input)))) {
            // The user typed a number
            print(terminal,"pushing " + Number(input));
            stack.push(Number(input));
        } else if (input === ".s") {
            print(terminal, " <" + stack.length + "> " + stack.slice().join(" "));
        } else if (input in words) {
            words[input](stack);
        } else if (input in user_defined) {
            print(terminal, "invoking user function " + input)
            for (_index = index+1; _index < index + user_defined[input].length+1; _index++) {
                // insert codes to be executed next
                inputs.splice(_index, 0, user_defined[input][_index-index-1]);
            }
        } else {
            print(terminal, ":-( Unrecognized input");
        }
        // renderStack();
    }
};

function runRepl(terminal) {
    terminal.input("Type a forth command:", function(line) {
        print(terminal, "User typed in: " + line);
        process(line, terminal);
        runRepl(terminal);
    });
};

function Stack() {
    this.stack = [];

    this.push = function(val) {
        this.stack.push(val);
        that = this;
        this.observers.forEach(function(observer) {
            observer.call(that, that.stack);
        });
    }

    this.pop = function() {
        var item = this.stack.pop();
        this.observers.forEach(function(observer) {
            observer.call(that, that.stack);
        });
        return item;
    }

    this.clear = function() {
        this.stack.length = 0;
        this.observers.forEach(function(observer) {
            observer.call(that, that.stack);
        });
    }
}

function ObservableStack() {

    this.observers = [];

    this.subscribe = function(fn) {
        this.observers.push(fn);
        that = this;
        this.observers.forEach(function(observer) {
            observer.call(this, that.stack);
        });
    }
}

ObservableStack.prototype = new Stack();
// ObservableStack.prototype = {

// }


// Whenever the page is finished loading, call this function.
// See: https://learn.jquery.com/using-jquery-core/document-ready/
$(document).ready(function() {
    var terminal = new Terminal();
    terminal.setHeight("400px");
    terminal.blinkingCursor(true);

    // Find the "terminal" object and change it to add the HTML that
    // represents the terminal to the end of it.
    $("#terminal").append(terminal.html);

    var stack = new ObservableStack();
    stack.subscribe(function(stack) {
        $("#thestack").empty();
        stack.slice().reverse().forEach(function(element) {
            $("#thestack").append("<tr><td>" + element + "</td></tr>");
        });
    })

    // bind stack to be a global variable.
    window.stack = stack;

    $("#reset").click(function() {
       window.stack.clear();
    });

    print(terminal, "Welcome to HaverForth! v0.1");
    print(terminal, "As you type, the stack (on the right) will be kept in sync");

    runRepl(terminal);
});
