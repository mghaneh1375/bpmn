
var options = [];
var mainSelectedId = -1;
var roles = [];
var selectedNodes = [];
var artaraxTreeView;
var conditions = [];
var showCondition;
var placeHolder;
var selectedJustOptions = [];

function changeNewRoleStatus() {
    if($("#newRole").prop('checked')) {
        $("#newRoleText").removeClass('hidden');
        $("#role_div").addClass('hidden');
    }
    else {
        $("#newRoleText").addClass('hidden');
        $("#role_div").removeClass('hidden');
    }
}

function changeNewConditionStatus() {
    if($("#newCondition").prop('checked')) {
        $("#newConditionDiv").removeClass('hidden');
        $("#condition_div").addClass('hidden');
    }
    else {
        $("#newConditionDiv").addClass('hidden');
        $("#condition_div").removeClass('hidden');
    }
}

function parseNodes(vals, roleVals) {

    // fill selectedNodes

    var i;

    if(showCondition) {
        for (i = 0; i < vals.length; i++) {
            if(i == 0)
                getItemAndRole(vals[i], roleVals[i], true);
            else
                getItemAndRole(vals[i], roleVals[i], false);
        }
    }
    else {
        for (i = 0; i < roleVals.length; i++)
            getOnlyRoles(roleVals[i]);
    }

    //delete old selected rows
    $(".selectedItemClass").remove();

    if(showCondition) {
        var newElement = "<option value='-1'> شرط مورد نظر</option>";

        for (i = 0; i < options.length; i++) {
            if (options[i].id == 'itemBoxes_' + mainSelectedId) {
                for(var j = 0; j < options[i].items.length; j++) {
                    newElement += "<optgroup label='" + options[i].items[j].name + "'>";
                    for (var k = 0; k < options[i].items[j].elements.length; k++) {
                        newElement += "<option value='" + options[i].items[j].elements[k].id + "'>" + options[i].items[j].elements[k].name + "</option>";
                    }
                    newElement += "</optgroup>";
                }
                break;
            }
        }

        $("#select").empty().append(newElement).on('change', function () {
            selectNewCondition($(this).val(), $(this).find('option:selected').text());
        });

        conditions = [];
        $("#conditionResults").empty();

    }

    showSelectedNodes();

    $(".dark").removeClass('hidden');
    $("#selectPopup").css('display', 'block');
    $('.js-example-basic-single').select2();

}

function showSelectedNodes() {

    var i;
    var selectedNodesElement = "";

    if(showCondition) {
        for (i = 0; i < selectedNodes.length; i++) {
            selectedNodesElement += "<tr id='row_" + i + "'>";
            selectedNodesElement += "<td><center>" + (i + 1) + "</center></td>";

            selectedNodesElement += "<td><center>";
            for (var j = 0; j < selectedNodes[i].roles.names.length; j++)
                selectedNodesElement += selectedNodes[i].roles.names[j];
            selectedNodesElement += "</center></td>";

            selectedNodesElement += "<td><center>";
            for (j = 0; j < selectedNodes[i].items.length - 1; j++) {
                selectedNodesElement += selectedNodes[i].items[j].name + " - ";
            }
            if(selectedNodes[i].items.length > 0) {
                selectedNodesElement += selectedNodes[i].items[selectedNodes[i].items.length - 1].name;
            }

            selectedNodesElement += "</center></td>";

            selectedNodesElement += "<td><center>";

            selectedNodesElement += "<span style='cursor: pointer' class='glyphicon glyphicon-trash' onclick='deleteRow(" + i + ")'></span>";

            if (selectedNodes[i].default) {
                selectedNodesElement += "<span style='color: red; margin-right: 30px'>عنصر پیش فرض</span>";
            }
            else {
                selectedNodesElement += "<span style='margin-right: 30px' onclick='selectDefault(" + i + ")' class='btn btn-warning'>انتخاب به عنوان پیش فرض</span>";
            }

            selectedNodesElement += "</center></td>";

            selectedNodesElement += "</tr>";
        }
    }
    else {
        for(i = 0; i < selectedNodes.length; i++) {
            selectedNodesElement += "<div class='selectedItemClass col-xs-12' id='row_" + i + "' style='color: black; background-color: white; float:right; margin: 10px; text-align: center; border: 1px solid black; border-radius: 6px; padding: 7px;'><span>";

            for (j = 0; j < selectedNodes[i].roles.names.length; j++)
                selectedNodesElement += selectedNodes[i].roles.names[j] + " - ";
            selectedNodesElement += "</span>";
            selectedNodesElement += "<span style='cursor: pointer' class='glyphicon glyphicon-remove' onclick='deleteRow(" + i + ")'></span>";
            selectedNodesElement += "</div>";
        }
    }

    $("#rows").empty().append(selectedNodesElement);
}

