var rows_nr = 0;
var cols_nr = 0;
var mines_nr = 0;

var display_board = null;
var board = null;
var board_buttons = [];

var game_finished;

window.onload = function () {
    generate_btn = document.getElementById("generate_button");
    generate_btn.addEventListener("click", function() { generate_board_get_input_numbers() });
};

function generate_board_get_input_numbers() {
    game_finished = false;

    rows_nr = document.getElementById("rows_input").value;
    cols_nr = document.getElementById("cols_input").value;
    mines_nr = document.getElementById("mines_input").value;

    if (!valid_input()) {
        rows_nr = 10;
        cols_nr = 10;
        mines_nr = 10;
    }

    generate_board_get_board();
}

function valid_input() {
    if (rows_nr < 1 || cols_nr < 1 || mines_nr < 1) {
        return false;
    } else if (rows_nr > 40 || cols_nr > 40) {
        return false;
    } else if (mines_nr > 1600) {
        return false;
    } else if (mines_nr > (rows_nr * cols_nr)) {
        return false;
    }

    return true;
}

function generate_board_get_board() {
    // The URL to which we will send the request
    var url = 'https://veff213-minesweeper.herokuapp.com/api/v1/minesweeper';

    axios.post(url, { rows: rows_nr, cols: cols_nr, mines: mines_nr })
        // If the post request was a success
        .then(function (result) {
            board = result.data.board;
        })
        // If the post request failed, server unavailable or erroeous
        .catch(function (error) {
            console.log(error);
        })
        .then(function() {
            print_board();
        })
}

function print_board() {
    display_board = document.getElementById("display_board");

    // First clear board
    display_board.innerHTML = "";
    board_buttons = [];

    // Set the width of the board to the nr of columns
    display_board.style.setProperty('grid-template-columns', 'repeat(' + cols_nr + ', 40px)');

    // Loop through rows
    for (var y = 0; y < rows_nr; y++) {
        // Loop through columns creating a button each time that make up the board
        for (var x = 0; x < cols_nr; x++) {
            var board_btn = document.createElement("button");
            board_btn.classList.add("board_btn");
            board_btn.id = y + "," + x;
            
            board_btn.addEventListener("click", board_click);
            board_btn.oncontextmenu = function() {return display_flag();};

            // Add the child to the inner html of the board
            display_board.appendChild(board_btn);
            board_buttons.push(board_btn);
        }
    }

    main = document.getElementById("main");
    main.style.height = 40 * cols_nr + 'px';
}

function board_click() {
    if (!game_finished) {
        if (check_if_mine_hit(event.target.id.split(","))) {
            display_mine(event.target);
            finished(false);
        } else {
            display_standard(event.target);
        }
    }
}

function display_mine(button) {
    button.disabled = true;
    // Display mine
    var mine_img = document.createElement("img");
    mine_img.src = "bomb.png";

    button.style.background = "tomato";
    button.appendChild(mine_img);
}

function display_standard(button) {
    board_buttons.splice(board_buttons.indexOf(button), 1);
    button.disabled = true;
    button.style.background = "#bfbfbf";
    check_button(button);
}

function display_flag() {
    if (event.target.id != "flag") {
        var flag_img = document.createElement("img");
        flag_img.src = "flag.png";
        flag_img.id = "flag";
    
        event.target.appendChild(flag_img);
        if (game_won()) {
            finished(true);
        }
    } else {
        event.target.parentNode.removeChild(event.target);
    }

    return false;
}

function display_number_mines_near(button, number_mines_near) {
    if (number_mines_near > 0) {
        button.disabled = true;

        var number_text = document.createElement("p");
        number_text.innerHTML = number_mines_near;
        button.appendChild(number_text);

        if (number_mines_near == 1) {
            button.style.color = "blue";
        } else if (number_mines_near == 2) {
            button.style.color = "green";
        } else {
            button.style.color = "red";
        }
    }
}

