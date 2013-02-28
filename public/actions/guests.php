<?php
	include '../../functions.php';

	if (checkPermission('guest')) {
		$action = $_REQUEST['action'];

		if ($action == 'load') {
			if (checkPermission('admin')) {
				header('Content-type: application/json');

				connect();

				$query = 'SELECT * FROM guests ORDER BY `last_name`, `first_name`, `type`';
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
			} else {
				header("HTTP/1.0 403 Forbidden");
				echo "You must be logged in as an admin to access this resource";
			}
		}
	} else {
		header("HTTP/1.0 403 Forbidden");
		echo "You must be logged in to access this resource";
	}
?>