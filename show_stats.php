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

	$stmt = $conn->prepare('select unix_timestamp(`date`) as ts, op, num1, num2, time_seconds from arithmetic_times where cookie_id = ? order by `date` desc;');
	$stmt->bind_param('s', $cookie_value);
	$stmt->execute();
	$res = $stmt->get_result();

	$now = time();
?>
<!DOCTYPE html>
<html>
<head>
	<title>Arithmetic Stats</title>
	<link rel="stylesheet" href="style/stats.css"/>
</head>
<body>
<table>
<tr><th>Op</th><th>Num1</th><th>Num2</th><th>Time to Solve</th><th>When</th></tr>
<?php
	while ($row = $res->fetch_assoc()) {
		$op = $row['op'];
		$num1 = $row['num1'];
		$num2 = $row['num2'];
		$time = $row['time_seconds'];
		$ts = $row['ts'];
		$delta = ($now-$ts);
		if ($delta > 3600*24*30) {
			$delta = round($delta/3600/24/30);
			$delta = "$delta months ago";
		} elseif ($delta > 3600*24*7) {
			$delta = round($delta/3600/24/7);
			$delta = "$delta weeks ago";
		} elseif ($delta > 3600*24) {
			$delta = round($delta/3600/24);
			$delta = "$delta days ago";
		} elseif ($delta > 3600) {
			$delta = round($delta/3600);
			$delta = "$delta hours ago";
		} elseif ($delta > 60) {
			$delta = round($delta/60);
			$delta = "$delta minutes ago";
		} else {
			$delta = "$delta seconds ago";
		}
		echo "<tr>";
		echo "<td>$op</td>";
		echo "<td>$num1</td>";
		echo "<td>$num2</td>";
		echo "<td>$time</td>";
		echo "<td>$delta</td>";
		echo "</tr>";
	}
?>
</table>
</body>
</html>