function selectDefault(idx) {

    for(var i = 0; i < selectedNodes.length; i++) {
        selectedNodes[i].default = (i == idx);
    }

    showSelectedNodes();
}

function selectNewCondition(val, text) {

    if(val == -1 || val.length == 0)
        return;

    var size = conditions.length;

    for (var i = 0; i < size; i++) {
        if(conditions[i] == val)
            return;
    }

    conditions[size] = val;
    var newElement = "<div id='condition_" + size + "' style='padding: 10px' class='col-xs-4'><p onclick='deleteCondition(" + size + ")' style='padding: 5px; width: fit-content' class='btn btn-primary'><span>" + text +  "</span><span class='glyphicon glyphicon-remove'></span></p></div>";
    $("#conditionResults").append(newElement);
}

function deleteCondition(idx) {
    conditions.splice(idx, 1);
    $("#condition_" + idx).remove();
}

function createNodes(arr) {
    for(var i = 0; i < arr.length; i++) {
        roles[i] = {'name': arr[i].Title, 'id': arr[i].Id};
    }
}

function getNodes(vals, roleVals, id) {

    roles = [];

    // var url = 'http://bp.vcu.ir/get.php';
    var url = 'https://ppl.ut.ac.ir/demo/editor/basedata/get.php';

    $.ajax({
        url: url,
        type: 'post',
        data: {
            'getNodes': true,
            'id': id
        },
        success: function (response) {
            treeViewData = JSON.parse(response);

            // set settings for treeview
            artaraxTreeView = $.artaraxTreeView({
                jsonData: treeViewData,
                selectedIds: [], // just use on update mode (when you run tree view by 'loadTreeViewOnUpdate()' function)
                isDisplayChildren: false
            });

            // load treeview
            artaraxTreeView.loadTreeViewOnInsert(1); // 1 is the root id

            createNodes(treeViewData);
            parseNodes(vals, roleVals);
        }
    });
}

function fetchData(id) {


    for(var i = 0; i < options.length; i++) {
        if(options[i].id == id)
            return;
    }

    // var url = 'http://bp.vcu.ir/getOptions.php';
    var url = 'https://ppl.ut.ac.ir/demo/editor/basedata/getOptions.php';

    $.ajax({
        type: 'post',
        url: url,
        data: {
            'kind': id
        },
        success: function (response) {

            response = JSON.parse(response);
            var items = [];

            for(var i = 0; i < response.length; i++) {
                items[i] = {"name": response[i].name, 'elements': response[i].elements};
            }

            options[options.length] = {'id': id, 'items': items};
        }
    });
}

function getOnlyRoles(roleIds) {

    var ids = [];
    var names = [];

    roleIds = roleIds.split('&&');

    for(var j = 0; j < roleIds.length; j++) {

        if(roleIds[j].length == 0)
            continue;

        for (k = 0; k < roles.length; k++) {
            if (roles[k].id == parseInt(roleIds[j])) {
                ids[j] = roles[k].id;
                names[j] = roles[k].name;
                break;
            }
        }
    }

    if(ids.length > 0)
        selectedNodes[selectedNodes.length] = {"roles": {'ids': ids, 'names': names}};

}

