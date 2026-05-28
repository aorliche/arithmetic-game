<?php
	header('Content-type: application/json');

    $servername = "localhost";
    $username = "calmprep_anton";
    $password = "MySQL1@bbb";
	$dbname = "calmprep_hunimal";
	$conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
	} 

	// Cookie
	$cookie_name = "arithmetic_id";
	$cookie_value = uniqid();

	if (isset($_COOKIE[$cookie_name])) {
		$cookie_value = $_COOKIE[$cookie_name];
	} else {
		setcookie($cookie_name, $cookie_value);
	}

	$stmt = $conn->prepare('select unix_timestamp(`date`) as ts, cookie_id, op, num1, num2, time_seconds from arithmetic_times order by `date` desc;');
	$stmt->execute();
	$res = $stmt->get_result();
	
	$now = time();

	$json_obj = array("cookie_value" => $cookie_value, "now" => $now, "times" => array());

	while ($row = $res->fetch_assoc()) {
		array_push($json_obj['times'], $row);
	}

	echo json_encode($json_obj);
?>