function check_button(button) {
    var button_position = button.id.split(",");

    var pos_to_check = [];
    var buttons_to_check = [];
    
    var buttons_to_call = [];
    var pos_to_call = [];

    // (0, -1)
    var left_pos = Number(button_position[1]) - 1;
    // (-1, 0)
    var above_pos = Number(button_position[0]) - 1;
    // (0, 1)
    var right_pos = Number(button_position[1]) + 1;
    // (1, 0)
    var bottom_pos = Number(button_position[0]) + 1;

    // Check above (-1, 0) 
    if (above_pos >= 0) {
        buttons_to_check.push(document.getElementById(above_pos + "," + button_position[1]));
        pos_to_check.push([above_pos, button_position[1]]);
        
        // Check above left  (-1, -1)
        if (left_pos >= 0) {
            buttons_to_check.push(document.getElementById(above_pos + "," + left_pos));
            pos_to_check.push([above_pos, left_pos]);
        }

        // Check above right (-1, +1)
        if (right_pos >= 0 && right_pos < cols_nr) {
            buttons_to_check.push(document.getElementById(above_pos + "," + right_pos));
            pos_to_check.push([above_pos, right_pos]);
        }
    }

    // Check below (+1, 0)
    if (bottom_pos < rows_nr) {
        buttons_to_check.push(document.getElementById(bottom_pos + "," + button_position[1]));
        pos_to_check.push([bottom_pos, button_position[1]]);
        
        // Check bottom right (+1, +1) 
        if (right_pos >= 0 && right_pos < cols_nr) {
            buttons_to_check.push(document.getElementById(bottom_pos + "," + right_pos));
            pos_to_check.push([bottom_pos, right_pos]);
        }

        // Check bottom left (+1, -1)
        if (left_pos >= 0) {
            buttons_to_check.push(document.getElementById(bottom_pos + "," + left_pos));
            pos_to_check.push([bottom_pos, left_pos]);
        }
    }

    // Check left (0, -1)
    if (left_pos >= 0) {
        buttons_to_check.push(document.getElementById(button_position[0] + "," + left_pos));
        pos_to_check.push([button_position[0], left_pos]);
    }

    // Check right (0, +1)
    if (right_pos < cols_nr) {
        buttons_to_check.push(document.getElementById(button_position[0] + "," + right_pos));
        pos_to_check.push([button_position[0], right_pos]);
    }

    var mines_near_counter = 0;
    for (var i = 0; i < pos_to_check.length; i++) {
        if (!buttons_to_check[i].disabled) {
            if (check_if_mine_hit(pos_to_check[i])) {
                mines_near_counter += 1;
            } else {
                pos_to_call.push(pos_to_check[i]);
                buttons_to_call.push(buttons_to_check[i]);
            }
        }
    }

    if (game_won()) {
        finished(true);
    } else if (mines_near_counter > 0) {
        display_number_mines_near(button, mines_near_counter);
    } else {
        display_number_mines_near(button, mines_near_counter);
        for (var i = 0; i < pos_to_call.length; i++) {
            display_standard(buttons_to_call[i], pos_to_call[i]);
        }
    }
}

function check_if_mine_hit(position_to_check) {
    // Loop through the positions of mines and check if we hit it
    for (var i = 0; i < board.minePositions.length; i++) {
        // Array value comparison
        if (board.minePositions[i][0] == position_to_check[0] && board.minePositions[i][1] == position_to_check[1]) {
            return true;
        }
    }
    return false;
}

function game_won() {
    won = true;
    for (var i = 0; i < board_buttons.length; i++) {
        // Check if button does contain flag
        if (board_buttons[i].innerHTML != "") {
            console.log(2);
            // Contains flag but there is no bomb under it
            if (!check_if_mine_hit(board_buttons[i].id.split(","))) {
                console.log(3);
                won = false;
            }
        } else {
            won = false;
        }
    }
    return won;
}

function finished(won) {
    game_finished = true;
    var game_finished_text = document.createElement("p");
    
    if (won) {
        game_finished_text.innerHTML = "YOU WIN!";
    } else {
        game_finished_text.innerHTML = "YOU LOSE!";
    }

    game_finished_text.classList.add("game_txt");
    game_finished_text.style.left = (cols_nr * 40) / 2 + "px";

    // Display all the remaining mines and game_finished_text
    display_all_mines();
    display_board.appendChild(game_finished_text);
}

function display_all_mines() {
    for (var i = 0; i < board.minePositions.length; i++) {
        var button = document.getElementById(board.minePositions[i][0] + "," + board.minePositions[i][1]);
        if (!button.disabled) {
            display_mine(button);
        }
    }
}