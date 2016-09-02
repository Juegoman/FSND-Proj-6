$(document).ready(function() {
    var sidebarButton = $('#sidebar-btn');
    sidebarButton.on('click', function(e) {
      if ($(".sidebar").hasClass("expanded")) {
        sidebarButton.text(">");
        $(".sidebar-btn-label").addClass("hidden");
        $("div.filter-container").addClass("hidden");
        $("div.list-container").addClass("hidden");
        $(".sidebar").css("width", "5%").removeClass("expanded");
        $(".map").css("width", "95%").removeClass("sidebar-expanded");
      } else {
        sidebarButton.text("<");
        $(".sidebar-btn-label").removeClass("hidden");
        $("div.filter-container").removeClass("hidden");
        $("div.list-container").removeClass("hidden");
        $(".sidebar").css("width", "30%").addClass("expanded");
        $(".map").css("width", "70%").addClass("sidebar-expanded");
      }
    });
});
