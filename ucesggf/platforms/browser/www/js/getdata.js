//This file loads the data that are entered as input from the web question app.

var poilayer;

function loadPoiData() { 
	//alert("load the data here");
	getpoi();
}

//Connecting with the server(Code adapted from Ellul, 2018: )
var client;
var poilayer;

function getpoi() {
	client = new XMLHttpRequest();

client.open('GET','http://developer.cege.ucl.ac.uk:30301/getPOI'); 
client.onreadystatechange = poiResponse; 
client.send();
}


function poiResponse() {
// this function listens out for the server to say that the data is ready - i.e. has state 4 
if (client.readyState == 4) {
// once the data is ready, process the data 
	var poidata = client.responseText; 
	loadPoilayer(poidata);
	}
}

// convert the received data - which is text - to JSON format and add it to the map 
function loadPoilayer(poidata) {
// convert the text to JSON
	var poijson = JSON.parse(poidata);
	poilayer = L.geoJson(poijson).addTo(mymap);
	mymap.fitBounds(poilayer.getBounds());
}
