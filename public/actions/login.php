<?php
	include '../../functions.php';

	$returnDict = array();

	$user = $_REQUEST['user'];
	$pass = $_REQUEST['pass'];

	$returnDict['success'] = authenticate($user, $pass);
	if ($returnDict['success']) {
		$returnDict['type'] = $user;
		session_start();
		$_SESSION['userType'] = $returnDict['type'];
	}

	header('Content-type: application/json');

	echo json_encode($returnDict);
?>