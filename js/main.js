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

};

var user_defined = {};

/**
 * Your thoughtful comment here.
 */
function emptyStack(stack) {
    stack.length = 0;
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

/**
 * Sync up the HTML with the stack in memory
 * @param {Array[Number]} The stack to render
 */
function renderStack(stack) {
    $("#thestack").empty();
    stack.slice().reverse().forEach(function(element) {
        $("#thestack").append("<tr><td>" + element + "</td></tr>");
    });
};

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
function process(stack, input_line, terminal) {
    inputs = input_line.trim().split(/ +/)
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
        renderStack(stack);
    }
};

function runRepl(terminal, stack) {
    terminal.input("Type a forth command:", function(line) {
        print(terminal, "User typed in: " + line);
        process(stack, line, terminal);
        runRepl(terminal, stack);
    });
};

// Whenever the page is finished loading, call this function.
// See: https://learn.jquery.com/using-jquery-core/document-ready/
$(document).ready(function() {
    var terminal = new Terminal();
    terminal.setHeight("400px");
    terminal.blinkingCursor(true);

    // Find the "terminal" object and change it to add the HTML that
    // represents the terminal to the end of it.
    $("#terminal").append(terminal.html);

    var stack = [];

    $("#reset").click(function() {
        emptyStack(stack);
        renderStack(stack);
    });

    print(terminal, "Welcome to HaverForth! v0.1");
    print(terminal, "As you type, the stack (on the right) will be kept in sync");

    runRepl(terminal, stack);
});

