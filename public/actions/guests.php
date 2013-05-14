<?php
	include '../../functions.php';

	if (checkPermission('guest')) {
		$action = $_REQUEST['action'];

		if ($action == 'load') {
			header('Content-type: application/json');

			connect();

			$startsWith = mysql_escape_string(strtoupper($_REQUEST['startsWith']));

			if ($startsWith) {
				$query = 'SELECT * FROM guests WHERE last_name LIKE "' . $startsWith . '%" OR ' .
					'family_name LIKE "' . $startsWith . '%" ORDER BY `last_name`, `first_name`, `type`';
			} else {
				$query = 'SELECT * FROM guests ORDER BY `last_name`, `first_name`, `type`';
			}
			$result = mysqli_query($link, $query);

			disconnect();

			$arr = array();

			while ($row = mysqli_fetch_assoc($result)) {
				//set data types
				$row['attending'] = (bool) $row['attending'];
				$row['plus_one'] = (bool) $row['plus_one'];
				$row['plus_one_permitted'] = (bool) $row['plus_one_permitted'];
				$row['id'] = (int) $row['id'];

				//add to output array
				$arr[] = $row;
			}

			echo json_encode($arr);
		} else if ($action == 'add') {
			if (checkPermission('admin')) {
				header('Content-type: application/json');

				connect();

				$data = (array)json_decode($_REQUEST['data']);

				$insertedId = insert('guests', $data);

				disconnect();

				$arr = array('id' => $insertedId);

				echo json_encode($arr);
			} else {
				header('HTTP/1.0 403 Forbidden');
				echo 'You must be logged in as an admin to access this resource';
			}
		} else if ($action == 'edit') {
			if (checkPermission('admin')) {
				header('Content-type: application/json');

				$data = (array)json_decode($_REQUEST['data']);
				$id = (int)$_REQUEST['id'];

				connect();
				$success = update('guests', $id, $data);

				$arr = array('success' => $success);
				if (!$success) {
					$arr['errorMsg'] = mysqli_error($link);
				}
				disconnect();

				echo json_encode($arr);
			} else {
				header('HTTP/1.0 403 Forbidden');
				echo 'You must be logged in as an admin to access this resource';
			}
		} else if ($action == 'delete') {
			if (checkPermission('admin')) {
				header('Content-type: application/json');

				$data = (array)json_decode($_REQUEST['data']);
				$id = (int)$_REQUEST['id'];

				connect();
				
				$query = "DELETE FROM guests WHERE id=$id";
				$success = mysqli_query($link, $query);

				$arr = array('success' => $success);
				if (!$success) {
					$arr['errorMsg'] = mysqli_error($link);
				}
				disconnect();

				echo json_encode($arr);
			}
		} else if ($action == 'respond') {
			header('Content-type: application/json');

			$id = (int)$_REQUEST['id'];
			$data = (array)json_decode($_REQUEST['data']);

			$validData = array();

			connect();

			if (array_key_exists('attending', $data)) {
				$validData['attending'] = $data['attending'];
			}

			if (array_key_exists('plus_one', $data)) {
				$query = "SELECT plus_one_permitted FROM guests WHERE id=\"$id\"";
				$tmpResult = mysqli_query($link, $query);
				$tmpRow = mysqli_fetch_assoc($tmpResult);
				$plus_one_permitted = $tmpRow['plus_one_permitted'];

				if ($plus_one_permitted) {
					$validData['plus_one'] = $data['plus_one'];
				}
			}

			$validData['responded'] = "NOW()";

			$success = update('guests', $id, $validData);

			$arr = array('success' => $success);
			if (!$success) {
				$arr['errorMsg'] = mysqli_error($link);
			}
			disconnect();

			echo json_encode($arr);
		} else if ($action == 'adminInfo') {
			//returns admin info
			header('Content-type: application/json');

			echo json_encode($settings['admin']);
		}
	} else {
		header('HTTP/1.0 403 Forbidden');
		echo 'You must be logged in to access this resource';
	}
?>