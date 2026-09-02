$(document).ready(function () {
    $('#btnClosePopup').click(function () {
        DiscrepancyPopup('0');
        return false;
    });
});

function confirmation() {
    if (confirm('Are You Sure you want to Save? Once Saved cannot be changed.')) {
        return true;
    } else {
        return false;
    }
}
function DiscrepancyPopup(val) {
    if (val == '1') {
        $('#DiscrepancyPopup').css('display', '');
    }
    else {
        $('#DiscrepancyPopup').css('display', 'none');
    }
}