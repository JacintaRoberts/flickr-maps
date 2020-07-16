// Initialise the map
function initMap() {
    let centerControlDiv = document.createElement('div');
    centerControlDiv.index = 1;

    // Create Map
    let map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(0,0),
        zoom: 2
    });
    generateMap(map, photos);  
}

// Generate Map markers and run functions
function generateMap(map, photos) {
    // Get the map to client side
    getMap(map);

    // Instantiate a marker array and directions service.
    var directionsService = new google.maps.DirectionsService;
    var markers = [];
    
    // Create a renderer for directions and bind it to the map.
    var directionsRenderer = new google.maps.DirectionsRenderer({map: map});

    // Instantiate an info window to hold step text for directions
    var stepDisplay = new google.maps.InfoWindow;

    // Add the markers to the map
    var markerArray = [];
    customMarkers = getCustomMarker();
    try {
        customMarkers[0].setMap(map);
    } catch {
        // do nothing
    }
    addMarkers(map, markers, photos, directionsRenderer, directionsService, markerArray, stepDisplay, customMarkers);

    // Get the markers
    getMarkers(markers);
    getMarkersArray(markerArray);
    // Fit the map window to the markers
    fitMapToMarkers(map, markers);    
}

// Fits the map to the markers
function fitMapToMarkers(map, markers) {
    if (markers.length >= 1) {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markers.length; i++) {
            bounds.extend(markers[i].getPosition());
        }
        map.fitBounds(bounds);
        }
}


// Add the markers to the map.
function addMarkers(map, markers, photos, directionsRenderer, directionsService, markerArray, stepDisplay) {
    for (let i = 0; i < photos.length; i++) {
        photo = photos[i];
        // Create the image link and content from photo object
        imageLink = `<a href="${photo.webURL}"><img alt="${photo.title}" src="${photo.photoURL}"/></a>`;
        let imageContent = '<div id="image_content">' + imageLink + '</div>';
        let sideBarContent = `<div id="sidebar_content"><h3>My Selected Image</h3><br>` + imageLink +
        `<hr><u><b>Title:</b></u> ${photo.title}` +
        `<br><b><u>Date:</b></u> ${photo.datetaken}` +
        `<br><b><u>Owner:</b></u> ${photo.ownername}` +
        `<br><a href="${photo.webURL}">Click here to view on Flickr</a>`+
        `<br>` +
        `<input type="submit" value="Get Directions" id="directionsSubmit">` +
        `<br><u><b>Description:</b></u> ${photo.description._content}` +
        `<br><b><u>Tags:</b></u> ${photo.tags}` +
        `</div>`;

        // Create a new marker position using the Google Maps API.
        let lat = photo.latitude;
        let long = photo.longitude;
        let myLatlngMarker = new google.maps.LatLng(lat,long);

        // Create a new marker using the Google Maps API, and assigns the marker to the map created below.
        let marker = new google.maps.Marker({
            position: myLatlngMarker,
            map: map
        });

        // Create a new info window to store the content (image and link) using the Google Maps API
        let infowindow = new google.maps.InfoWindow({
            position: myLatlngMarker,
            content: imageContent
        });

        // Open info window when cursor is over the marker
        marker.addListener('mouseover', function() {
            infowindow.open(map,marker);
        });

        // Close info window when cursor is not over the marker
        marker.addListener('mouseout', function() {
            infowindow.close(map,marker);
        });

        // Place content in sidebar when marker clicked
        marker.addListener('click', function() {
            document.getElementById('userguide').style.display="none";
            document.getElementById('selected').innerHTML=sideBarContent;
           // Get directions when directions button is clicked
            var onClickHandler = function() {
                calculateAndDisplayRoute(directionsRenderer, directionsService, marker, markers, markerArray, stepDisplay, map);
            };
            if ( typeof(document.getElementById('directionsSubmit')) !== "undefined" && document.getElementById('directionsSubmit') !== null ){
                document.getElementById('directionsSubmit').addEventListener('click', onClickHandler);
            }
        });
        markers.push(marker);   
    }
}


