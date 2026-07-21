<?php
	header('Content-Type: application/json; charset=utf-8');

    $servername = "localhost";
    $username = "calmprep_anton";
    $password = "MySQL1@bbb";
	$dbname = "calmprep_hunimal";
	$conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
	} 

	// Get values from url
	$week = intval($_GET['week']);
	$name = $_GET['name'];
	$score = floatval($_GET['score']);

	// Insert into database
	$stmt = $conn->prepare('insert into arithmetic_weekly_challenge (week, name, score) values (?, ?, ?);');
	$stmt->bind_param('isd', $week, $name, $score);
	$stmt->execute();

	// Get weekly stats for week
	$stmt = $conn->prepare('select score from arithmetic_weekly_challenge where week = ?;');
	$stmt->bind_param('i', $week);
	$stmt->execute();
	$res = $stmt->get_result();

	$scores = array();

	while ($row = $res->fetch_assoc()) {
		$sc = $row['score'];
		array_push($scores, $sc);
	}

	// Get top percent
	$nScores = count($scores);
	rsort($scores);
	$topPct = 100;

	for ($i=0; $i<$nScores; $i++) {
		if ($score >= $scores[$i]) {
			$topPct = ($i+1)/$nScores*100;
			break;
		}
	}

	$result = array("topPct" => $topPct);
	echo json_encode($result);
?>
