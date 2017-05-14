var map;

// default coordinate is set to Fuente Circle
var defaultCoords = {lat: 10.31 , lng: 123.8938};

var restaurants = [];
var restaurantMarkers = [];
var startingCoords;
var isAllowedGeoLocation = false;

var directionsService;
var directionsDisplay;
var clickedMarker;
var currentMarker;
function initMap() {

	initializeMap(function(){
		initOtherData();
	});
} // end of initMap

function initializeMap(callback){
	var mapoptions = {
		center: defaultCoords,
		mapTypeControl: false,
		scaleControl: false,
		navigationControl: false,
		streetViewControl: false,
		zoomControl: false,
		mapTypeId: google.maps.MapTypeId.SATELLITE,
		zoom: 17
	};
	// map
	map = new google.maps.Map(document.getElementById("mapholder"), mapoptions);
	startingCoords = defaultCoords;

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var current_pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			startingCoords = current_pos;
			map.setCenter(current_pos);

			callback();
		}, function() {
			handleLocationError(true);
			callback();
		});
	} 
	else {
		// Browser doesn't support Geolocation
		handleLocationError(false);
	}
}

function initOtherData(){
	currentMarker = makeMarker( startingCoords, '<span class="map-icon map-icon-crosshairs"></span>', "Current Location");

	initializeRangeSlider();
	$('#js-rangeSlider-0').addClass('rangeSlider--disabled');
	createRestoNearby(200);
	plotRestaurants();
}

function handleLocationError(browserHasGeolocation) {
	console.log(browserHasGeolocation ?
		'Error: The Geolocation service failed.' :
		'Error: Your browser doesn\'t support geolocation.');

	$("#error-message").html('<div id="inner-message" class="alert alert-danger alert-dismissible"><label class="close" data-dismiss="alert" aria-label="close">&times;</label>' +
		'<span><strong>ERROR! </strong>' + (browserHasGeolocation ?
		'The Geolocation service failed.' :
		'Your browser doesn\'t support geolocation. </span></div>'));
	$("#error-message").show();
	
}// end of handleLocationError

function plotRestaurants(){
	directionsService = new google.maps.DirectionsService();
	directionsDisplay = new google.maps.DirectionsRenderer();

	$.getJSON("https://spreadsheets.google.com/feeds/list/1ArquM6xpu8r4pl1Iq221YumYPFMw2yuKjybzoIJUczg/1/public/values?alt=json", function(data) {
		//first row "title" column
		var FastfoodMarkersArr = [];
		var CasualDiningMarkersArr = [];
		var FineDiningMarkersArr = [];
		var BuffetsArr = [];
		var CoffeeshopArr = [];

		for (i = 0; i < data.feed.entry.length; i++) {
			restaurants.push({
				'name': data.feed.entry[i]['gsx$name']['$t'],
				'type': data.feed.entry[i]['gsx$type']['$t'],
				'no_seats': parseFloat(data.feed.entry[i]['gsx$noseats']['$t']),
				'specialty': data.feed.entry[i]['gsx$specialty']['$t'],
				'revenue_patron' : []
			});
			var marker = makeMarker(new google.maps.LatLng(data.feed.entry[i]['gsx$lat']['$t'], data.feed.entry[i]['gsx$lng']['$t']),
					'<span class="map-icon map-icon-restaurant"></span>',
					data.feed.entry[i]['gsx$name']['$t'],
					parseInt(data.feed.entry[i]['gsx$restoid']['$t']));

			addMarkerListener(marker);
			switch (data.feed.entry[i]['gsx$type']['$t']){
				case "Fastfood":
					FastfoodMarkersArr.push(marker);
					break;
				case "Casual dining":
					CasualDiningMarkersArr.push(marker);
					break;
				case "Fine dining":
					FineDiningMarkersArr.push(marker);
					break;
				case "Buffet":
					BuffetsArr.push(marker);
					break;
				case "Coffee shop":
					CoffeeshopArr.push(marker);
					break;
			}
		}
		restaurantMarkers.push({ "isvisible" : true, "restos": FastfoodMarkersArr});
		restaurantMarkers.push({ "isvisible" : true, "restos": CasualDiningMarkersArr});
		restaurantMarkers.push({ "isvisible" : true, "restos": FineDiningMarkersArr});
		restaurantMarkers.push({ "isvisible" : true, "restos": BuffetsArr});
		restaurantMarkers.push({ "isvisible" : true, "restos": CoffeeshopArr});
	}).done(function() {
		$.getJSON("https://spreadsheets.google.com/feeds/list/1ArquM6xpu8r4pl1Iq221YumYPFMw2yuKjybzoIJUczg/2/public/values?alt=json", function(data1) {
			var restoId = -1;

			for (i = 0; i < data1.feed.entry.length; i++) {
				var restoTempId = parseInt (data1.feed.entry[i]['gsx$restoid']['$t'],10);
				
				if(restoId != restoTempId){
					restoId = restoTempId;
				}
				var restoTemp = [new Date(data1.feed.entry[i]['gsx$date']['$t']),
					parseFloat(data1.feed.entry[i]['gsx$totalsales']['$t']),
					parseFloat(data1.feed.entry[i]['gsx$nopatrons']['$t'])];
				restaurants[restoId-1].revenue_patron.push(restoTemp);
			}
		}).done(function() {
			console.log("Data Retrieval done");
		});
	});
	

	
}
var clickedRestoId = -1;

var addMarkerListener = function (marker) {
	google.maps.event.addListener(marker, 'click', function (event) {
		clickedMarker = marker.getPosition();
		directionsDisplay.setMap(null);
		clickedRestoId = marker.restoId - 1;
		$(".resto-name").html(restaurants[clickedRestoId].name);
		$(".resto-specialty").html(restaurants[clickedRestoId].specialty);
		$("#mode-of-trans-panel").show();
		$(".resto_info").show();
		calculateAndDisplayRoute();
	});
}

function makeMarker(position, icon, title,restoId) {
	var marker = new Marker({
		position: position,
		title: title, 
		map: map,
		icon: {
		path: MAP_PIN,
		fillColor: '#1998F7',
		fillOpacity: 1,
		strokeColor: '',
		strokeWeight: 0
	},
	map_icon_label: icon
	}, restoId);
	return marker;
}

$(function() {
	$('#resto-analytics').bind('click', function (v) {		
		$("#filter-panel").show();
		google.charts.load('current', {'packages':['line', 'corechart']});
		google.charts.setOnLoadCallback(drawChart);
	});

	$('.filter-header > .close').bind('click', function (v) {		
		$("#filter-panel").hide();
	});
});


function drawChart() {

      var chartDiv = document.getElementById('chart_div');

      var data = new google.visualization.DataTable();
      data.addColumn('date', 'Daily');
      data.addColumn('number', "Revenue");
      data.addColumn('number', "Patrons");

      data.addRows(restaurants[clickedRestoId].revenue_patron);

      var materialOptions = {
        chart: {
          title: restaurants[clickedRestoId].name + ' Revenue vs Patrons'
        },
        width: 580,
        height: 300,
        series: {
          // Gives each series an axis name that matches the Y-axis below.
          0: {axis: 'Revenue'},
          1: {axis: 'Patrons'}
        },
        axes: {
          // Adds labels to each axis; they don't have to match the axis names.
          y: {
            Revenue: {label: 'Revenue (1000 PHP)'},
            Patrons: {label: 'Patrons'}
          }
        }
      };

      function drawMaterialChart() {
        var materialChart = new google.charts.Line(chartDiv);
        materialChart.draw(data, materialOptions);
      }

      drawMaterialChart();

    }