// Location error handler
function handleLocationError(map) {
    // Alert user
    alert("Geolocation error: Please select your location with the marker");
    // Create max 1 instance of the custom, draggable marker
    if (typeof customMarkers !== 'undefined') {
        for (var i = 0; i < customMarkers.length; i++) {
            customMarkers[i].setMap(null);
        }
    }
    customMarkers = [];
    let myLatlng = map.getCenter();
    // Place a draggable marker on the map
    var customMarker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        draggable:true,
    });

    customMarker.setMap(map);
    // Instantiate an info window to hold step text.
    let dragDisplay = new google.maps.InfoWindow;
    dragDisplay.setContent("Drag me to your location!");
    dragDisplay.open(map, customMarker);  

    // Add event listener to update the lat and lng hidden forms based upon position
    customMarker.addListener('mouseup', function() {
        document.getElementById("lat").value = customMarker.getPosition().lat();
        document.getElementById("lng").value = customMarker.getPosition().lng();
    });
    customMarkers.push(customMarker);
    getCustomMarker(customMarkers);
};

// Try HTML5 geolocation.
function GetGeolocation(map) {
    try {
        if ( document.getElementById('local').checked === true ){
            var infoWindow = new google.maps.InfoWindow();
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    let pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    // Set coordinates of 'location found' infowindow
                    infoWindow.setPosition(pos);
                    infoWindow.setContent('You are here!');
                    infoWindow.open(map);
                    map.setCenter(pos);
                    map.setZoom(10);
                    document.getElementById("local").addEventListener("click", function(){
                        infoWindow.close(map);
                    });
                    document.getElementById("lat").value = pos.lat;
                    document.getElementById("lng").value = pos.lng;
                }, function() {
                    // Browser doesn't support Geolocation
                    return handleLocationError(map);
                });
            }
        } else {
            map.setCenter({lat:0,lng:0}); // Reset to global view
            map.setZoom(2);
            
            // If previous infoWindow exists, close it
            if (typeof infoWindow !== "undefined")
            {
                infoWindow.close(map);
            }
            
            // Set latitude and longitude back to empty
            if ( typeof customMarker !== 'undefined') {
                document.getElementById("lat").value = customMarker.getPosition().lat();
                document.getElementById("lng").value = customMarker.getPosition().lng();
            }
            else {
                document.getElementById("lat").value = '';
                document.getElementById("lng").value = '';
            }
        }
    } catch {
        alert("No photos were found!");
    }
};

// Remove all markers - except for the custom location
function removeAllMarkers(markers, markerArray){
    // First, remove any existing markers from the map.
    for (var i = 0; i < markerArray.length; i++) {
        markerArray[i].setMap(null);
    }
    
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

// Calculate and display the route
function calculateAndDisplayRoute(directionsRenderer, directionsService, marker, markers, markerArray, stepDisplay, map) {
    // First, remove any existing markers from the map.
    removeAllMarkers(markers, markerArray);
    var myLatlngMarker = new google.maps.LatLng(lat,lng);
    // Retrieve the start and end locations and create a DirectionsRequest using Walking directions
    directionsService.route({
        origin: myLatlngMarker,
        destination: marker.position,
        travelMode: 'WALKING'
    }, function(response, status) {
        // Route the directions and pass the response to a function to create markers for each step.
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
            showSteps(response, markerArray, stepDisplay, map);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
};


function showSteps(directionResult, markerArray, stepDisplay, map) {
  // For each step, place a marker, and add the text to the marker's infowindow.
  // Also attach the marker to an array so we can keep track of it and remove it
  // when calculating new routes.
  var myRoute = directionResult.routes[0].legs[0];
  for (var i = 0; i < myRoute.steps.length; i++) {
    var marker = markerArray[i] = markerArray[i] || new google.maps.Marker;
    marker.setMap(map);
    marker.setPosition(myRoute.steps[i].start_location);
    attachInstructionText(
        stepDisplay, marker, myRoute.steps[i].instructions, map);
  }
}

function attachInstructionText(stepDisplay, marker, text, map) {
  google.maps.event.addListener(marker, 'mouseover', function() {
    // Open an info window when the marker is clicked on, containing the text
    // of the step.
    stepDisplay.setContent(text);
    stepDisplay.open(map, marker);
  });
  google.maps.event.addListener(marker, 'mouseout', function() {
    // Open an info window when the marker is clicked on, containing the text
    // of the step.
    stepDisplay.close(map, marker);
  });
}