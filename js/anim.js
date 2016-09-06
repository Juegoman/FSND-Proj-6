//click handler for the expand button on the sidebar

$(document).ready(function() {
    var sidebarButton = $('#sidebar-btn');
    sidebarButton.on('click', function(e) {
      if ($(".sidebar").hasClass("expanded")) {
        sidebarButton.text(">");
        $(".sidebar-btn-label").addClass("hidden");
        $("div.filter-container").addClass("hidden");
        $("div.list-container").addClass("hidden");
        $(".sidebar").removeClass("expanded");
        $(".map").removeClass("sidebar-expanded");
      } else {
        sidebarButton.text("<");
        $(".sidebar-btn-label").removeClass("hidden");
        $("div.filter-container").removeClass("hidden");
        $("div.list-container").removeClass("hidden");
        $(".sidebar").addClass("expanded");
        $(".map").addClass("sidebar-expanded");
      }
    });
});
