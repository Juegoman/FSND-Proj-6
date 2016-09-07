var app = app || {};

//list of locations.
var LocList = [
  {
    name: 'Harkins Gateway Pavilions 18',
    coords: {lat: 33.4645, lng: -112.2792},
    description: 'A movie theater I used to visit.',
    category: 'recreation'
  },
  {
    name: "Rally's Burgers",
    coords: {lat: 33.5091, lng: -112.0909},
    description: 'Good burgers and fries.',
    category: 'food'
  },
  {
    name: "Glendale Community College (Arizona)",
    coords: {lat: 33.5708, lng: -112.1901},
    description: 'Get a world class education here.',
    category: 'education'
  },
  {
    name: "Arizona State University",
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
  //Foursquare client id and client secret
  app.FRSQ_CID = 'FZSJJKJ5WDHLHR2CSL5RJG3XK4CZTI4OQ3OE5FLHO4XCTB4M';
  app.FRSQ_SEC = 'SSMWU1PC2YJXYBMVKYMRE5GCOE33T5HLN1VMIGPWYJIHQDUL';

  app.googleLoaded = false;

  //object to represent a location
  app.Location = function(data) {
    this.name = ko.observable(data.name);
    this.coords = ko.observable(data.coords);
    this.description = ko.observable(data.description);
    this.category = ko.observable(data.category);

    //create the marker for the current location and add it to the location object if the Google Map successfully loaded.
    if (app.googleLoaded) {
      this.marker = app.addMarker(this);
    }
  };
  //ViewModel object
  app.ViewModel = function() {
    var self = this;

    this.locList = ko.observableArray([]);
    this.filteredLocList = ko.observableArray([]);
    this.selectedLoc = ko.observable();
    this.selectedFilter = ko.observable();

    //observables for the expanding sidebar
    this.sidebarExpanded = ko.observable(false);
    this.sidebarBtnTxt = ko.pureComputed(function() {
      if (self.sidebarExpanded()) return '<';
      else return '>';
    });

    //initialize the list of Locations
    LocList.forEach(function(location) {
      var loc = new app.Location(location, self);
      if (app.googleLoaded) {
          loc.marker.addListener('click', function(data) {
          self.changeLocation(loc);
        });
      }
      self.locList.push(loc);
    });

    //handler for changing the selected location.
    this.changeLocation = function(loc) {
      //clean up if the Google Map successfully loaded.
      if (app.googleLoaded) {
        app.infoWindow.close();
        if (self.selectedLoc()) self.selectedLoc().marker.setAnimation(null);
      }
      //set the new location
      self.selectedLoc(loc);
      //animate the marker and open the infoWindow if the Google Map successfully loaded.
      if (app.googleLoaded && self.selectedLoc()) {
        //make the selected location's marker bounce and open the infoWindow on the marker.
        self.selectedLoc().marker.setAnimation(google.maps.Animation.BOUNCE);
        app.setInfoWindow(loc).open(app.Map, self.selectedLoc().marker);
        setTimeout(function() {
          self.selectedLoc().marker.setAnimation(null);
        }, 2100);
      } else if (self.selectedLoc()) {
        //otherwise just open information about the selected location.
        app.setInfoWindow(loc);
      }
    };

    //handler for changing the filter
    this.setFilter = function(filter) {
      //clean up
      if (app.googleLoaded) app.infoWindow.close();
      self.selectedLoc(null);
      //set the filter
      self.selectedFilter(filter);
      //reset the filtered location list
      self.filteredLocList.removeAll();
      self.locList().forEach(function(location) {
        if (app.googleLoaded) location.marker.setVisible(false);
        if (self.selectedFilter() === "all" || location.category() === self.selectedFilter()) {
          if (app.googleLoaded) {
            location.marker.setVisible(true);
            location.marker.setAnimation(google.maps.Animation.DROP);
          }
          self.filteredLocList.push(location);
        }
      });
    };

    //handler for expanding the sidebar
    this.expandSidebar = function() {
      self.sidebarExpanded(!self.sidebarExpanded());
    };
  };
  //helper function for handling the populating of infoWindow data with AJAX calls
  app.setInfoWindow = function(location) {
    //base case: the category of the location is invalid
    var contentStr = '<em>Loading...</em>';
    var url = '';
    //check if the location should be queried on Foursquare
    if (location.category() === 'food' || location.category() === 'recreation') {
      //call Foursquare API for info
      url = 'https://api.foursquare.com/v2/venues/search' +
            '?client_id=' + app.FRSQ_CID +
            '&client_secret=' + app.FRSQ_SEC +
            '&v=20160101&m=foursquare' +
            '&ll=' + location.coords().lat + ',' + location.coords().lng +
            '&query=' + location.name().replace(' ', '+') +
            '&limit=1&intent=browse&radius=1000';
      var venueID = '';

      $.ajax(url, {
        dataType: "json",
        success: function(data) {
          //get the id of the place referenced and make another more specific call
          venueID = data.response.venues[0].id;

          url = 'https://api.foursquare.com/v2/venues/' + venueID +
                '?client_id=' + app.FRSQ_CID +
                '&client_secret=' + app.FRSQ_SEC +
                '&v=20160101&m=foursquare';
          var venueName = null, venueUrl = null, venDescription = null, rating = null, imgUrl = null;

          $.ajax(url, {
            dataType: "json",
            success: function(data) {
              var venue = data.response.venue;
              venueName = venue.name;
              if (venue.canonicalUrl) venueUrl = venue.canonicalUrl + '?ref=' + app.FRSQ_CID;
              if (venue.description) venDescription = venue.description;
              if (venue.rating) rating = venue.rating;
              if (venue.bestPhoto) imgUrl = venue.bestPhoto.prefix + '300x200' + venue.bestPhoto.suffix;

              //build the info window based on information that is present.
              contentStr = '' +
              '<div class="info-window">' +
                '<a href="' + venueUrl + '" class="place-url">' +
                  '<h3 class="place-name">' + venueName + '</h3>' +
                '</a>' +
                '<p class="place-info">';

              if (rating) contentStr = contentStr + '<em class="rating">' + rating + '/10' + '</em><br><br><em class="my-description">' + location.description() + '</em><br><br>';

              if (venDescription) contentStr = contentStr + venDescription;
              contentStr = contentStr + '</p>';

              if (imgUrl) contentStr = contentStr + '<img class="place-img" src="' + imgUrl + '">';
              contentStr = contentStr + '<em>provided by Foursquare</em></div>';
              //apply the now downloaded content
              app.applyInfoWindow(contentStr);
            },
            error: function(e) {
              //apply the error
              contentStr = '<em>Error recovering API information: invalid ID returned.</em>';
              console.error(e);
              app.applyInfoWindow(contentStr);
            }
          });
        },
        error: function(e) {
          //apply the error
          console.error(e);
          contentStr = '<em>Error recovering API information: invalid ID returned.</em>';
          app.applyInfoWindow(contentStr);
        }
      });
    } else if (location.category() === 'education') {
      //call wiki API for info
      var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exchars=200&titles=' + location.name();

      var extract = null;
      var articleUrl = 'https://en.wikipedia.org/wiki/' + location.name().replace(' ', '_');
      var streetViewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=300x200&location=' + location.coords().lat + ',' + location.coords().lng;
      $.ajax(wikiUrl, {
        dataType: "jsonp",
        success: function(data) {
          //the key for the article is unknown, so it is found by looping through the one key present and storing it.
          var page = [];
          for (var k in data.query.pages) if (data.query.pages.hasOwnProperty(k)) page.push(k);
          extract = data.query.pages[page[0]].extract;

          //build the content
          contentStr = '' +
          '<div class="info-window">' +
            '<a href="' + articleUrl + '" class="place-url">' +
              '<h3 class="place-name">' + location.name() + '</h3>' +
            '</a>' +
            '<p class="place-info">' +
              '<em class="my-description">' + location.description() + '</em><br><br>' +
              extract +
            '</p>' +
            '<img class="place-img" src="' + streetViewUrl + '">' +
            '<em>provided by Wikipedia and Google StreetView</em>' +
          '</div>';

          //apply the content
          app.applyInfoWindow(contentStr);
        },
        error: function(e) {
          //apply the error.
          console.error(e);
          contentStr = '<em>Error recovering API information: Query error.</em>';
          app.applyInfoWindow(contentStr);
        }
      });
    } else {
      console.error("Invalid Category.");
      contentStr = '<em>Error recovering API information: Invalid category.</em>';
      app.applyInfoWindow(contentStr);
    }
    //Add the base message to the infoWindow.
    app.applyInfoWindow(contentStr);
    if (app.googleLoaded) return app.infoWindow;
  };

  app.applyInfoWindow = function(content) {
    if (app.googleLoaded) {
      app.infoWindow.setContent(content);
    } else {
      $('#map').html('').append(content);
    }
  };

  app.mapLoaded = function() {
    app.googleLoaded = true;
    ko.applyBindings(new app.ViewModel());
  };

  app.googleError = function() {
    console.error("Failed to download Google Maps API.");
    ko.applyBindings(new app.ViewModel());
  };
})(app);
