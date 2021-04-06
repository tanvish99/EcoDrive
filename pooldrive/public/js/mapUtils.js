var map, infoWindow, currentPosition, markers = [];



function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 31.2001, lng: 29.9187},
        zoom: 8 ,
        gestureHandling: 'greedy' //Pan on mobile using 1 finger.

    });
    // var mark = localStorage.getItem("mark");
    // var location = mark.formatted_address;
    // var lat1 = mark.geometry.location.A;
    // var long1 = mark.geometry.location.F;
    // var lat1 = mark.geometry.location.A;
    // var long1 = mark.geometry.location.F;
    var lat1 = 15.999;
    var long1 = 75.000;
    var marker = new google.maps.Marker({
    position: {lat:15.3676, lng: 75.1399},
    map: map,
    title: 'sun ray solar museum hubli-Rider!',
    // icon: pin.png,
    animation: google.maps.Animation.BOUNCE,
    //draggable: true
  });
    var marker1 = new google.maps.Marker({
    position: {lat: 15.3828, lng: 75.1181},
    map: map,
    title: 'sri nagar hubli-rider!',
    animation: google.maps.Animation.BOUNCE,
    //icon: images/pin.png?raw=true
    //draggable: true
  });
    var marker = new google.maps.Marker({
    position: {lat: 15.4589, lng: 75.0078},
    map: map,
    title: 'Dharwad rider!',
    //icon: 'D:\erkab-web-app-master/pin.png',
    animation: google.maps.Animation.BOUNCE,
    //draggable: true
  });

    var marker = new google.maps.Marker({
    position: {lat: lat1, lng: long1},
    map: map,
    title: 'Hubli Driver!',
    //icon: 'D:\erkab-web-app-master/pin.png',
    animation: google.maps.Animation.BOUNCE,
    //draggable: true
  });




 var geocoder = new google.maps.Geocoder();
 
        var address = localStorage.getItem("mark");
        geocoder.geocode({'address': address}, function(results, status) {
          
            //map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
              map: map,
              position: results[0].geometry.location,
              animation: google.maps.Animation.BOUNCE
            });
          });
 







    infoWindow = new google.maps.InfoWindow();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            currentPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            window.currentPositionMarker = new google.maps.Marker({
                position: new google.maps.LatLng(currentPosition),
                map: window.location.pathname === '/request' ? null : map
            });
            map.setCenter(currentPosition);
            map.setZoom(14);
        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

function clearMarkers() {
    markers.forEach(function (marker) {
        marker.setMap(null);
    });
    markers = [];
}


function addMarker (coords) {
    markers.push(new google.maps.Marker({
        position: new google.maps.LatLng(coords[1], coords[0]),
        map: null
    }));
}

function setMarker (index, map) {
    if(index != null) {
        markers[index].setMap(map);
    }
}