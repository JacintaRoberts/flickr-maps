// Helper function to get a reference to the map.
function getMap(theMap) {
    map = theMap;
}

// Helper function to get a reference to the initial markers.
function getMarkers(theMarkers) {
    markers = theMarkers;
}

// Helper function to get a reference to the custom markers.
function getCustomMarker(theCustomMarker) {
    customMarkers = theCustomMarker;
}

// Helper function to get a reference to the destination markers.
function getMarkersArray(theMarkerArray) {
    markerArray = theMarkerArray;
}

// Add event listens on load of the page
window.onload = function() {
    if ( photos.length == 0 ){
        alert("No photos were found for your search parameters!");
    }

    // If the 'search near me' slider is toggled, clear markers
    document.getElementById('local').addEventListener('click', function() {
        GetGeolocation(map);
        try {
            removeAllMarkers(markers, markerArray);
        }
        catch {
            // do nothing
        }
    });
    
    // Handle submit button
    document.getElementById('tagsBoxSubmit').addEventListener('click', function() {
        let tags = document.getElementById('tagsBox').value;
        let username = document.getElementById('usernameBox').value;
        let lat = document.getElementById('lat').value;
        let lng = document.getElementById('lng').value;
        // Alert the user to pass in some search parameters
        if ( tags == '' && username == '' && lat == '' && lng == '' ) {
            alert("Please enter some search parameters!");
        } else {
            // Clear markers and prepare to load the map
            if ( typeof markers !== 'undefined') {
                removeAllMarkers(markers, markerArray);
            }
        }
    });
}