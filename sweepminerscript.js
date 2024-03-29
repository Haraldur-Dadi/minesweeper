var display_board = null;
var board = null;
var game_finished;

window.onload = function () {
    display_board = document.getElementById("display_board");

    document.getElementById("generate_button").addEventListener("click", function() { generate_board_get_input_numbers() });
};

function generate_board_get_input_numbers() {
    game_finished = false;

    var rows_nr = document.getElementById("rows_input").value;
    var cols_nr = document.getElementById("cols_input").value;
    var mines_nr = document.getElementById("mines_input").value;

    if (!valid_input(rows_nr, cols_nr, mines_nr)) {
        rows_nr = 10;
        cols_nr = 10;
        mines_nr = 10;
    }

    generate_board_get_board(rows_nr, cols_nr, mines_nr);
}

function valid_input(rows_nr, cols_nr, mines_nr) {
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

function generate_board_get_board(rows_nr, cols_nr, mines_nr) {
    // The URL to which we will send the request
    var url = 'https://veff213-minesweeper.herokuapp.com/api/v1/minesweeper';

    axios.post(url, { rows: rows_nr, cols: cols_nr, mines: mines_nr })
        // If the post request was a success
        .then(function (result) {
            board = result.data.board;
        })
        // If the post request failed, server unavailable or erroeous
        .catch(function (error) {
            board = {minePositions:[[1,3],[3,0],[4,2],[4,5],[4,7],[6,9],[7,7],[8,9],[9,3],[9,9]], rows: 10, cols: 10, mines: 10};
        })
        .then(function() {
            print_board();
        })
}

function print_board() {
    // Get the board
    display_board = document.getElementById("display_board");

    // First clear board and revealed squares
    display_board.innerHTML = "";
    revealed_buttons = [];

    // Set the width of the board to the nr of columns
    display_board.style.setProperty('grid-template-columns', 'repeat(' + board.cols + ', 35px)');

    // Loop through rows
    for (var y = 0; y < board.rows; y++) {
        // Loop through columns creating a button each time that make up the board
        for (var x = 0; x < board.cols; x++) {
            var board_btn = document.createElement("button");
            board_btn.id = [y , x];
            board_btn.addEventListener("click", function() { check_button(this); } );
            board_btn.oncontextmenu = function() {return display_flag();};

            // Add the child to the inner html of the board
            display_board.appendChild(board_btn);
        }
    }

    document.getElementById("main").style.height = 40 * board.rows + 'px';
    
    assign_mines();
}

function assign_mines() {
    /* Goes through the mines list and assigns attribute to buttons that should contain mines */
    for (var i=0; i < board.minePositions.length; i++) {
        btn = document.getElementById(board.minePositions[i]);
        btn.setAttribute("mine","true");
    }
}

function display_mine(button) {
    button.disabled = true;

    // Clear innerhtml if button was already flagged
    button.innerHTML = "";

    // Display mine
    var mine_img = document.createElement("img");
    mine_img.src = "bomb.png";
    button.style.background = "tomato";
    button.appendChild(mine_img);
}

function display_flag() {
    if (!game_finished){
        if (event.target.getAttribute("flag") == null) {
            var flag_img = document.createElement("img");
            flag_img.src = "flag.png";
            flag_img.setAttribute("flag", "true");
            event.target.setAttribute("flag", "true");
        
            event.target.appendChild(flag_img);
            if (game_won()) {
                finished(true);
            }
        } else {
            event.target.parentNode.removeAttribute("flag");
            event.target.parentNode.removeChild(event.target);
        }
    }

    return false;
}

function display_number_mines_near(button, number_mines_near) {
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

function check_button(button) {
    if (!game_finished){
        button.disabled = true;

        // Check if we hit a mine
        if (button.getAttribute("mine") == "true") {
            finished(false);
            return;
        }

        revealed_buttons.push(button);
        button.style.background = "#bfbfbf";

        var button_position = button.id.split(",");
        var buttons_to_check = [];
        var buttons_to_call = [];
    
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
            // Check above left  (-1, -1)
            if (left_pos >= 0) {
                buttons_to_check.push(document.getElementById(above_pos + "," + left_pos));
            }
            // Check above right (-1, +1)
            if (right_pos >= 0 && right_pos < board.cols) {
                buttons_to_check.push(document.getElementById(above_pos + "," + right_pos));
            }
        }

        // Check below (+1, 0)
        if (bottom_pos < board.rows) {
            buttons_to_check.push(document.getElementById(bottom_pos + "," + button_position[1]));
            // Check bottom right (+1, +1) 
            if (right_pos >= 0 && right_pos < board.cols) {
                buttons_to_check.push(document.getElementById(bottom_pos + "," + right_pos));
            }
            // Check bottom left (+1, -1)
            if (left_pos >= 0) {
                buttons_to_check.push(document.getElementById(bottom_pos + "," + left_pos));
            }
        }

        // Check left (0, -1)
        if (left_pos >= 0) {
            buttons_to_check.push(document.getElementById(button_position[0] + "," + left_pos));
        }

        // Check right (0, +1)
        if (right_pos < board.cols) {
            buttons_to_check.push(document.getElementById(button_position[0] + "," + right_pos));
        }

        // Filter out flagged and mine buttons and count mines near
        var mines_near_counter = 0;
        for (var i = 0; i < buttons_to_check.length; i++) {
            if (buttons_to_check[i].getAttribute("mine")) {
                mines_near_counter += 1;
            }
            else if (!buttons_to_check[i].getAttribute("flag")) {
                buttons_to_call.push(buttons_to_check[i]);
            }
        }

        if (game_won()) {
            finished(true);
        } else if (mines_near_counter > 0) {
            display_number_mines_near(button, mines_near_counter);
        } else {
            for (var i = 0; i < buttons_to_call.length; i++) {
                if (!buttons_to_call[i].disabled) {
                    check_button(buttons_to_call[i]);
                }
            }
        }
    }
}

function game_won() {
    /* Check if we have flagged all mines
       and no active buttons left*/
    won = true;
    board_buttons = display_board.children;
    for (var i = 0; i < board_buttons.length; i++) {
        if (!board_buttons[i].disabled) {
            // If there is a mine that has not been flagged
            if (!board_buttons[i].getAttribute("flag") && board_buttons[i].getAttribute("mine")) {
                won = false;
            }
            // If there is a button that has been flagged but contains no mine 
            else if (board_buttons[i].getAttribute("flag") && !board_buttons[i].getAttribute("mine")) {
                won = false;
            }
            // If there is a button that has no flag and no bomb (still active)
            else if (!board_buttons[i].getAttribute("flag") && !board_buttons[i].getAttribute("mine")){
                won = false;
            }
        }
    }
    return won;
}

function finished(won) {
    game_finished = true;
    var game_finished_text = document.createElement("p");
    
    if (won) {
        game_finished_text.innerHTML = "YOU WIN!";

        // Change background color of revealed squares to green
        all_revealed_background_green();
    } else {
        game_finished_text.innerHTML = "YOU LOSE!";

        // Display all the remaining mines
        display_all_mines();
    }

    game_finished_text.classList.add("game_txt");
    display_board.appendChild(game_finished_text);
}

function all_revealed_background_green() {
    // Go through the list of revealed buttons and change their background
    for (var i = 0; i < revealed_buttons.length; i++) {
        revealed_buttons[i].style.background = "#70db70";
    }
}

function display_all_mines() {
    // Go through the mineposition list from board and adding bomb image into all of them
    for (var i = 0; i < board.minePositions.length; i++) {
        var button = document.getElementById(board.minePositions[i][0] + "," + board.minePositions[i][1]);
        display_mine(button);
    }
}
