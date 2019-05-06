<?php

if(isset($_SERVER["HTTP_ORIGIN"])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 600");    // cache for 10 minutes

if($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    if (isset($_SERVER["HTTP_ACCESS_CONTROL_REQUEST_METHOD"]))
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT"); //Make sure you remove those you do not want to support

    if (isset($_SERVER["HTTP_ACCESS_CONTROL_REQUEST_HEADERS"]))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    //Just exit with 200 OK with the above headers for OPTIONS method
    exit(0);
}

if(isset($_POST["getDiagram"])) {

    $myfile = fopen("newfile.bpmn", "r") or die("Unable to open file!");
    echo fread($myfile,filesize("newfile.bpmn"));
    fclose($myfile);
}

if(isset($_POST["getJSON"])) {

    $myfile = fopen("sample.json", "r") or die("Unable to open file!");
    echo fread($myfile,filesize("sample.json"));
    fclose($myfile);
}

if(isset($_POST["getNodes"])) {
    echo json_encode([['name'=> 'a', 'id' => -1], ['name'=> 'aa', 'id'=> 12, 'parent'=> 'a'], ['name'=> 'aaa', 'id'=> 11, 'parent'=> 'a'],
		['name' => 'b', 'id' => -1], ['name' => 'bb', 'id' => 13, 'parent' => 'b'], ['name' => 'bbb', 'id' => 14, 'parent' => 'b'],
		['name' => 'c', 'id' => -1], ['name' => 'cc', 'id' => 15]]);
    }
?>