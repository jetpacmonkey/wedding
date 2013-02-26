<?php
include_once "settings.php";

function connect() {
	global $settings;

	if ($settings['database']['port']) {
		$GLOBALS['link'] = mysqli_connect(
				$settings['database']['host'],
				$settings['database']['user'],
				$settings['database']['password'],
				$settings['database']['database'],
				$settings['database']['port']
			);
	} else {
		$GLOBALS['link'] = mysqli_connect(
				$settings['database']['host'],
				$settings['database']['user'],
				$settings['database']['password'],
				$settings['database']['database']
			);
	}

	/* check connection */
	if (mysqli_connect_errno()) {
		printf("Connect failed: %s\n", mysqli_connect_error());
		exit();
	}
}

function disconnect() {
	mysqli_close($GLOBALS['link']);
}

function checkPermission($type="admin") {
	session_start();

	return ($_SESSION['userType'] == "admin" || ($type == "guest" && $_SESSION['userType'] == "guest"));
}

function authenticate($user, $pass) {
	global $settings;
	return (array_key_exists($user, $settings['users']) && $settings['users'][$user] == $pass);
}
?>