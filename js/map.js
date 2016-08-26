var app = app || {};
(function() {
  app.initMap = function() {
    app.Map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 33.448, lng: -112.074},
      zoom: 11
    });
  };
})();
