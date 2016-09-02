var app = app || {};

var LocList = [
  {
    name: 'Harkins Gateway Pavilions 18',
    coords: {lat: 33.4645, lng: -112.2792},
    description: 'A movie theater I used to visit.',
    category: 'recreation'
  },
  {
    name: "Rally's Camelback",
    coords: {lat: 33.5091, lng: -112.0909},
    description: 'Good burgers and fries.',
    category: 'food'
  },
  {
    name: "Glendale Community College",
    coords: {lat: 33.5708, lng: -112.1901},
    description: 'Get a world class education here.',
    category: 'education'
  },
  {
    name: "Arizona State University Tempe",
    coords: {lat: 33.4242, lng: -111.9281},
    description: 'Home of the Sun Devils.',
    category: 'education'
  },
  {
    name: "El Paisano Market",
    coords: {lat: 33.4164, lng: -111.9225},
    description: 'Amazing burritos in Tempe.',
    category: 'food'
  },
  {
    name: "Rio Vista Community Center",
    coords: {lat: 33.6152, lng: -112.2447},
    description: 'A nice park next to a river.',
    category: 'recreation'
  }
];

(function(app) {
  app.Location = function(data) {
    this.name = ko.observable(data.name);
    this.coords = ko.observable(data.coords);
    this.description = ko.observable(data.description);
    this.category = ko.observable(data.category);

    this.marker = null;
  };

  app.ViewModel = function() {
    var self = this;

    this.locList = ko.observableArray([]);
    this.filteredLocList = ko.observableArray([]);
    this.selectedLoc = ko.observable();
    this.selectedFilter = ko.observable();

    LocList.forEach(function(location) {
      var loc = new app.Location(location);
      var marker = app.addMarker(location);
      loc.marker = marker;
      self.locList.push(loc);
    });

    this.changeLocation = function(loc) {
      self.selectedLoc(loc);
      console.log("changed location to " + loc.name());
    };

    this.setFilter = function(filter) {
      self.selectedFilter(filter);
      console.log("changed filter to " + filter);
      self.filteredLocList.removeAll();
      self.locList().forEach(function(location) {
        location.marker.setMap(null);
        if (self.selectedFilter() === "all" || location.category() === self.selectedFilter()) {
          location.marker.setMap(app.Map);
          location.marker.setAnimation(google.maps.Animation.DROP);
          self.filteredLocList.push(location);
        }
      });
    };
  };

  ko.applyBindings(new app.ViewModel());
})(app);
