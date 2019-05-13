import Modeler from 'bpmn-js/lib/Modeler';
import CliModule from 'bpmn-js-cli';
// import EventBus from 'diagram-js/lib/core/EventBus';

import * as PanelProperties from 'customPanel/PanelProperties';
import * as draw from 'customPanel/draw';
import * as Palette from 'customPanel/palette/MyPaletteProvider';

// create a modeler
var modeler = new Modeler({
    container: '#canvas',
    keyboard: {
        bindTo: window
    },
    additionalModules: [
        CliModule
    ],
    cli: {
        bindTo: 'cli'
    }
});

// eventBus.on('import.done',function(event)
// {
//     var tmpURL = 'http://localhost/bp/get.php';
//     // var tmpURL = 'http://bp.vcu.ir/get.php';
//
//     $.ajax({
//         type: 'post',
//         url: tmpURL,
//         data: {
//             'getJSON': 'true'
//         },
//         success: function (xml) {
//             Palette.parser(xml, modeling);
//         }
//     });

// Palette.test();
//console.log("Imported Completed");
//exportDiagram();
// });

var eventBus = modeler.get('eventBus');
var modeling = modeler.get('modeling');
var currElem;

eventBus.on('element.click',function(event) {
    var elem = event.element;
    currElem = elem.id;
    updatePanelInfo(elem);
});

var selectedElement;
var inputs = [];
var combos = [];

function updatePanelInfo(elem) {

    selectedElement = elem;
    inputs = draw.drawPanel(PanelProperties.getTabs(elem));

    combos = inputs[1];
    inputs = inputs[0];

    var tagsVal = $("#tag").val();

    if(tagsVal.length > 0) {
        tags = tagsVal.split('$$');
        currIdxTag = 0;
        renderTags();
    }
    else {
        tags = [];
        currIdxTag = 0;
    }

    $("#tag").change(updateTags).focusout(updateTags);

    $(".defaultInput").change(onAnyTextBoxChanged).focusout(onAnyTextBoxFocusLost);

    for (var i = 0; i < combos.length; i++) {
        getComboOptions(combos[i]);
        $("#" + combos[i]).change(onAnyTextBoxChanged).focusout(onAnyTextBoxFocusLost);
    }

    for (i = 0; i < inputs.length; i++) {

        if(inputs[i] == "Importance") {

            var oldRate = $("#Importance").val();

            $("#importanceRating").rateYo({
                fullStar: true,
                rating: (oldRate.length == 0) ? 0 : oldRate,
                onSet: function (rating, rateYoInstance) {
                    $("#Importance").val(rating).change().focusout();
                }
            });
        }

        else if(inputs[i] == "approvalDate" || inputs[i] == "dateOfDelivery") {
            Calendar.setup({
                inputField: inputs[i],
                button: inputs[i] + "_date_btn",
                ifFormat: "%Y/%m/%d",
                dateType: "jalali"
            });
        }

        $("#" + inputs[i]).change(onAnyTextBoxChanged).focusout(onAnyTextBoxFocusLost);
    }
}

var isDiagramDirty = false;

function onAnyTextBoxChanged() {
    isDiagramDirty = true;
}

function updateTags() {

    var properties = {};
    properties["tag"] = $("#tag").val();

    modeling.updateProperties(selectedElement, properties);
}

function onAnyTextBoxFocusLost()  {

    if(isDiagramDirty == true && typeof selectedElement !== 'undefined')  {

        var properties = {};

        for (var i = 0; i < inputs.length; i++) {
            properties[inputs[i]] = $("#" + inputs[i]).val();
            properties["role_" + inputs[i]] = $("#role_" + inputs[i]).val();
        }

        for(i = 0; i < combos.length; i++) {
            properties[combos[i]] = $("#" + combos[i]).val();
        }

        $(".defaultInput").each(function () {
            properties[$(this).attr('name')] = $(this).val();
        });

        modeling.updateProperties(selectedElement, properties);
        isDiagramDirty = false;
    }
}


// var urlDiagram = 'http://localhost/bp/get.php';
var urlDiagram = 'http://bp.vcu.ir/get.php';

function getDiagram() {

    $.ajax({
        type: 'post',
        url: urlDiagram,
        data: {
            'getDiagram': 'true'
        },
        success: function (xml) {
            openDiagram(xml)
        }
    });
}

function openDiagram(bpmnXML) {

    // import diagram
    modeler.importXML(bpmnXML, function(err) {

        if (err) {
            return console.error('could not import BPMN 2.0 diagram', err);
        }

        var canvas = modeler.get('canvas');
        canvas.zoom('fit-viewport');
    });
}

getDiagram();

$("#upl").click(function () {
    var cli = window.cli;
    $("#diagram_id").val(cli.elements()[0]);
    $("#elem_id").val(currElem);
});

$("#saveBtnFake").click(function () {
    modeler.saveXML({ format: true }, function(err, xml) {

        // var url = 'http://localhost/bp/index.php';
        var url = 'http://bp.vcu.ir/index.php';

        if (err) {
            return console.error('could not save BPMN 2.0 diagram', err);
        }

        $.ajax({
            type: 'post',
            url: url,
            data: {
                'xml': xml
            }
        });

        console.log('DIAGRAM', xml);
    });
});

$("#printBtn").click(function () {

    modeler.saveSVG(function (err, svg) {
        if (err) {
            console.error(err);
        }
        else {

            var file = new Blob([svg], {type: "svg"});
            if (window.navigator.msSaveOrOpenBlob) // IE10+
                window.navigator.msSaveOrOpenBlob(file, "output.svg");
            else { // Others
                var a = document.createElement("a"),
                    url = URL.createObjectURL(file);
                a.href = url;
                a.download = "output.svg";
                document.body.appendChild(a);
                a.click();
                setTimeout(function() {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 0);
            }

            // $("#myCanvasPrint").empty().append(svg);
            // var cnv = document.getElementById("myCanvasPrint");
            // var img = cnv.toDataURL();
            // saveSvgAsPng(document.getElementById("myCanvasPrint"), "diagram.png");
            // var img = $("#myCanvasPrint").empty().append(svg).toDataURL("image/png");
            // var img = cnv.toDataURL("image/png");
            // document.write('<img src="'+img+'"/>');
        }
    });
});

$("#outputBtn").click(function () {

    modeler.saveXML(function (err, xml) {
        if (err) {
            console.error(err);
        }
        else {

            var file = new Blob([xml], {type: "xml"});
            if (window.navigator.msSaveOrOpenBlob) // IE10+
                window.navigator.msSaveOrOpenBlob(file, "output.bpmn");
            else { // Others
                var a = document.createElement("a"),
                    url = URL.createObjectURL(file);
                a.href = url;
                a.download = "output.bpmn";
                document.body.appendChild(a);
                a.click();
                setTimeout(function() {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 0);
            }
        }
    });
});

$("#saveBtn").click(function () {
    modeler.saveXML({ format: true }, function(err, xml) {

        // var url = 'http://localhost/bp/index.php';
        var url = 'http://bp.vcu.ir/index.php';

        if (err) {
            return console.error('could not save BPMN 2.0 diagram', err);
        }

        $.ajax({
            type: 'post',
            url: url,
            data: {
                'xml': xml
            },
            success: function (response) {
                window.location.reload();
            }
        });

        console.log('DIAGRAM', xml);
    });
});