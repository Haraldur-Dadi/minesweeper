window.onload = function () {
    generate_btn = document.getElementById("generate_button");
    generate_btn.addEventListener("click", generate_board_get_input_numbers);
};

rows_nr = 0;
cols_nr = 0;
mines_nr = 0;

function generate_board_get_input_numbers() {
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
        .then(function (result) {
            board = result.data.board;
        })
        .catch(function (error) {
            console.log(error);
        })
    
    print_board();
}

function print_board() {

}