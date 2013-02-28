<?php
	session_start();

	$retDict = array('active' => false);
	if (array_key_exists('userType', $_SESSION)) {
		$retDict['active'] = true;
		$retDict['type'] = $_SESSION['userType'];
	}
	header('Content-type: application/json');
	echo json_encode($retDict);
?>