//This file includes the functions responsible to track location, calculate the distances with points of interest, finding the minimum
//and then pop the relevant question. Additionally, the file checks whether the answer is correct and uploads the user's input back to the server.

//Getting user's location and updating every 15 seconds
function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(getPosition);
		loc = setTimeout(getLocation, 15000);
		} else {
			document.getElementById('getPosition').innerHTML = "Geolocation is not supported by this browser";
		}
}
//Stopping the geolocation
function stopLocation() {
	clearInterval(loc);
}

//Placing the users location in map as a point. oldPoint is a variable that allows keeping only the latest point and not the previous that occur every 15 seconds
var oldPoint;

function getPosition(position) {
	if (oldPoint) {
		mymap.removeLayer(oldPoint);
	}
	console.log(position);
	document.getElementById('getPosition').innerHTML = "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude;
	var x = position.coords.latitude;
	var y = position.coords.longitude;
	oldPoint = L.marker([x, y], {icon:testMarkerRed}).addTo(mymap).bindPopup("<b>This is your current location</b>").openPopup();
	mymap.setView([x,y], 20);
}

//Getting all the functionality of calcDistFromPoint (Source: Adapted from Ellul, 2018: Web and Mobile Apps and Programming – Location Based Services via HTML5)
function getDistance() { 
	//alert('getting distance');
	navigator.geolocation.getCurrentPosition(calcDistFromPoint);
}

// This function performs the following: 1)calculates the distance between the user's location with every point of interest, 2)if this distance is smaller than 100meters, it pops the 
//relevant question by using the index of the min value distance.
var poilayer;//the points of interest
var distance =[];//empty array, this is where the results as stored as array
var recobj; //empty object to store the question in order to perform AJAX call
function calcDistFromPoint(position) {
	var l = poilayer.toGeoJSON().features;
	for (var i=0; i<l.length; i++) { //itterating through poi
		var lat = poilayer.toGeoJSON().features[i].geometry.coordinates[1]; //this is longitute
		var lon = poilayer.toGeoJSON().features[i].geometry.coordinates[0]; // this is latitude
		distance[i] = calculateDistance(position.coords.latitude, position.coords.longitude, lat, lon); //getting all distances
		console.log(distance[i]); //seeing the result
		}
	var minDist = Math.min.apply(null,distance); //finding the minimum value of the distances
	console.log(minDist);
	console.log(minDist instanceof Number); //making sure its number
	var minindex = distance.indexOf(minDist); //indexing the min value 
	console.log(minindex);
	//document.getElementById('showDistance').innerHTML = "Distance: " + minDist;	
	
	var k = poilayer.toGeoJSON().features[minindex].properties; //setting a variable to itterate through the properties of the indexed distance
//checking if its closer than 100 meters
	if (minDist < 0.1) {
		alert("You are near a building! Please scroll down to see the question")
		console.log(k);
		recobj =
		{
			'Question': k.question,
			'A': k.optiona,
			'B': k.optionb,
			'C': k.optionc,
			'D': k.optiond,
			'Correct': k.solution
		};

	console.log('Minimum distance: ', minDist);
	callDivChange(recobj); //making the AJAX call
	} else {
		alert("You are too far from UCL to play GeoQuiz");
	}
}


// define the global variable to process the AJAX request (Adapted by Ellul, 2018: Practical 5: Web and Mobile Apps and Programming – Servers and AJAX)
function callDivChange(recobj) {
	xhr = new XMLHttpRequest(); 
	xhr.open("GET", "userform.html", true); 
	xhr.onreadystatechange = function(){processDivChange(recobj)}; 
	try {
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); }
	catch (e) {
// this only works in internet explorer
	}
	xhr.send(); 
}

function processDivChange(recobj) {
	if (xhr.readyState === 4)  // 4 = Response from server has been completely loaded. 
		if (xhr.status == 200 && xhr.status < 300){
// http status between 200 to 299 are all successful 
		document.getElementById('userform').innerHTML = xhr.response;
		document.getElementById('question').innerHTML = recobj.Question;
		document.getElementById('optionA').innerHTML = recobj.A;
		document.getElementById('optionB').innerHTML = recobj.B;
		document.getElementById('optionC').innerHTML = recobj.C;
		document.getElementById('optionD').innerHTML = recobj.D;
	}
}
//is useful to add it as user identification in the database
var info = navigator.userAgent;	
//uploading data to the server
function startAnswerUpload() {
    	//alert ("start answer upload");

    var answer = [];
    	sol = recobj.Correct;//setting it as variable
    	form.elements[0].value = recobj.A;//defining the values of each option as they change dynamically
    	form.elements[1].value = recobj.B;
    	form.elements[2].value = recobj.C;
    	form.elements[3].value = recobj.D;
   //itterationg through the elements of the form
    for (var i = 0; i <form.elements.length; i++) {
    	if (form.elements[i].checked == true) { //if this option is checked by the user
    		if (form.elements[i].value == sol) { //and if the value of this option matches the value of the correct solution
    			var answer = form.elements[i].value; //store it as answer and say congrats
    			alert('Congratulations! Your answer is correct!!!');
    		} 	else {
    			var answer = form.elements[i].value; //otherwise store it as answer and say study harder
    		alert('Study harder :(');
    	}
    }
}		//checking that we get what we need
		console.log(answer);
		console.log(sol);
		console.log(info);
		//preparing the string for server upload
	var postString = "solution="+sol+"&answer="+answer+"&info="+info;
	console.log(postString);
	processAnswerData(postString);

}
//Uploading the data to the server, adapted from Ellul, 2018:Practical 5: Web and Mobile Apps and Programming – Servers and AJAX))
var client;

function processAnswerData(postString) {
   client = new XMLHttpRequest();
   client.open('POST','http://developer.cege.ucl.ac.uk:30301/location',true);
   client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
   client.onreadystatechange = dataUploaded;
   client.send(postString);
}

function dataUploaded() {
  // this function listens out for the server to say that the data is ready - i.e. has state 4
  if (client.readyState == 4) {
    // change the DIV to show the response
    document.getElementById("dataUploadResult").innerHTML = 'The files have been correctly uploaded...';
    }
}
//Calculating the distances
//Source: https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates-shows-wrong, Nickname: Derek
function calculateDistance(lat1, lon1, lat2, lon2) {
	var R = 6371;
	var dLat = deg2rad(lat2-lat1);
	var dLon = deg2rad(lon2-lon1); 
  	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  	var d = R * c; // Distance in km
  	return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