function getItemAndRole(itemId, roleIds, defaultVal) {

    var selectedItems = [];
    var itemIdx = -1;

    for(var k = 0; k < options.length; k++) {
        if(options[k].id == "itemBoxes_" + mainSelectedId) {
            itemIdx = k;
            break;
        }
    }

    if(itemIdx == -1)
        return;

    var conditionIds = itemId.split('&&');

    for(var i = 0; i < conditionIds.length; i++) {

        if(conditionIds[i].length == 0)
            continue;

        if(conditionIds[i][0] == "0") {
            selectedItems[selectedItems.length] = {"id": -1, "name": conditionIds[i].substr(1)};
            continue;
        }

        var allow = true;
        for (k = 0; k < options[itemIdx].items.length; k++) {
            for (var j = 0; j < options[itemIdx].items[k].elements.length; j++) {
                if (options[itemIdx].items[j].elements[k].id == conditionIds[i]) {
                    selectedItems[selectedItems.length] = options[itemIdx].items[j].elements[k];
                    allow = false;
                    break;
                }
            }
            if(!allow)
                break;
        }
    }

    var ids = [];
    var names = [];
    var custom = false;

    roleIds = roleIds.split('&&');

    for(j = 0; j < roleIds.length; j++) {

        if(roleIds[j].length == 0)
            continue;

        if(roleIds[j][0] == "0") {
            ids[j] = -1;
            names[j] = roleIds[j].substr(1);
            custom = true;
        }
        else {
            for (k = 0; k < roles.length; k++) {
                if (roles[k].id == parseInt(roleIds[j])) {
                    ids[j] = roles[k].id;
                    names[j] = roles[k].name;
                    break;
                }
            }
        }
    }

    if(selectedItems.length > 0 && ids.length > 0)
        selectedNodes[selectedNodes.length] = {"roles": {'ids': ids, 'names': names, 'custom': custom}, "items": selectedItems, "default": defaultVal};
}

function showPopupSelect(pH, id, label) {

    mainSelectedId = id;
    selectedNodes = [];
    showCondition = true;
    placeHolder = pH;

    $("#type1").removeClass('hidden');
    $("#type2").addClass('hidden');

    //initializing
    $("#newRole").prop('checked', false);
    $("#newCondition").prop('checked', false);
    changeNewRoleStatus();
    changeNewConditionStatus();
    $("#search").val("");
    $("#newRoleText").val("");
    $("#newConditionText").val("");

    //labeling
    $(".headerOfPopup").empty().append(label);
    $("#condition_text").empty().append(pH);
    $("#not_found_condition_text").empty().append(pH);
    $("#table_condition_text").empty().append(pH);

    fetchData("itemBoxes_" + mainSelectedId);

    getNodes($("#" + id).attr('data-val').split('$$'), $("#role_" + id).attr('data-val').split('$$'), id);
}

function showPopupSelect2(id, label, mode) {

    mainSelectedId = id;
    selectedNodes = [];
    showCondition = false;

    $(".headerOfPopup").empty().append(label);
    $("#type1").addClass('hidden');
    $("#type2").removeClass('hidden');
    $("#conditionResultsInType2").empty();

    getJustOptions($("#" + id).attr('data-val').split('$$'), id, mode);
}

function getJustOptions(selected, id, mode) {

    $.ajax({
        type: 'post',
        url: 'https://ppl.ut.ac.ir/demo/editor/basedata/getOptions.php',
        data: {
            'kind': id
        },
        success: function (response) {
            response = JSON.parse(response);

            var newElement = "<option value='-1'>آیتم مورد نظر</option>";

            var tmpSelected = $("#" + mainSelectedId).attr('data-val').slice('$$');

            for(var i = 0; i < response.length; i++) {

                for(var j = 0; j < tmpSelected.length; j++) {
                    if (tmpSelected[j] == response[i].id) {
                        selectedJustOptions[selectedJustOptions.length] = {
                            "id": response[i].id,
                            "text": response[i].name
                        };
                        break;
                    }
                }

                newElement += "<option value='" + response[i].id + "'>" + response[i].name + "</option>";
            }

            $("#selectInType2").empty().append(newElement).on('change', function () {
                selectNewJustOption($(this).val(), $(this).find('option:selected').text(), mode);
            });

            renderJustOptions(mode);
            $(".dark").removeClass('hidden');
            $("#selectPopup").css('display', 'block');
            $('.js-example-basic-single').select2();
        }
    });
}

