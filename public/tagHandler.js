
var tags = [];
var currIdxTag = 0;


function renderTags() {
    for(var i = 0; i < tags.length; i++)
        showSingleTag(tags[i]);
}

function removeTag(idx) {
    tags.splice(idx, 1);
    $("#tag_" + idx).remove();

    var val = "";

    for(var i = 0; i < tags.length - 1; i++) {
        val += tags[i] + "$$";
    }

    if(tags.length > 0) {
        val += tags[tags.length - 1];
    }

    $("#tag").val(val).change();
}

function showSingleTag(val) {
    var newElement = "<div id='tag_" + currIdxTag + "' onclick='removeTag(" + currIdxTag + ")' class='btn btn-primary' style='display: inline-block; margin: 10px'>" + val + "<span class='glyphicon glyphicon-remove'></span></div>";
    $("#tagsPane").append(newElement);
    currIdxTag++;
}

function addNewTag() {

    var val = $("#tagTemp").val();

    for(var i = 0; i < tags.length; i++) {
        if(tags[i] == val)
            return;
    }

    tags[currIdxTag] = val;
    showSingleTag(val);

    var text = "";

    for(i = 0; i < tags.length - 1; i++) {
        text += tags[i] + "$$";
    }

    if(tags.length > 0)
        text += tags[i];

    $("#tag").val(text).change();
}