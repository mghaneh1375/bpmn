/*  ---------------------------------------------------------------------
 ----------------------- ARTARAX TreeView ----------------------------
 -----------------------   Version 0.1    ----------------------------
 ---------------- copyright 2018 by http://artarax.com ---------------
 ---------------------------------------------------------------------
 options:
 {
 jsonData:
 an object array with {Id, Title, ParentId} properties
 selectedIds:
 an long array of selected ids
 isDisplayChildren:
 this make child <ul> tags display hidden or block.
 *Valid values are true/false
 (default is true)
 mode:
 "deletable,updatable,radiobox,autoSelectChildren"
 (default is "deletable,updatable,autoSelectChildren")
 updateCallBack:
 callback function that can get selected object as a param
 deleteCallBack:
 callback function that can get selected object as a param
 }
 methods:
 1) getSelectedIds() : get an array of selected ids
 2) getSelectedLeafIds() : get an array of selected leaf ids
 3) loadTreeViewOnInsert(rootId) : load treeview items
 4) loadTreeViewOnUpdate(rootId) : load treeview items and checked selected checkboxes
 5) unCheckedAll()
 /*  --------------------------------------------------------------------- */

(function ($) {

    $.artaraxTreeView = function (options) {

        // ======================================== plugin definition ========================================
        var defaults = {
            jsonData: [],
            selectedIds: [],
            isDisplayChildren: false,
            mode: "deletable,updatable,autoSelectChildren",
            updateCallBack: null,
            deleteCallBack: null
        };

        var settings = $.extend({}, defaults, options);


        // =============================================== proxy ===============================================
        var treeViewData = settings.jsonData;
        var treeViewMode = settings.mode;
        var treeViwOnUpdateCallBack = settings.updateCallBack;
        var treeViwOnDeleteCallBack = settings.deleteCallBack;
        var treeviewSelectedIds = settings.selectedIds;
        var treeviewIsDisplayChildren = settings.isDisplayChildren;

        // =============================================== main ===============================================

        // -------------------------------------------------> variables
        var treeViewHtml = '';
        var isUpdatable = (treeViewMode.indexOf('updatable') > -1);
        var isDeletable = (treeViewMode.indexOf('deletable') > -1);
        var isAutoSelectChildren = (treeViewMode.indexOf('autoSelectChildren') > -1);
        var isRadioBox = (treeViewMode.indexOf('radiobox') > -1);
        // <------------------------------------------------- variables

        // -------------------------------------------------> events
        // ~~~~~~~~~ toggle child nodes ~~~~~~~~~
        $(".treeview").on('click', '.node-plus', function () {
            var _this = $(this);
            _this.next().next().next('ul').show();
            _this.removeClass('node-plus');
            _this.addClass('node-minus');
        });

        $(".treeview").on('click', '.node-minus', function () {
            var _this = $(this);
            _this.next().next().next('ul').hide();
            _this.removeClass('node-minus');
            _this.addClass('node-plus');
        });


        function getPath(id) {

            for(var j = 0; j < treeViewData.length; j++) {
                if (parseInt(treeViewData[j].id) == id) {
                    if (treeViewData[j].parentId != 0)
                        return getPath(treeViewData[j].parentId) + " => " + treeViewData[j].name;
                    return "";
                }
            }

            return "";
        }

        // ~~~~~~~~~ onUpdate ~~~~~~~~~
        if (treeViwOnUpdateCallBack != null) {
            $(".treeview").on('click', '.node-update', function () {
                var selectedId = parseInt($(this).attr('data-id'));
                var selectedObj = getTreeViewObjectById(selectedId);
                treeViwOnUpdateCallBack(selectedObj);
            });
        }

        // ~~~~~~~~~ onDelete ~~~~~~~~~
        if (treeViwOnDeleteCallBack != null) {
            $(".treeview").on('click', '.node-delete', function () {
                var selectedId = parseInt($(this).attr('data-id'));
                var selectedObj = getTreeViewObjectById(selectedId);
                treeViwOnDeleteCallBack(selectedObj);
            });
        }

        // ~~~~~~~~~ run treeview modes ~~~~~~~~~
        // autoSelectChildren
        // if (!isRadioBox && isAutoSelectChildren) {
            $(".treeview").on('change', '.chk', function () {

                var isCheckedNow = $(this).is(":checked");
                var thisVar = this;

                if(isCheckedNow) {
                    $(".chk").each(function () {
                        if(thisVar != this)
                            $(this).prop('checked', false);
                    });
                }

                // $(this).parent().next().next('ul').children('li').each(function () {
                //     $(this).children('label').children('.chk').prop('checked', isCheckedNow);
                // });
            });
        // }

        // radiobox
        if (isRadioBox) {
            $(".treeview").on('click', '.chk', function () {
                unCheckedAllExceptThis($(this).attr('data-id'));
            });
        }
        // <------------------------------------------------- events


        // -------------------------------------------------> load treeview
        function loadTreeView(parentId, isOnUpdate) {
            var treeViewEndTag = '';
            var childItems = getChildren(parentId);

            $.each(childItems, function (index, item) {

                var hasChildrenFlag = hasChildren(item.id);
                if (hasChildrenFlag) {
                    treeViewEndTag = '</ul></li>';
                }

                appendTreeItem(item, hasChildrenFlag, getCheckedAttribute(item.id, isOnUpdate));

                // returning method
                loadTreeView(item.id, isOnUpdate);

                treeViewHtml += treeViewEndTag;
                treeViewEndTag = '';
            });

            displayTreeView();
        }

        function getCheckedAttribute(id, isOnUpdate) {
            if (isOnUpdate && ($.inArray(id, treeviewSelectedIds) !== -1)) {
                return 'checked="checked"';
            }
            else {
                return '';
            }
        }

        function getChildren(parentId) {
            var temp = [];

            $.each(treeViewData, function (index, item) {
                if (item.parentId == parentId) {
                    temp.push(item);
                }
            });

            return temp;
        }

        function hasChildren(parentId) {
            var flag = false;
            $.each(treeViewData, function (index, item) {
                if (item.parentId == parentId) {
                    flag = true;
                }
            });
            return flag;
        }

        function appendTreeItem(obj, hasChildren, checkedAttribute) {
            var selectedClass = '';
            var updatableHtml = '';
            var deletableHtml = '';
            var nodeSignCssClass = 'node-plus';

            if (checkedAttribute != '') {
                selectedClass = 'selected';
            }

            if (treeviewIsDisplayChildren) {
                nodeSignCssClass = 'node-minus';
            }

            if (hasChildren) {
                treeViewHtml += '<li><span class="' + nodeSignCssClass + '"></span><label class="' + selectedClass + '"><input data-name="' + obj.name + '" type="checkbox" data-id="' + obj.id + '" ' + checkedAttribute + ' class="chk" /> ' + obj.name + '</label><span class="btn-wrpr">' + updatableHtml + deletableHtml + '</span>';
                treeViewHtml += '<ul>';
            }
            else {
                treeViewHtml += '<li><span class="node-none"></span><label class="' + selectedClass + '"><input type="checkbox" data-name="' + obj.name + '" data-id="' + obj.id + '" ' + checkedAttribute + ' class="chk leaf" /> ' + obj.name + '</label><span class="btn-wrpr">' + updatableHtml + deletableHtml + '</span></li>';
            }
        }

        function displayTreeView() {
            $(".treeview").html(treeViewHtml);
        }
        // <------------------------------------------------- load treeview


        // -------------------------------------------------> operation methods
        function unCheckedAll() {
            $(".treeview .chk").each(function () {
                $(this).prop('checked', false);
            });
        }

        function unCheckedAllExceptThis(id)
        {
            $(".treeview .chk").each(function () {
                var _this = $(this);

                if (_this.attr('data-id') != id) {
                    _this.prop('checked', false);
                }
            });
        }

        function getSelectedIds()
        {
            var temp = [];

            $(".treeview .chk").each(function () {
                var _item = $(this);

                if (_item.is(":checked")) {
                    temp.push(parseInt(_item.attr('data-id')));
                }
            });

            return temp;
        }

        function getSelectedNames()
        {
            var temp = [];

            $(".treeview .chk").each(function () {
                var _item = $(this);

                if (_item.is(":checked")) {
                    temp.push(_item.attr('data-name'));
                }
            });

            return temp;
        }

        function getSelectedLeafIds()
        {
            var temp = [];

            $(".treeview .chk.leaf").each(function () {
                var _item = $(this);

                if (_item.is(":checked")) {
                    temp.push(parseInt(_item.attr('data-id')));
                }
            });

            return temp;
        }

        function getTreeViewObjectById(id) {
            var temp;

            $.each(treeViewData, function (index, item) {
                if (item.id === id) {
                    temp = item;
                }
            });

            return temp
        }

        function hideAllChildren()
        {
            $(".treeview ul").each(function () {
                $(this).css('display', 'none');
            });
        }

        // <------------------------------------------------- operation methods


        // public methods
        return {
            loadTreeViewOnInsert: function (rootId) {
                loadTreeView(rootId, false);

                if (!treeviewIsDisplayChildren) {
                    hideAllChildren();
                }
            },
            loadTreeViewOnUpdate: function (rootId) {
                loadTreeView(rootId, true);
            },
            getSelectedIds: function () {
                return getSelectedIds();
            },
            getSelectedNames: function () {
                return getSelectedNames();
            },
            getSelectedLeafIds: function() {
                return getSelectedLeafIds();
            },
            unCheckedAll: function () {
                unCheckedAll();
            }
        }
    };

}(jQuery));