function selectNewJustOption(id, text, mode) {

    if(id == -1)
        return;

    if(mode == 'single') {
        selectedJustOptions[0] = {"id": id, "text": text};
        return;
    }
    else {
        for(var i = 0; i < selectedJustOptions.length; i++) {
            if(selectedJustOptions[i].id == id)
                return;
        }
        selectedJustOptions[selectedJustOptions.length] = {"id": id, "text": text};
    }

    renderJustOptions(mode);
}

function renderJustOptions(mode) {

    if(mode == "single") {
        if(selectedJustOptions.length > 0) {
            $("#selectInType2").val(selectedJustOptions[0].id);
        }
    }

    else {
        var newElement = "";

        for (var i = 0; i < selectedJustOptions.length; i++) {
            newElement += "<div id='condition_" + i + "' style='padding: 10px' class='col-xs-4'><p onclick='deleteConditionJustOptions(" + i + ")' style='padding: 5px; width: fit-content' class='btn btn-primary'><span>" + selectedJustOptions[i].text + "</span><span class='glyphicon glyphicon-remove'></span></p></div>";
        }

        $("#conditionResultsInType2").empty().append(newElement);
    }
}

function deleteConditionJustOptions(idx) {
    selectedJustOptions.splice(idx, 1);
    $("#condition_" + idx).remove();
    renderJustOptions();
}

function submit() {

    var selectedRoles;

    if(!$("#newRole").prop('checked')) {
        var selectedRolesId = artaraxTreeView.getSelectedIds();
        var selectedRolesName = artaraxTreeView.getSelectedNames();
        selectedRoles = {'ids': selectedRolesId, 'names': selectedRolesName, 'custom': false};
    }
    else {
        var tmpRole = $("#newRoleText").val();

        if(tmpRole.length == 0)
            return;

        selectedRoles = {'ids': [-1], 'names': [tmpRole], 'custom': true};
    }

    var selectedItems = [];
    var i, k, j, allow;

    if(showCondition) {
        for (var t = 0; t < options.length; t++) {
            if (options[t].id == "itemBoxes_" + mainSelectedId) {
                for (k = 0; k < conditions.length; k++) {
                    allow = true;
                    for (i = 0; i < options[t].items.length; i++) {
                        for(j = 0; j < options[t].items[i].elements.length; j++) {
                            if (conditions[k] == options[t].items[i].elements[j].id) {
                                selectedItems[selectedItems.length] = options[t].items[i].elements[j];
                                allow = false;
                                break;
                            }
                        }
                        if(!allow)
                            break;
                    }

                    if(allow)
                        selectedItems[selectedItems.length] = {"id": -1, "name": conditions[k]};
                }
                break;
            }
        }

        if(selectedNodes.length == 0)
            selectedNodes[selectedNodes.length] = {"roles": selectedRoles, "items": selectedItems, "default": true};
        else
            selectedNodes[selectedNodes.length] = {"roles": selectedRoles, "items": selectedItems, "default": false};
    }

    else {
        selectedNodes[selectedNodes.length] = {"roles": selectedRoles};
    }
    // check existance
//            for(t = 0; t < selectedNodes.length; t++) {
//                if(selectedNodes[t].role.id == selectedRole.id && selectedNodes[t].item.id == selectedItem.id)
//                    return;
//            }

    $("#conditionResults").empty();
    conditions = [];
    showSelectedNodes();
}

