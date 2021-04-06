<?php

$con = mysqli_connect("localhost","root","","sih");


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
	
	$sql = "SELECT start, end, date, vehicle, seats from create_event";
	$results = mysqli_query($con,$sql);
    
    while($row=mysqli_fetch_array($results))
    {
            echo "Mr. Tanvish Minache is planning a trip <br>";        
            echo "from ".$row['start']."<br>";
            echo "to ";
            echo $row['end']."<br>";
            echo "on date ".$row['date']."<br>";
            echo "on ".$row['vehicle']."<br>";
            echo "Available seats are ". $row['seats']."<br>";
    }
		
	mysqli_close($con);
	
    echo"<br>";
    echo"<br>";
	// echo"<br>"."Current page will be automatically redirected to Registration Page in 10 seconds !!";
	
	// header("refresh:10; url=index.html");
}
?>