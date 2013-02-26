<?php
	include '../../functions.php';

	$returnDict = array();

	$user = $_REQUEST['user'];
	$pass = $_REQUEST['pass'];

	$returnDict['success'] = authenticate($user, $pass);

	header('Content-type: application/json');

	echo json_encode($returnDict);
?>