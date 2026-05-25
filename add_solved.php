<?php
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

	// Get values from url
	$op = $_GET['op'];
	$num1 = intval($_GET['num1']);
	$num2 = intval($_GET['num2']);
	$time = intval($_GET['time']);

	$stmt = $conn->prepare('insert into arithmetic_times (cookie_id, op, num1, num2, time_seconds) values (?, ?, ?, ?, ?);');
	$stmt->bind_param('ssiii', $cookie_value, $op, $num1, $num2, $time);
	$stmt->execute();
?>
