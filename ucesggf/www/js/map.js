//Source: Adapted from Ellul, 2018: Web and Mobile Apps and Programming – Leaflet and Javascript Part 1
// load and setting the view of the map
		var mymap = L.map('mapid').setView([51.524559, -0.134040], 14);
// load the tiles
		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
						maxZoom: 18,
						attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' + '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 'Imagery © <a href="http://mapbox.com">Mapbox</a>', 
						id: 'mapbox.streets'
				}).addTo(mymap); 
