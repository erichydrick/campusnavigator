/** 
 * This file holds the functions used to validate form data, initiate the calls
 * to Google Maps to get directions, and 
 */

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

/**
 * Adds a destination text box to the navigation form in the application.
 */
function addLocation()
{
    waypointCtr++;

    var waypointParagraph = document.createElement("p");
    var waypointField = document.createElement("input");
    var waypointLabel = "Destination " + waypointCtr + ":";
    var waypointFieldID = "waypoint" + waypointCtr;
    
    waypointField.setAttribute("id", waypointFieldID);
    waypointField.setAttribute("name", "waypoints[]");
    waypointField.setAttribute("type", "text");

    initializeKeyHandlers(waypointField);

    waypointParagraph.innerHTML = waypointLabel;
    waypointParagraph.appendChild(waypointField);
    document.getElementById("extraLocations").appendChild(waypointParagraph);

    // Since we have waypoints, enable the "Remove Location button"
 
    document.getElementById("removeDestination").disabled = false;
    
    //writeLocations(waypointDivID);

    /*
     * The free version of the Google Maps API can't support more than 10 
     * locations, so disable the "Add Location" button if we reach 10 total 
     * locations (starting location + ending location + 8 waypoints)
     */

    if (waypointCtr >= WAYPOINT_MAX)
    {
        document.getElementById("addDestination").disabled = true;
    }
}

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
//function calculateDirections(startLocation, endLocation, waypoints)
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
    //if (waypoints && typeof waypoints !== undefined && waypoints.length > 0)
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
    // Enable the "Remove Location" button if any extra location was added.

    if (waypointCtr > 0)
    {
        document.getElementById("removeDestination").disabled = false;
    }

    /*
     * There's a maximum of 8 waypoints that can be added. If we have 
     * room for more, enable the "Add Destination" button.
     */

    if (waypointCtr < WAYPOINT_MAX)
    {
        document.getElementById("addDestination").disabled = false;
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
function processClick()
{
    hideSuggestions();
    locationList = [];

    // Make sure the marker-related lists are initialized.
    
    if (markers == null || typeof(markers) == "undefined")
    {
        markers = [];
    }
    if (markerListeners == null || typeof(markerListeners) == "undefined")
    {
        markerListeners = [];
    }

    var invalidLocations = [];

    var start = document.getElementById("startingLocation").value;
    var end = document.getElementById("endingLocation").value;

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

    // Otherwise, add our starting location

    else
    {
        locationList.push(startLocation)
    }

    invalidLocations = processWaypoints(invalidLocations);
//    locationList = waypointLists[0];
//    invalidLocations = waypointLists[1];

    // Add the ending location to the list of invalid locations if necessary.

    if (!endLocation)
    {
        invalidLocations.push(end);
    }

    // Otherwise, add our ending location
   
    else
    {
        locationList.push(endLocation)
    }

    // If the user screwed up any names, let them know.

    if (invalidLocations.length > 0)
    {
        var invalidList = "";

        // Build a list of the locations we coudn't find.

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
    
    //calculateDirections(startLocation, endLocation, waypoints);
    calculateDirections(locationList);
}

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

    document.getElementById("addDestination").disabled = true;
    document.getElementById("removeDestination").disabled = true;

    //waypoints = [];
    
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

    formWaypoints = document.locations.elements["waypoints[]"];
    var numWaypoints = 0;

    /*
     * When there's only 1 waypoint, the document just sends back the
     * select element rather than a NodeList. In that case, put the element
     * into an array and carry on. 
     */

    if (formWaypoints && !(formWaypoints instanceof NodeList))
    {
        formWaypoints = [formWaypoints];
        numWaypoints = formWaypoints.length;
    }

    /*
     * When there's already a list of waypoints, get that length. Make sure
     * there are actually waypoints listed first though.
     */

    else if (formWaypoints)
    {
        numWaypoints = formWaypoints.length;
    }

    /*
     * Add each of the extra locations to the list of waypoints so they can
     * be included in the directions.
     */

    for (var extraIndex = 0; extraIndex < numWaypoints; extraIndex++)
    {
        /* 
         * Because we're removing elements as we go, we always want the first
         * waypoint selection box.
         */

        var inputValue = formWaypoints[extraIndex].value;

        /*
         * Make sure the user entered something in the extra location combo 
         * box before adding the map point to the waypoint list.
         */

        
        if (inputValue && typeof inputValue !== undefined 
                && inputValue.length > 0)
        {
            waypointLocation = getLocation(inputValue);
            
            // Only process valid locations.

            if (waypointLocation)
            {
                
                // Add the location to the list of waypoints in the route.
                
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
        }
    }

    /*
     * If any of the waypoints were bad, stop processing the waypoints so the
     * user can fix them.
     */

    if (invalidLocations.length > 0)
    {
        enableAddRemoveDestination();

        //return [waypoints, invalidLocations];
        return invalidLocations;
    }

    /*
     * Remove the waypoint elements and re-add the fields with values in them.
     * This will clean up optional waypoints left blank by the user (which 
     * technically aren't wrong per se, as they aren't required in the first 
     * place).
     */

    var parentDiv = document.getElementById("extraLocations");

    while (parentDiv.children !== undefined && parentDiv.children.length > 0)
    {
        parentDiv.removeChild(parentDiv.children[0]);
    }

    waypointCtr = 0;
    
    // Manually add the waypoints with data back.

    for (waypointCtr; waypointCtr < selectedWaypoints.length; )
    {
        addLocation();
        var waypointFieldID = "waypoint" + waypointCtr;

        document.getElementById(waypointFieldID).value = selectedWaypoints[waypointCtr - 1];
    }

    enableAddRemoveDestination();

    //return [waypoints, invalidLocations];
    return invalidLocations;
}

function removeLocation()
{
    var parentDiv = document.getElementById("extraLocations");
    
    var numChildren = parentDiv.children.length;
    var waypointDiv = parentDiv.children[numChildren - 1];
    
    parentDiv.removeChild(waypointDiv); 
    
    waypointCtr--;

    /*
     * If there are no waypoints left, disable the "Remove Destination" button 
     * since it's useless at this point.
     */
    
    if (waypointCtr <= 0)
    {
        document.getElementById("removeDestination").disabled = true;
    }

    /*
     * Since we just removed a waypoint, we're guaranteed to be under waypoint
     * cap, so make sure the "Add Destination" button is enabled.
     */

    document.getElementById("addDestination").disabled = false;
}

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
    // If there are any Location info windows open, close them.
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

        /*
         * Create the starting and ending markers for the map. We're using 
         * the default Google maps icons for this to keep them consistent
         * with the icons in the directions.
         */
      
        /*startMarker = setMarker(startMarker, startMarkerListener,
                result.routes[0].legs[0].start_location, locations[0]);
        
        endMarker = setMarker(endMarker, endMarkerListener, 
                result.routes[0].legs[0].end_location, 
                locations[locations.length - 1]);*/

        setMarkers(result, display.getRouteIndex());
    }
    
    // Otherwise, show the user an error message.
    
    else
    {
        alert("Error getting directions, server returned: " + status);
    }
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
    // Remove any existing markers

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

    // Now that all the markers are cleared, create a fresh list of markers.

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
