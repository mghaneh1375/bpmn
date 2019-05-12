
function editLabel() {
    $(".dark").removeClass('hidden');
    $("#editLabelPopup").css('display', 'block');
    $("#newLabel").val($("#name").val()).focus();
}

function submitNewLabel() {
    $("#name").val($("#newLabel").val()).change().focusout();
    closeEditPane();
}

function closeEditPane() {
    $(".dark").addClass('hidden');
    $("#editLabelPopup").css('display', 'none');
}

$("#newLabel").on('keyup', function (e) {
    var key = e.which || e.keyCode;
    
    if (key === 13) { // 13 is enter
        submitNewLabel();
    }
    else if(key == 27) {
        closeEditPane();
    }
});
