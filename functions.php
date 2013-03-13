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

function insert($table, $data) {
	global $link;

	$query = "INSERT INTO `$table` (" . implode(',', array_map('safeFieldName', array_keys($data))) . ') VALUES(' . implode(',', array_map('safeValue', array_values($data))) . ')';
	mysqli_query($link, $query);

	return mysqli_insert_id($link);
}

function safeFieldName($fieldName) {
	return '`' . mysql_escape_string($fieldName) . '`';
}

function safeValue($val) {
	if ($val === (bool) $val) {
		$val = ($val ? 1 : 0);
	}
	return '"' . mysql_escape_string("$val") . '"';
}
?>