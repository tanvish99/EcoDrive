<?php

$con = mysqli_connect("localhost","root","","sih");

$start = $_POST['start'];
$destination = $_POST['end'];
$date = $_POST['leave_date'];
$mode = $_POST['mode'];
$seats = $_POST['seats_available'];

if(mysqli_connect_error())
{
	echo"Failed to connect Database";
	echo"<br>";
    echo"<br>";
}
else
{
	echo"Connected to Database Successfully";
	echo"<br>";
    echo"<br>";
	
	$sql = "INSERT INTO create_event(start, end, date, vehicle, seats) VALUES ('$start', '$destination', '$date', '$mode', '$seats')";
	
//	mysqli_query($con,$sql);
	
	if(mysqli_query($con,$sql))
	{
		echo"Insertion Successful";
		echo"<br>";
          echo"<br>";
	}
	else
	{
		echo"Insertion Failed ".$sql."<br>".mysqli_error($con);
		echo"<br>";
          echo"<br>";
	}
		
	mysqli_close($con);
	
    echo"<br>";
    echo"<br>";
    echo"<br>"."Current page will be automatically redirected to Registration Page in 5 seconds !!";
	
	header("refresh:5; url=index.html");
}
?>