loadJSON("https://raw.githubusercontent.com/friendlycode/gr-parks/gh-pages/parks.geojson", JSONloaded);

function loadJSON(url, callback) {   
	var xobj = new XMLHttpRequest();
	if (xobj.overrideMimeType) {xobj.overrideMimeType("application/json");}
	xobj.open('GET', url, true);
	xobj.onreadystatechange = function () {
		if (xobj.readyState == 4 && xobj.status == "200") {callback(xobj.responseText);}
		};
    xobj.send(null);  
 	}
 
function JSONloaded(response) {
	parks = JSON.parse(response);
	ids = [];
	parkFeatures = [];
	mapParks(); 
	showFeatures();
	}
	
function mapParks() {
	map = L.map("map").setView([42.9612, -85.6557], 12);
	L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
		attribution: 
			"<a target='_blank' href='" +
				"https://www.mapbox.com/about/maps/'>&copy; Mapbox</a> " +
			"<a target='_blank' href='" +
				"http://www.openstreetmap.org/copyright'>&copy; OpenStreetMap</a> " +
			"<a target='_blank' href='" +
				"https://www.mapbox.com/map-feedback/#/-85.596/42.997/14'><b>Improve the underlying map</b></a>",
		minZoom: 11,
		maxZoom: 17,
		id: "github.kedo1cp3",
		accessToken: "pk.eyJ1IjoiZ2l0aHViIiwiYSI6IjEzMDNiZjNlZGQ5Yjg3ZjBkNGZkZWQ3MTIxN2FkODIxIn0.o0lbEdOfJYEOaibweUDlzA"
		}).addTo(map);
	allLayers = L.geoJson(parks, {onEachFeature: getFeature, style: {"color": "#ff7800", "weight": 1, "opacity": 0.65}}).addTo(map);
	}
	
function getFeature(feature, layer) {
	if (feature.properties && feature.properties.name) {
		
		// make a popup for the map
		var pool = function() {
			if (feature.properties.pool) {return "<br />pool: " + feature.properties.pool;}	else {return "";}
			}
		layer.bindPopup(
			"<h3>" + feature.properties.name + "</h3>" +
			"<h4>" + feature.properties.type + " " + feature.properties.leisure + "</h4>" +
			"<p>" + feature.properties.acreage + " acres" + pool() + "</p>" +
			"<p><b>millage: </b>" + feature.properties.millage + "</p>",
			{closeButton: false}
			);
		layer._leaflet_id = feature.id;
		
		// remember the feature's properties, excluding duplicates
		if (ids.indexOf(feature.id) == -1) {
			ids.push(feature.id);
			if (!feature.properties.millage) {feature.properties.millage = "none";};
			parkFeatures.push({
				"name": feature.properties.name, 
				"id": feature.id, 
				"type": feature.properties.type + " " + feature.properties.leisure,
				"acreage": feature.properties.acreage,
				"pool": feature.properties.pool,
				"millage": feature.properties.millage
				});
			}
		
		}
	}
	
function showFeatures() {
	parkFeatures.sort(function(a, b){return (a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : -1;});
	for (i = 0; i < parkFeatures.length; i++) {
		
		// parklist gets just names
		var li = document.createElement("li");
		var a = document.createElement("a");
		a.href = "javascript:pop('" + i + "');";
		a.text = parkFeatures[i].name;
		li.appendChild(a);
		parklist.appendChild(li);
		
		var tr = document.createElement("tr");
		tr.onclick = function(e) {pop(e.target.parentNode.rowIndex - 1);};
		
		var tile = document.createElement("div");
		tile.innerHTML = 
			"<a href=javascript:pop('" + i + "');>" +
			"<i class='fa fa-map-marker fa-2x'></i>" + 
			"</a>";
		tile.className = "plain";
		
		var flipperNeeded = false;
		
		// grid (table) and tiles get all data except id
		var feature = JSON.parse(JSON.stringify(parkFeatures[i]));
		delete feature.id;
		for (f in feature) {
			
			// for table cells
			var td = document.createElement("td");
			td.textContent = feature[f];
			tr.appendChild(td);
			
			// for tiles		
			var p = document.createElement("p");
			p.textContent = feature[f];
			switch (f) {
				case "acreage":
					p.textContent += " acres";
					break;
				case "millage":
					if (feature[f] == "none") {p.textContent = "";} else {flipperNeeded = true;}
					break;
				case "pool":
					if (feature[f] == "") {p.innerHTML = "&nbsp;";} else {p.textContent += " pool";}
					break;
				}
			tile.appendChild(p);
			} 

		tbody.appendChild(tr);
		if (flipperNeeded) {
			var flipContainer = document.createElement("div");
			var flipper = document.createElement("div");
			var back = document.createElement("div");
			flipContainer.className = "flip-container";
			flipContainer.onclick = function(e) {
				var tag = e.target.tagName.toLowerCase();
				if ((tag != "a") && (tag != "i")) {this.classList.toggle("flip");}
				}
			flipper.className = "flipper";
			back.className = "back";
			back.textContent = "description of improvements would go here";
			tile.classList.toggle("front");
			flipper.appendChild(tile);
			flipper.appendChild(back);
			flipContainer.appendChild(flipper);
			tiles.appendChild(flipContainer);
			}
		else {
			tiles.appendChild(tile);
			}
		
		}  
	}

function pop(index) {
	if (!rbmap.checked) {
		rbmap.checked = true;
		toggle(rbmap);
		}
	showPopup(parkFeatures[index].id);
	}

function toggle(view) {
	main.style.display = "none";
	grid.style.display = "none";
	tiles.style.display = "none";
	switch (view.value) {
		case "map":
			main.style.display = "block";
			map.invalidateSize();
			break;
		case "grid":
			grid.style.display = "block";
			break;
		case "tiles":
			tiles.style.display = "flex";
			break;
		}
	}
		
function showPopup(id) {
	var thisLayer = allLayers.getLayer(id);
	var where = thisLayer.getBounds().getCenter();
	var zoom = map.getZoom();
	if (zoom < 15) {zoom = 15;};
	map.setView(where, zoom, {animation: true});
	thisLayer.openPopup(where);
	}
