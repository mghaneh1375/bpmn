import Modeler from 'bpmn-js/lib/Modeler';
import CliModule from 'bpmn-js-cli';
import * as PanelProperties from 'customPanel/PanelProperties';
import * as draw from 'customPanel/draw';

const uploadServer = "https://ppl.ut.ac.ir/demo/uploaded_diagrams/index.php";
const baseDiagramUrl = "https://ppl.ut.ac.ir/demo/uploaded_diagrams/";
const pageId = 26204;
var diagramFilename = "";
var diagramName = "";
var diagramUrl = "";
var diagramXmlContent = "";

function getValueFromQueryString(key){
    var searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(key);
}

diagramUrl = getValueFromQueryString('url');
diagramName = getValueFromQueryString('name');

if(diagramName != null)
    diagramFilename =  diagramUrl.substr(diagramUrl.lastIndexOf("/")+1);

if(diagramUrl == null || diagramName == null)
{
    alert("The diagram url or diagram name is not defined.")
}
else
{
    var expression=/(http(s)?:\/\/.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}.(bpmn|xml)/g;
    var regex = new RegExp(expression);
    if (diagramUrl.match(regex)) {
        console.log("Loading diagram " + diagramUrl);
        $.get(diagramUrl, openDiagram);
    } else {
        alert("The diagram url is not valid.")
    }
}

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

        for(i = 0; i < combos.length; i++) {
            properties[combos[i]] = $("#" + combos[i]).val();
        }

        for (var i = 0; i < inputs.length; i++) {
            properties[inputs[i]] = $("#" + inputs[i]).val();
            properties["role_" + inputs[i]] = $("#role_" + inputs[i]).val();
        }

        $(".defaultInput").each(function () {
            properties[$(this).attr('name')] = $(this).val();
        });

        modeling.updateProperties(selectedElement, properties);
        isDiagramDirty = false;
    }
}


$("#upl").click(function () {
    var cli = window.cli;
    $("#diagram_id").val(cli.elements()[0]);
    $("#elem_id").val(currElem);
});

$("#saveBtnFake").click(function () {

    modeler.saveXML({ format: true }, function(err, xml) {

        var url = 'https://ppl.ut.ac.ir/demo/editor/basedata/index.php';

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

function openDiagram(bpmnXML) {

    // import diagram
    modeler.importXML(bpmnXML, function(err) {

        if (err) {
            return console.error('could not import BPMN 2.0 diagram', err);
        }

        // access modeler components
        var canvas = modeler.get('canvas');
        // var overlays = modeler.get('overlays');

        // zoom to fit full viewport
        canvas.zoom('fit-viewport');

        // attach an overlay to a node
        // overlays.add('SCAN_OK', 'note', {
        //   position: {
        //     bottom: 0,
        //     right: 0
        //   },
        //   html: '<div class="diagram-note">Mixed up the labels?</div>'
        // });

        // add marker
        // canvas.addMarker('SCAN_OK', 'needs-discussion');
    });
}

function saveDiagram(done) {

    modeler.saveXML({ format: true }, function(err, xml) {
        done(err, xml);
    });
}

// check file api availability
if (!window.FileList || !window.FileReader) {
    window.alert(
        'Looks like you use an older browser that does not support drag and drop. ' +
        'Try using Chrome, Firefox or the Internet Explorer > 10.');
}


$(function() {
    var downloadLink = $('#saveBtn');

    downloadLink.click(pushToServer);

    function setEncoded(link, name, data) {
        var encodedData = encodeURIComponent(data);

        if (data) {
            link.addClass('active').attr({
                'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
                'download': name
            });
        } else {
            link.removeClass('active');
        }
    }

    var exportArtifacts = debounce(function() {

        saveDiagram(function(err, xml) {
            diagramXmlContent = xml;
            //setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
        });
    }, 500);

    modeler.on('commandStack.changed', exportArtifacts);
});

function pushToServer()
{
    debugger;
    console.log("Uploading to server !");
    var diagramBlob = new Blob([diagramXmlContent], {type : "text/xml" , encoding : "charset=UTF-8"});
    console.log(diagramXmlContent);


    var formData = new FormData(); // Currently empty
    formData.append("blob",diagramBlob);
    formData.append("filename",diagramFilename);
    formData.append("name",encodeURIComponent(diagramName));

    $.ajax({
        type: 'POST',
        url: uploadServer,
        data: formData,
        processData: false,
        contentType: false
    }).done(
        function(data) {
            // print the output from the upload.php script\
            console.log("Done");
            console.log(data);

            if(data.status == "ok")
                window.location.replace("https://ppl.ut.ac.ir/demo/?page_id=" + pageId + "&diagram-url=" + baseDiagramUrl + data.file.filename + "&diagram-name=" + encodeURIComponent(diagramName));
            else
                alert(data.message);

        })
        .fail(
            function(data)
            {
                console.log("failed");
                console.log(data);

                alert("Unable to upload diagram. please try again later.");
            })
        .progress(
            function(data)
            {
                console.log(data);
            }
        );

}

// helpers //////////////////////

function debounce(fn, timeout) {

    var timer;

    return function() {
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(fn, timeout);
    };
}
