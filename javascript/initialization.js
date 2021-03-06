/* 
 * This file holds the Javascript code to initialize the maps and form data.
 */

$(function() {

    // Used to set up the initial Google map
    var center;
    var map;

    // Provided via XML configuration files
    var allowMultipleRoutes;
    var city;
    var locations;

    var display;

    // Location, marker, and info window data
    var locationList;
    var markers;
    var markerListeners;

    // End location information and marker data.
    var endInfoWindow;
    var endLocation;
    var endMarker;
    var endMarkerListener;

    // Start location information and marker data.
    var startInfoWindow;
    var startLocation;
    var startMarker;
    var startMarkerListener;

    // Information for optional waypoints users can add.
    var waypointCtr = 0;
    var waypoints;
    var WAYPOINT_MAX = 8;

    // Suggestion list variables
    var current;
    var suggestionList;
    var suggestions;

    /*
    * Create some trim() functions in the String class to use for cleaning up XML
    * parsing.
    */
    String.prototype.trim = function() 
    {
        return this.replace(/^\s+|\s+$/g,"");
    }

    String.prototype.ltrim = function() 
    {
        return this.replace(/^\s+/,"");
    }

    String.prototype.rtrim = function() 
    {
        return this.replace(/\s+$/,"");
    }

    /**
     * Adds a destination text box to the navigation form in the application.
     */
    $("#addDestination").click(function() {
       
        waypointCtr++;

        var id = "waypoint" + waypointCtr;
        var label = $("<label></label>")
            .attr("for", id)
            .text("Destination " + waypointCtr);
        var field = $("<select></select>")
            .attr("id", id)
            .attr("name", id);
        var div = $("<div></div>")
            .addClass("form-group");


        $(div).append(label).append(field);
        $("#extraLocations").append(div);

        $(field).select2({data: window.locationData});

        enableAddRemoveDestination();

        return false;
    });

    /**
    * Adds a click listener for the given marker that pops up an info window 
    * with details on the location designated by the marker.
    *
    * @param curLocation
    * The Location where the marker is displayed
    * @param marker
    * The marker to add a click listener for.
    */
    function addMarkerListener(curLocation, marker)
    {
        // Create a click listener that opens an info window when clicked.
    
        var listener = google.maps.event.addListener(marker, "click", 
                function() {
                    var fullStreetAddress = null;
                    
                    /*
                    * Make sure we have street address and city/state/zip values
                    * before passing the data on to the info window. Otherwise, 
                    * we get address that read "null, null", which isn't very 
                    * good.
                    */
                    
                    if (curLocation.getStreetAddress() && 
                            curLocation.getCityStateZip())
                    {
                        fullStreetAddress = curLocation.getStreetAddress() +
                                ", " + curLocation.getCityStateZip();
                    }
                    
                    createInfoWindow(marker, fullStreetAddress, 
                            curLocation.getDescription());
                }
        );

        markerListeners.push(listener);
    }

    /**
     * Takes the given starting and ending location names, figures out the 
     * associated coordinates for each, and calls Google Maps to calculate the 
     * walking directions between them.
     * 
     *  @param startLocation
     *  The starting Location.
     *  @param endLocation
     *  The ending Location.
     *  @param waypoints
     *  An array holding the list of waypoints to visit along the route.
     */
    function calculateDirections(locations)
    {
        // Initializes the directions request to send to Google Maps.
        var directionsRequest = 
        {
            destination: locationList[locationList.length - 1].getMapCoordinate(),
            origin: locationList[0].getMapCoordinate(),
            provideRouteAlternatives: allowMultipleRoutes,
            travelMode: google.maps.TravelMode.WALKING
        };

        // Include waypoints if the user added them.
        if (locations.length > 2)
        {
            var waypoints = [];
            
            /*
             * Create a waypoint list with all of the waypoints so Google Maps 
             * can include them in the directions
             */
            for (var waypointCtr = 1; waypointCtr < locations.length - 1; 
                    waypointCtr++)
            {
                waypoints.push({
                    location: locations[waypointCtr].getMapCoordinate(),
                    stopover: true
                });
            }

            directionsRequest["waypoints"] = waypoints;
        }
    
        var directionsService = new google.maps.DirectionsService();
        directionsService.route(directionsRequest, renderDirections);

        return false;
    }

    /**
     * Creates an information window for the given marker with the given location
     * name as the content.
     * 
     * @param marker
     * The marker to create the information window for.
     * @param address
     * The street for the Location.
     * @param description 
     * A string description of the Location the marker is denoting. 
     */
    function createInfoWindow(marker, address, description)
    {
        var infoWindow = new google.maps.InfoWindow();
        var content = "<center>\n\t<p><b>" + marker.getTitle() + "</b></p>\n";
        
        /*
         * Descriptions and addresses are optional, so check to make sure we have
         * something for them before we add them to the info window.
         */
        if (description && typeof description !== "undefined" 
                && description.length > 0)
        {
            content += "\t<p>" + description + "</p>\n";
        }
        
        if (address && typeof address !== "undefined" && address.length > 0)
        {
            content += "\t<p>" + address + "</p>\n";
        }
        
        content += "</center>";
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
        
        /*
         * We can tell which info window we're setting by the marker this info 
         * window is being attached to. Unfortunately, we can't just pass info 
         * window references (probably due to this being called via an anonymous 
         * function but I'm not entirely sure), because the references don't ever
         * make it back to the calling function. As a result, we're using the 
         * marker to derive the global info window we're creating.
         */
        if (marker === startMarker)
        {
            startInfoWindow = infoWindow;
        }
        
        else if (marker === endMarker)
        {
            endInfoWindow = infoWindow;
        }
        
        return infoWindow;
    }

    /**
     * Re-enables the Add/Remove Destination buttons as needed.
     */
    function enableAddRemoveDestination()
    {

        /* 
         * Enable the "Remove Location" button if there are any waypoints,
         * disable it otherwise.
         */
        if (waypointCtr > 0)
        {
            
            $("#removeDestination").prop("disabled", false);

        } else {

            $("#removeDestination").prop("disabled", true);
        
        }

        /*
         * There's a maximum of 8 waypoints that can be added. If we have 
         * room for more, enable the "Add Destination" button, otherwise
         * disable it.
         */
        if (waypointCtr < WAYPOINT_MAX)
        {
            
            $("#addDestination").prop("disabled", false);

        } else {

            $("#addDestination").prop("disabled", true);

        }
    }

    /**
     * Returns the Location object with the given name.
     *
     * @param name
     * The name of the Location to retrieve.
     *
     * @return
     * The Location object with the given name.
     */
    function getLocation(name)
    {
        return locations[name.toLowerCase()];
    }

    /**
     * Loads the map on the page.
     */
    function loadScript() 
    {
        var script = $("<script></script>")
            .attr("src", "http://maps.googleapis.com/maps/api/js?" +
                "sensor=false&callback=initialize")
            .attr("type", "text/javascript");

        $("body").append(script);
    }

    /**
     * Calls the Google maps maximum zoom service to make sure the zoom level at
     * the center of the amp isn't greater than the maximum zoom possible. 
     */
    function maxZoom()
    {
        var maxZoomService = new google.maps.MaxZoomService();
        
        var maxZoom = maxZoomService.getMaxZoomAtLatLng(map.getCenter(), 
            updateZoom)
    }

    /**
     * Parses the given data from the configuration.xml file.
     * 
     * @param configXML
     * The configuration XMl file data. This currently holds the center latitude
     * and longitude, as well as the city the campus is located in.
     */
    function parseConfiguration(configXML)
    {
        /*
         * Although "allowMultipleRoutes" is a boolean in the XML, once it's read
         * in by the JavaScript, it's treated as a string. To make it into an
         * honest-to-goodness boolean, I had to compare the value in the XML to the
         * word "true" (converting the XML data to all lowercase to account for
         * capitalization variations). 
         */
        var allowMultipleRoutesTag = 
            configXML.getElementsByTagName("allowMultipleRoutes")[0];
        allowMultipleRoutes = allowMultipleRoutesTag.childNodes[0].nodeValue;
        allowMultipleRoutes = allowMultipleRoutes.toLowerCase() === "true";

        var centerTag = configXML.getElementsByTagName("center");
        
        var latitudeTag = centerTag[0].getElementsByTagName(
            "latitude")[0].childNodes[0].nodeValue;
        var longitudeTag = centerTag[0].getElementsByTagName(
            "longitude")[0].childNodes[0].nodeValue;
        
        /*
         * Use the values in the <latitude> and <longitude> tags to set the initial
         * center point of the map.
         */
        
        center = new Coordinate(latitudeTag.trim(), 
            longitudeTag.trim());
        
        /* Set up the map options */        
        var mapOptions = {
            zoom: 17,
            center: new google.maps.LatLng(center.getLatitude(), 
                center.getLongitude()),
            mapTypeId: google.maps.MapTypeId.HYBRID
        };
        
        map = new google.maps.Map(document.getElementById('map_canvas'),
            mapOptions);
    
        google.maps.event.addListener(map, "zoom_changed", maxZoom);
        google.maps.event.trigger(map, "zoom_changed");
        
        /* We have a map, we can enable the "Get directions" button. */
        $("#addDestination").prop("disabled", false);
        $("#directions").prop("disabled", false);
        $("#switch").prop("disabled", false);
    }

    /**
     * Parses the given data from the locations.xml file to build the list of 
     * locations supported by the application.
     * 
     * @param locXML
     * The locations.xml data. 
     */
    function parseLocations(locXML)
    {
        locations = [];
        window.locationData = [];

        var tags = locXML.getElementsByTagName("location");
        
        for (var num = 0; num < tags.length; num++)
        {
            var name = 
                tags[num].getElementsByTagName("name")[0].childNodes[0].nodeValue;
            name = name.ltrim();
            name = name.rtrim();
            
            var coordTag = tags[num].getElementsByTagName("coordinates");
                    
            var latitude = coordTag[0].getElementsByTagName(
                "latitude")[0].childNodes[0].nodeValue;
            latitude = latitude.trim();
                    
            var longitude = coordTag[0].getElementsByTagName(
                "longitude")[0].childNodes[0].nodeValue;
            longitude = longitude.trim();

            var coordinate = new Coordinate(latitude, longitude); 

            var xmlLocation = new Location(name, coordinate);

            var streetAddressElement = 
                tags[num].getElementsByTagName("street");
            
            /*
             * Street addresses are optional, make sure 1 exists before adding it 
             * to the Location.
             */
            if (streetAddressElement 
                && typeof streetAddressElement !== "undefined"
                && streetAddressElement.length > 0)
            {
                var streetAddress = streetAddressElement[0]
                    .childNodes[0].nodeValue;
                streetAddress = streetAddress.ltrim();
                streetAddress = streetAddress.rtrim();
                
                xmlLocation.setStreetAddress(streetAddress);
            }
            
            var cityElements = tags[num].getElementsByTagName("cityStateZip");
            
            /*
             * Cities are optional, make sure we have 1 in the XML before adding
             * it to the Location.
             */
            if (cityElements && typeof cityElements !== "undefined"
                    && cityElements.length > 0)
            {
                city = cityElements[0].childNodes[0].nodeValue;
                city = city.ltrim();
                city = city.rtrim();
                
                xmlLocation.setCityStateZip(city);
            } 
            
            var descriptionElements = 
                tags[num].getElementsByTagName("description");
            
            /*
             * Descriptions are optional, make sure the file has one before 
             * adding it to the Location.
             */
            if (descriptionElements 
                && typeof descriptionElements !== "undefined"
                && descriptionElements.length > 0)
            {
                description = descriptionElements[0].childNodes[0].nodeValue;
                description = description.ltrim();
                description = description.rtrim();
                
                xmlLocation.setDescription(description);
            }
            
            /* Add the Location to the list of Locations we have on campus. */
            locations[name.toLowerCase()] = xmlLocation;
            window.locationData.push({id: name.toLowerCase(), text: name});
        }
   
        $("select").select2({data: window.locationData});
        $("#startingLocation").prop("disabled", false);
        $("#endingLocation").prop("disabled", false);
    }

    /**
     * Verifies that the user entered both a starting and ending 
     * location before submitting the data for directions.
     * 
     * @param start
     * The name of the starting location.
     * @param end
     * The name of the ending location.
     * 
     * @return
     * True if the given locations have a value, false otherwise.
     */
    $("#directions").click(function() {
        
        locationList = [];

        /* Make sure the marker-related lists are initialized. */
        if (markers == null || typeof(markers) == "undefined")
        {
            markers = [];
        }

        if (markerListeners == null || typeof(markerListeners) == "undefined")
        {
            markerListeners = [];
        }

        var invalidLocations = [];

        var start = $("#startingLocation").val();
        var end = $("#endingLocation").val();

        /*
         * If the user didn't enter both a starting and ending 
         * location, show an error message to the user and quit the function.
         */
        if ((start === undefined || start.length === 0)
            || (end === undefined || end.length === 0))
        {
            alert("Both a starting and ending location are required.");
            return;
        }
    
        var startLocation = getLocation(start);
        var endLocation = getLocation(end);
    
        /*
         * Add the starting location to the list of invalid locations if 
         * necessary.
         */
        if (!startLocation)
        {
            invalidLocations.push(start);
        }

        /* Otherwise, add our starting location. */
        else
        {
            locationList.push(startLocation)
        }

        invalidLocations = processWaypoints(invalidLocations);

        /* Add the ending location to the list of invalid locations if necessary. */
        if (!endLocation)
        {
            invalidLocations.push(end);
        }

        /* Otherwise, add our ending location */
        else
        {
            locationList.push(endLocation)
        }

        /* If the user screwed up any names, let them know. */
        if (invalidLocations.length > 0)
        {
            var invalidList = "";

            /* Build a list of the locations we coudn't find. */
            for (var locNum = 0; locNum < invalidLocations.length; locNum++)
            {
                invalidList += invalidLocations[locNum] + "\n";
            }
        
            alert("The following locations couldn't be found. Please check your "
                    + "location names and spellings and try again:\n" 
                    + invalidList);

            return;
        }

        /*
         * If the validation passed, get directions between the starting and 
         * ending locations the user entered.
         */
        calculateDirections(locationList);

        return false;
    });

    /**
     * Process any waypoints the user added to their route information.
     *
     * @param invalidLocations
     * A list of locations whose names can't be found.
     *
     * @return 
     * A list of the waypoints that will be included in the directions and a list
     * of invaid locations.
     */
    function processWaypoints(invalidLocations)
    {
        /*
         * Disable both the "Add Destination" and "Remove Destination" buttons.
         * We'll re-enable the ones we need when we're done.
         */
        $("#addDestination").prop("disabled", true);
        $("#removeDestination").prop("disabled", true);

        /*
         * To clear out any added locations that weren't populated, we're going to 
         * remove all the extra destinations and add back all the populated ones.
         * This list will hold the stuff to put back.
         */
        var selectedWaypoints = [];

        /*
         * Iterate through the extra Locations the user added to navigation panel.
         * If the user selected a Location from the combo box, add the Location's
         * map point to a list of waypoints.
         */
        formWaypoints = $("#extraLocations select");
        var numWaypoints = formWaypoints.length;

        /*
         * Add each of the extra locations to the list of waypoints so they can
         * be included in the directions.
         */
        $.each(formWaypoints, function(index, waypoint) {
            /* 
             * Because we're removing elements as we go, we always want the first
             * waypoint selection box.
             */
            var inputValue = waypoint.value;

            /*
             * Make sure the user entered something in the extra location combo 
             * box before adding the map point to the waypoint list.
             */            
            if (inputValue && typeof inputValue !== undefined 
                && inputValue.length > 0)
            {
                waypointLocation = getLocation(inputValue);
                
                /* Only process valid locations. */
                if (waypointLocation)
                {
                    
                    /* Add the location to the list of waypoints in the route. */
                    locationList.push(waypointLocation);
                    selectedWaypoints.push(waypointLocation.getName());

                }

                /*
                 * Otherwise, add the name of the invalid location to the list we'll 
                 * show the user.
                 */
                else
                {
                    invalidLocations.push(inputValue);
                }
            } else {
                $(waypoint).remove();
            }
        });

        enableAddRemoveDestination();

        return invalidLocations;
    }

    $("#removeDestination").click(function() {
        var parentDiv = $("#extraLocations");
        
        var numChildren = $(parentDiv).children().length;
        var waypointDiv = $(parentDiv).children()[numChildren - 1];
        
        $(waypointDiv).remove(); 
        
        waypointCtr--;

        enableAddRemoveDestination();

        return false;
    });

    /**
     * Renders the walking directions in the browser.
     * 
     * @param result
     * The walking directions
     * @param status
     * The status of the request to get directions.
     */
    function renderDirections(result, status)
    {
        /* If there are any Location info windows open, close them. */
        if (startInfoWindow)
        {
            startInfoWindow.close();
        }
        
        if (endInfoWindow)
        {
            endInfoWindow.close();
        }
       
        /*
         * If the status indicates a successful for request for directions, display
         * the directions in the browser.
         */     
        if (status === google.maps.DirectionsStatus.OK)
        {

            /*
             * If the directions renderer hasn't been initialized, initialize it
             * and set the panel that holds the step-by-step directions and map to
             * display the directions on.
             */
            if (!display)
            {
                var rendererOptions = {
                    "suppressMarkers": true
                };

                display = new google.maps.DirectionsRenderer(rendererOptions);
                display.setPanel(document.getElementById("nav_canvas"));
            }
            
            display.setDirections(result);
            display.setMap(map);

            setMarkers(result, display.getRouteIndex());
        }
        
        /* Otherwise, show the user an error message. */
        else
        {
            alert("Error getting directions, server returned: " + status);
        }

        return false;
    }

    /**
     * Sets the given custom marker at the given location. If the marker hasn't 
     * already been initialized, create a marker at the given location, with the 
     * given icon, and with a title equal to the given location name. If the marker
     * has been initialized, move it to the given coordinate and set the title to 
     * the given location name.
     * 
     * @return
     * A list with all the markers, and marker listeners for the current route.
     */
    function setMarkers(result, routeIndex)
    {
        /* Remove any existing markers. */
        if (markers)
        {
            /*
             * The only way to remove a marker from the map is to set the map 
             * property of each individual marker to null.
             */
            for (var ctr = 0; ctr < markers.length; ctr++)
            {
                /*
                 * Make sure there's a marker in this cell before clearing its
                 * map.
                 */             
                if (markers[ctr])
                {
                    markers[ctr].setMap(null);
                    google.maps.event.clearListeners(markers[ctr], "click");
                }
            }
        }

        /* Now that all the markers are cleared, create a fresh list of markers. */
        markers = [];
        
        var route = result.routes[routeIndex];
        var legsLength = route.legs.length;

        /*
         * Every location needs a marker. Also set up the associated click 
         * listeners and info windows.
         */
        for (var legNum = 0; legNum < legsLength; legNum++)
        {
            var curLocation = locationList[legNum];
            
            var markerOptions = {
                clickable: true,
                draggable: false,
                icon: "icons/marker_" + (legNum + 1) + ".png",
                map: map,
                position: route.legs[legNum].start_location,
                title: curLocation.getName()
            };

            var marker = new google.maps.Marker(markerOptions);
            markers.push(marker);

            
            addMarkerListener(curLocation, marker); 

            /*
             * The list of items in the leg list is 1 short of the list of items 
             * in the location list. So, when we reach the last of the legs, grab 
             * the end location from the legs list and create the marker and info
             * window for it (it's the ending location for the directions).
             */
            if (legNum == legsLength - 1)
            {
                curLocation = locationList[legNum + 1];
                
                markerOptions = {
                    clickable: true,
                    draggable: false,
                    icon: "icons/marker_" + (legNum + 2) + ".png",
                    map: map,
                    position: route.legs[legNum].end_location,
                    title: curLocation.getName()
                };

                var marker = new google.maps.Marker(markerOptions);

                markers.push(marker);

                addMarkerListener(curLocation, marker); 
            }
        }
    }

    /**
     * Switches the current values in the starting and ending location combo boxes.
     */
    $("#switch").click(function() {

        var currentStart = $("#startingLocation").val();
        var currentEnd = $("#endingLocation").val();
        
        $("#startingLocation").val(currentEnd).trigger("change");
        $("#endingLocation").val(currentStart).trigger("change");

        return false;
    });

    /**
     * Updates the zoom level of the map if it was zoomed in more than the maximum
     * level at the center point.
     * 
     * @param response
     * The MaxZoomService response
     */
    function updateZoom(response)
    {
    
        /*
         * If the map's zoom is greater than the maximum possible zoom, adjust the 
         * zoom level of the map to the maximum zoom level.
         */
        
        if (response.zoom < map.getZoom())
        {
            map.setZoom(response.zoom);
        }
    }

    /**
     * Parses the XML document with location information to get the list of 
     * locations campus navigator can support.
     */
    window.initialize = function() 
    {
        /*
         * If the user is running an unsupported browser, show them an error 
         * dialog.
         */
        if (!window.XMLHttpRequest)
        {
            alert("You are using an unsupported browser. Please use an updated " 
                + "version of your Internet browser.");
            return;
        }
        
        var xmlhttpConfig = new XMLHttpRequest();
    
        $.get("configuration/configuration.xml")
            .done(parseConfiguration)
            .fail(function() {
                alert("Error getting application configuration data!");
            });  
       
        $.get("configuration/locations.xml")
            .done(parseLocations)
            .fail(function() {
                alert("Error getting location data!");
            });
    }

    loadScript();

});
