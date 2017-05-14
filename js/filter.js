var circleNearby = null;
var distanceFromCurrent = 0;
var countResto = 0;
var isNearby = false;
var selectedMode = "DRIVING";

$(function() {
	$('.checkbox-resto-type').bind('change', function (v) {
		var restoTypeId = parseInt( $(this).attr("value"),10);
		if($(this).is(':checked')) {
			showMarkers(restoTypeId);
		} else {
			clearMarkers(restoTypeId);
		}

		clearRestaurantInfosAndDirections();
	});

	$('.checkbox-resto-nearby').bind('change', function (v) {
		console.log("checkbox-resto-nearby");
		var restoTypeId = parseInt( $(this).attr("value"),10);
		if($(this).is(':checked')) {
			circleNearby.setMap(map);
			isNearby = true;
			showNearbyMarkers(true);
			$('#js-rangeSlider-0').removeClass('rangeSlider--disabled');			
			$(".no-of-resto").show();
		} else {			
			circleNearby.setMap(null);
			isNearby = false;
			showNearbyMarkers(false);
			countResto = 0;
			$('#js-rangeSlider-0').addClass('rangeSlider--disabled');
			$(".no-of-resto").hide();
		}
		clearRestaurantInfosAndDirections();
	});



	$(".nav li a").bind('click', function(e){
		$(".nav .active").removeClass('active');
		selectedMode = $(this).parent().attr('class');
		$(this).parent().addClass('active'); 
		e.preventDefault();
		calculateAndDisplayRoute();
	});


	$('#btnSelectAll').bind('click', function (v) {
		$('#btnSelectAll').addClass('disabled');
		$('#btnDeselectAll').removeClass('disabled');
		$('.checkbox-resto-type').prop('checked', true);
		showAllMarkers();
	});

	$('#btnDeselectAll').bind('click', function (v) {
		$('#btnDeselectAll').addClass('disabled');
		$('#btnSelectAll').removeClass('disabled');
		$('.checkbox-resto-type').prop('checked', false);
		clearAllMarkers();
	});

});

var initializeRangeSlider = function () {

        var selector = '[data-rangeSlider]',
                elements = document.querySelectorAll(selector);

        // Example functionality to demonstrate a value feedback
        function valueOutput(element) {
            var value = element.value;

			distanceFromCurrent = parseInt((value * 100),10);
            if(circleNearby != null){
            	circleNearby.setRadius(distanceFromCurrent);
            }
            
            $(".checkbox-resto-nearby").siblings('span').html("Show restaurants within <strong>"+ distanceFromCurrent +" M </strong> radius.");
        }

        for (var i = elements.length - 1; i >= 0; i--) {
            valueOutput(elements[i]);
        }

        Array.prototype.slice.call(document.querySelectorAll('input[type="range"]')).forEach(function (el) {
            el.addEventListener('input', function (e) {
                valueOutput(e.target);
            }, false);
        });


        // Basic rangeSlider initialization
        rangeSlider.create(elements, {
            min: 1,
            max: 30,
            value : 2,
            borderRadius : 3,
            buffer : 0,
            minEventInterval : 1000,

			// Callback function
            onInit: function () {},
            // Callback function
            onSlideStart: function (value, percent, position) {},
            // Callback function
            onSlide: function (value, percent, position) {},
            // Callback function
            onSlideEnd: function (value, percent, position) {
            	if(circleNearby != null){
            		showNearbyMarkers(true);
            	}
            }
        });

    };

function clearMarkers(restoTypeId) {
	for( var i = 0; i < restaurantMarkers[restoTypeId].restos.length ; i++ ) {
		restaurantMarkers[restoTypeId].restos[i].setMap(null);
	}
	restaurantMarkers[restoTypeId].isvisible = false;
}

function showMarkers(restoTypeId) {
	for( var i = 0; i < restaurantMarkers[restoTypeId].restos.length ; i++ ) {
		var valDistance = google.maps.geometry.spherical.computeDistanceBetween(currentMarker.getPosition(), restaurantMarkers[restoTypeId].restos[i].getPosition());
		if(!isNearby){
			restaurantMarkers[restoTypeId].restos[i].setMap(map);
		}
		else if(isNearby && valDistance < distanceFromCurrent){
			restaurantMarkers[restoTypeId].restos[i].setMap(map);
			countResto++;
		}
		else{
			restaurantMarkers[restoTypeId].restos[i].setMap(null);
		}
	}
	restaurantMarkers[restoTypeId].isvisible = true;
}

function clearAllMarkers() {
	for(var j = 0; j < restaurantMarkers.length; j++){
		if(restaurantMarkers[j].isvisible){
			clearMarkers(j);
		}
	}
	clearRestaurantInfosAndDirections();
}

function showAllMarkers() {
	for(var j = 0; j < restaurantMarkers.length; j++){
		if(!restaurantMarkers[j].isvisible){
			showMarkers(j,false);
		}
	}
	clearRestaurantInfosAndDirections();
}

function showNearbyMarkers(isNearby) {
	countResto = 0;
	isNearby = isNearby;
	for(j = 0; j < restaurantMarkers.length; j++){
		if(restaurantMarkers[j].isvisible){
			showMarkers(j);
		}
	}
	$(".no-of-resto").html("No. of nearby restaurants : " + countResto);
	clearRestaurantInfosAndDirections();
}

function clearRestaurantInfosAndDirections(){
	$("#filter-panel").hide();
	$("#mode-of-trans-panel").hide();
	$(".resto_info").hide();
	directionsDisplay.setMap(null);
}

function createRestoNearby(value){
// Add circle overlay and bind to marker
	circleNearby = new google.maps.Circle({
	  map: map,
	  radius: value,    
	  strokeColor: '#1998F7',
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: '#1998F7',
		fillOpacity: 0.2
	});
	circleNearby.bindTo('center', currentMarker, 'position');
	circleNearby.setMap(null);
} // end of showNearRestaurants

function calculateAndDisplayRoute() {
	directionsService.route({
		origin: startingCoords,
		destination: clickedMarker,
		travelMode: google.maps.TravelMode[selectedMode]
	}, function(response, status) {
		if (status === 'OK') {
			directionsDisplay.setMap(map);
			directionsDisplay.setOptions( { suppressMarkers: true } );
			$("#error-message").hide();
			directionsDisplay.setDirections(response);
			
		} else {
			$("#error-message").html('<div id="inner-message" class="alert alert-danger alert-dismissible"><label class="close" data-dismiss="alert" aria-label="close">&times;</label>'
				+ '<span><strong>Warning!</strong> Directions request failed due to ' + status + '</span></div>');
			$("#error-message").show();
			directionsDisplay.setMap(null);
			console.log('Directions request failed due to ' + status);
		}
	});
}

