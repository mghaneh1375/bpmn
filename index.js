import Modeler from 'bpmn-js/lib/Modeler';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/bpmn';
import EventBus from 'diagram-js/lib/core/EventBus';

// import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';

// import diagramXML from './resources/diagram1.bpmn';
// import diagramXML2 from './resources/diagram2.bpmn';

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

var urlDiagram = 'http://localhost/bp/get.php';
// var urlDiagram = 'http://bp.vcu.ir/get.php';

function getDiagram() {
    // $.ajax(url, { dataType : 'text' }).done(function(xml) {
    //     openDiagram(xml);
    // });

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

getDiagram();

// var eventBus = new EventBus();
//
$("#done").click(function (event) {
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
                // alert('Diagram exported. Check the developer tools!');
                alert(response);
            }
        });

        console.log('DIAGRAM', xml);
    });
//
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
                // alert('Diagram exported. Check the developer tools!');
                alert(response);
            }
        });

        console.log('DIAGRAM', xml);
    });
});
