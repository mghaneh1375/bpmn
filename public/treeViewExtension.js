
var treeViewData;
var newTreeViewData;

function addToNewTreeData(idx) {

    for(var i = 0; i < newTreeViewData.length; i++) {
        if(newTreeViewData[i].Id == treeViewData[idx].Id)
            return;
    }

    newTreeViewData[newTreeViewData.length] = treeViewData[idx];
}

$("#search").on('keyup', function () {

    var wanted = $("#search").val();
    newTreeViewData = [];
    var displayChilds = false;

    if(wanted.length > 1) {

        displayChilds = true;

        for(var i = 0; i < treeViewData.length; i++) {
            if(treeViewData[i].Title.includes(wanted)) {
                addToNewTreeData(i);
                var tmp = treeViewData[i].ParentId;
                var allow = (tmp != null);
                while(allow){
                    allow = false;
                    for (var j = 0; j < treeViewData.length; j++) {
                        if(treeViewData[j].Id == tmp) {
                            addToNewTreeData(j);
                            tmp = treeViewData[j].ParentId;
                            allow = (tmp != null);
                            break;
                        }
                    }
                }
            }
        }
    }
    else
        newTreeViewData = treeViewData;

    // set settings for treeview
    artaraxTreeView = $.artaraxTreeView({
        jsonData: newTreeViewData,
        selectedIds: [], // just use on update mode (when you run tree view by 'loadTreeViewOnUpdate()' function)
        isDisplayChildren: displayChilds
    });

    // load treeview
    artaraxTreeView.loadTreeViewOnInsert(1); // 1 is the root id
});