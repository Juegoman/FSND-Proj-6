var app = app || {};
//initialization and helper functions for the google map.
(function(app) {
  app.addMarker = function() {

  };
  app.initMap = function() {
    app.Map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 33.53, lng: -112.074},
      zoom: 11
    });

    app.addMarker = function(location) {
      var latlng = new google.maps.LatLng(location.coords().lat, location.coords().lng);
      var marker = new google.maps.Marker({
        position: latlng,
        map: app.Map,
        title: location.name()
      });
      return marker;
    };

    app.infoWindow = new google.maps.InfoWindow();

    app.mapLoaded();
  };
})(app);
