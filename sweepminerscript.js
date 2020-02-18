var rows_nr = 0;
var cols_nr = 0;
var mines_nr = 0;

var display_board = null;
var board = null;

var active_buttons;
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

    active_buttons = rows_nr * cols_nr;
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
            active_buttons -= board.minePositions.length;
            print_board();
        })
        // If the post request failed, server unavailable or erroeous
        .catch(function (error) {
            print_default_board();
            console.log(error);
        })
}

function print_board() {
    display_board = document.getElementById("display_board");

    // First clear board
    display_board.innerHTML = "";

    // Set the width of the board to the nr of columns
    display_board.style.setProperty('grid-template-columns', 'repeat(' + cols_nr + ', 40px)');

    // Loop through rows
    for (var y = 0; y < rows_nr; y++) {
        // Loop through columns creating a button each time that make up the board
        for (var x = 0; x < cols_nr; x++) {
            var board_btn = document.createElement("button");
            board_btn.classList.add("board_btn");
            board_btn.id = y + "" + x;
            
            board_btn.addEventListener("click", board_click.bind(null,board_btn, [y, x]));

            // Add the child to the inner html of the board
            display_board.appendChild(board_btn);
        }
    }
}

function board_click(button, button_position) {
    if (!game_finished) {
        if (check_if_mine_hit(button_position)) {
            display_mine(button);
            game_over(false);
        } else {
            display_standard(button, button_position);
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

function display_standard(button, button_position) {
    button.disabled = true;
    button.style.background = "#bfbfbf";
    active_buttons -= 1;
    check_button(button, button_position);
}

function display_number_mines_near(button, number_mines_near) {    
    if (number_mines_near > 0) {
        button.disabled = true;

        var number_text = document.createElement("p");
        number_text.innerHTML = number_mines_near;
        button.appendChild(number_text);
    }
}

function check_button(button, button_position) {
    var buttons_to_check = [];
        var pos_to_check = [];

        // (0, -1)
        var left_pos = button_position[1] - 1;
        // (-1, 0)
        var above_pos = button_position[0] - 1;
        // (0, 1)
        var right_pos = button_position[1] + 1;
        // (1, 0)
        var bottom_pos = button_position[0] + 1;

        // Check above (-1, 0) 
        if (above_pos >= 0) {
            buttons_to_check.push(document.getElementById(above_pos + "" + button_position[1]));
            pos_to_check.push([above_pos, button_position[1]]);
            
            // Check above left  (-1, -1)
            if (left_pos >= 0) {
                buttons_to_check.push(document.getElementById(above_pos + "" + left_pos));
                pos_to_check.push([above_pos, left_pos]);
            }

            // Check above right (-1, +1)
            if (right_pos >= 0 && right_pos < cols_nr) {
                buttons_to_check.push(document.getElementById(above_pos + "" + right_pos));
                pos_to_check.push([above_pos, right_pos]);
            }
        }

        // Check below (+1, 0)
        if (bottom_pos < rows_nr) {
            buttons_to_check.push(document.getElementById(bottom_pos + "" + button_position[1]));
            pos_to_check.push([bottom_pos, button_position[1]]);
            
            // Check bottom right (+1, +1) 
            if (right_pos >= 0 && right_pos < cols_nr) {
                buttons_to_check.push(document.getElementById(bottom_pos + "" + right_pos));
                pos_to_check.push([bottom_pos, right_pos]);
            }

            // Check bottom left (+1, -1)
            if (left_pos >= 0) {
                buttons_to_check.push(document.getElementById(bottom_pos + "" + left_pos));
                pos_to_check.push([bottom_pos, left_pos]);
            }
        }

        // Check left (0, -1)
        if (left_pos >= 0) {
            buttons_to_check.push(document.getElementById(button_position[0] + "" + left_pos));
            pos_to_check.push([button_position[0], left_pos]);
        }

        // Check right (0, +1)
        if (right_pos < cols_nr) {
            buttons_to_check.push(document.getElementById(button_position[0] + "" + right_pos));
            pos_to_check.push([button_position[0], right_pos]);
        }

        var mines_near_counter = 0;
        // Call functions on valid buttons, positions
        for (var i = 0; i < pos_to_check.length; i++) {
            if (!buttons_to_check[i].disabled) {
                if (check_if_mine_hit(pos_to_check[i])) {
                    mines_near_counter += 1;
                }
            }
        }

        console.log(mines_near_counter, button_position);
        if (mines_near_counter > 0) {
            display_number_mines_near(button, mines_near_counter);
        }
        
        if (game_won() == true) {
            game_over(true);
        } else {
            for (var i = 0; i < buttons_to_check.length; i++) {
                display_standard(buttons_to_check[i], pos_to_check[i]);
            }
        }
}

function check_if_mine_hit(position_to_check) {
    // Loop through the positions of mines and check if we hit it
    for (var i = 0; i < board.minePositions.length; i++) {
        // Array value comparison
        if (position_to_check[0] == board.minePositions[i][0] && position_to_check[1] == board.minePositions[i][1]) {
            return true;
        }
    }
    return false;
}






function game_won() {
    // Check if there are any buttons still active in the display board
    if (active_buttons > 0) {
        return false;
    } else {
        return true;
    }
}

function game_over(won) {
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
        var button = document.getElementById(board.minePositions[i][0] + "" + board.minePositions[i][1]);
        if (!button.disabled) {
            display_mine(button);
        }
    }
}