function deleteRow(idx) {
    selectedNodes.splice(idx, 1);
    $("#row_" + idx).remove();
}

function done() {

    $(".dark").addClass('hidden');
    $("#selectPopup").css('display', 'none');

    var text = "";
    var text2 = "";
    var j;
    var defaultVal = "";
    var defaultVal2 = "";

    if(showCondition) {
        for (var i = 0; i < selectedNodes.length; i++) {

            if (selectedNodes[i].default) {
                for (j = 0; j < selectedNodes[i].items.length - 1; j++) {
                    if (selectedNodes[i].items[j].id != -1)
                        defaultVal += selectedNodes[i].items[j].id + "&&";
                    else
                        defaultVal += "0" + selectedNodes[i].items[j].name + "&&";
                }

                if (selectedNodes[i].items.length > 0) {
                    if (selectedNodes[i].items[selectedNodes[i].items.length - 1].id != -1)
                        defaultVal += selectedNodes[i].items[selectedNodes[i].items.length - 1].id;
                    else
                        defaultVal += "0" + selectedNodes[i].items[selectedNodes[i].items.length - 1].name;
                }


                for (j = 0; j < selectedNodes[i].roles.ids.length - 1; j++) {
                    if (!selectedNodes[i].roles.custom)
                        defaultVal2 += selectedNodes[i].roles.ids[j] + "&&";
                    else
                        defaultVal2 += "0" + selectedNodes[i].roles.names[j] + "&&";
                }

                if (selectedNodes[i].roles.ids.length > 0) {
                    if (!selectedNodes[i].roles.custom)
                        defaultVal2 += selectedNodes[i].roles.ids[selectedNodes[i].roles.ids.length - 1];
                    else
                        defaultVal2 += "0" + selectedNodes[i].roles.names[selectedNodes[i].roles.names.length - 1];
                }
            }

            else {

                text += "$$";
                text2 += "$$";

                for (j = 0; j < selectedNodes[i].items.length - 1; j++) {
                    if (selectedNodes[i].items[j].id != -1)
                        text += selectedNodes[i].items[j].id + "&&";
                    else
                        text += "0" + selectedNodes[i].items[j].name + "&&";
                }

                if (selectedNodes[i].items.length > 0) {
                    if (selectedNodes[i].items[selectedNodes[i].items.length - 1].id != -1)
                        text += selectedNodes[i].items[selectedNodes[i].items.length - 1].id;
                    else
                        text += "0" + selectedNodes[i].items[selectedNodes[i].items.length - 1].name;
                }


                for (j = 0; j < selectedNodes[i].roles.ids.length - 1; j++) {
                    if (!selectedNodes[i].roles.custom)
                        text2 += selectedNodes[i].roles.ids[j] + "&&";
                    else
                        text2 += "0" + selectedNodes[i].roles.names[j] + "&&";
                }

                if (selectedNodes[i].roles.ids.length > 0) {
                    if (!selectedNodes[i].roles.custom)
                        text2 += selectedNodes[i].roles.ids[selectedNodes[i].roles.ids.length - 1];
                    else
                        text2 += "0" + selectedNodes[i].roles.names[selectedNodes[i].roles.names.length - 1];
                }
            }
        }

        text2 = defaultVal2 + text2;
        text = defaultVal + text;
        $("#role_" + mainSelectedId).val(text2);
        $("#" + mainSelectedId).val(text).change().focusout();
    }

    else {

        for(j = 0; j < selectedJustOptions.length - 1; j++)
            text2 += selectedJustOptions[j].id + "$$";

        if(selectedJustOptions.length > 0)
            text2 += selectedJustOptions[selectedJustOptions.length - 1].id;

        $("#" + mainSelectedId).val(text2).change().focusout();
    }
}

function changeTab(tabId) {

    $(".bpp-properties-group").each(function () {
        if($(this).attr('data-tab-id') == tabId)
            $(this).removeClass('hidden');
        else
            $(this).addClass('hidden');
    });
}