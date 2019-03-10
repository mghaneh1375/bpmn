import Modeler from 'bpmn-js/lib/Modeler';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/bpmn';
import EventBus from 'diagram-js/lib/core/EventBus';

// import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';

// import diagramXML from './resources/diagram1.bpmn';
// import diagramXML2 from './resources/diagram2.bpmn';


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
    propertiesPanel: {
        parent: '#js-properties-panel'
    },
      additionalModules: [
        propertiesPanelModule,
        propertiesProviderModule
      ]
});

// var modeler2 = new Modeler({
//     container: '#canvas2',
//     propertiesPanel: {
//         parent: '#js-properties-panel2'
//     },
//       additionalModules: [
//         propertiesPanelModule,
//         propertiesProviderModule
//       ]
// });

// var urlDiagram = 'http://localhost/bp/get.php';
// var urlDiagram = 'http://bp.vcu.ir/get.php';

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

// function openDiagram2(bpmnXML) {
//
//     modeler2.importXML(bpmnXML, function(err) {
//
//       if (err) {
//         return console.error('could not import BPMN 2.0 diagram', err);
//       }
//
//       // access modeler components
//       var canvas2 = modeler2.get('canvas');
//       canvas2.zoom('fit-viewport');
//       canvas2.addMarker('SCAN_OK', 'needs-discussion');
//     });
// }

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

// bootstrap diagram functions

$(function() {
    var downloadLink = $('#saveBtn');

    downloadLink.click(pushToServer);

    //openDiagram(diagramXML);

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
    var diagramBlob = new Blob([diagramXmlContent], {type : "text/xml" , encoding : "charset=UTF-8"});

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

// var eventBus = new EventBus();
//
$("#done").click(function (event) {
//     event = {
//         "element": selectedElementMine,
//         "gfx": {},
//         "originalEvent": {
//             "isTrusted": true,
//             "delegateTarget": {}
//         },
//         "type": "element.click"
//     };
//
//     console.log(JSON.stringify(event, null, 4));
//     eventBus.fire('shape.changed', event);
//     eventBus.fire('element.changed', event);
});

// $("#saveBtn").click(function () {
//     modeler.saveXML({ format: true }, function(err, xml) {
//
//         // var url = 'http://localhost/bp/index.php';
//         var url = 'http://bp.vcu.ir/index.php';
//
//         if (err) {
//             return console.error('could not save BPMN 2.0 diagram', err);
//         }
//
//         $.ajax({
//             type: 'post',
//             url: url,
//             data: {
//                 'xml': xml
//             },
//             success: function (response) {
//                 // alert('Diagram exported. Check the developer tools!');
//                 alert(response);
//             }
//         });
//
//         console.log('DIAGRAM', xml);
//     });
// });
