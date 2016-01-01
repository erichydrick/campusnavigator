/* 
 * This file holds the Javascript code to initialize the maps and form data.
 */

// Used to set up the initial Google map

var center;
var map;

// Provided via XML configuration files

var allowMultipleRoutes;
var city;
var locationNames;
var locations;

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
 * Prompts the user with a list of possible locations based on what they've 
 * typed in.
 *
 * @param suggestionList
 * The list of suggested locations.
 * @param textBox
 * The text box to suggest values for.
 */
function autosuggest(list, textBox)
{
    // Show the suggestion list if there's location names in it.

    if (list && list.length > 0)
    {
        showSuggestions(list, textBox);
    }

    // Empty lists are useless, hide them.

    else
    {
        hideSuggestions();
    }
}

/** 
 * Creates the drop down box with suggested locations.
 *
 * @param textBox 
 * The text box to suggest locations for.
 */
function createDropDown(textBox)
{
    // Initialize the drop down div if we haven't already.

    if (!suggestions)
    {
        suggestions = document.createElement("div");
        suggestions.setAttribute("id", "suggestions");
    }

    suggestions.className = "suggestions";
    suggestions.style.visibility = "hidden";
    suggestions.style.width = textBox.offsetWidth;

    document.body.appendChild(suggestions);

    // Highlight whatever suggestion the user has their mouse over.
    
    suggestions.onmouseover = function(evt)
    {
        evt = evt || window.event;
        target = evt.target || evt.srcElement;

        highlightSuggestion(target);
    }

    /*
     * Bring focus to the text box when the user starts pressing down with 
     * the mouse.
     */

    suggestions.onmousedown = function(evt)
    {
        textBox.focus();
    }

    /*
     * When the user releases the mouse on an element in the suggestion box,
     * replace the text in the text box with the suggestion and remove the 
     * suggestion box.
     */

    suggestions.onmouseup = function(evt)
    {
        evt = evt || window.event;
        target = evt.target || evt.srcElement;

        textBox.value = target.firstChild.nodeValue;
        hideSuggestions();
    }
}

/**
 * Calculates how far from the left-hand margin the suggestion box should be
 * and returns that value.
 *
 * @param textBox 
 * The text box to suggest for.
 * @return
 * How far from the left-hand margin the suggestion box should start.
 */
function getLeft(textBox)
{
    var node = textBox;
    var left = 0;

    /*
     * Starting with the text box and working our way to the start of the page content.
     */

    while (node.tagName.toLowerCase() !== "body")
    {
        left += node.offsetLeft;
        node = node.offsetParent;
    }

    return left;
}

/**
 * Calculates how far from the topmost margin the suggestion box should be
 * and returns that value.
 *
 * @param textBox 
 * The text box to suggest for.
 * @return
 * How far from the top-most margin the suggestion box should start.
 */
function getTop(textBox)
{
    var node = textBox;
    var upper = 0;

    /*
     * Starting with the text box and working our way to the start of the 
     * page content.
     */

    while (node.tagName.toLowerCase() !== "body")
    {
        upper += node.offsetTop;
        node = node.offsetParent;
    }

    return upper;
}


/**
 * Moves the selection to whatever the user chose.
 *
 * @param diff
 * Whether the user went up or down the list.
 * @param textBox
 * The text box with the suggestion list attached.
 */
function goToSuggestion(diff, textBox)
{
    // Don't bother going to a suggestion if there's no suggestions.

    if (suggestionList.length <= 0)
    {
        return;
    }

    var suggestionNodes = suggestions.childNodes;

    /*
     * If the currently selected suggestion hasn't been given an initial
     * value, initialize it to -1 so it won't try to select anything in the 
     * list.
     */

    if (isNaN(current))
    {
        current = diff > 0 ? -1 : 0;
    }

    // Don't try to navigate suggestions without a list of nodes.

    if (suggestionNodes.length > 0)
    {
        var node = null;

        // Go down the list, wrapping to the top after the last element.

        if (diff > 0)
        {
            // Go to the next element when there is a next element.

            if (current < suggestionNodes.length - 1)
            {
                node = suggestionNodes[++current];
            }

            // Otherwise, highlight the first item.

            else
            {
                current = 0;
                node = suggestionNodes[current];
            }
        }

        // Go up the list, wrapping to the bottom after the first element.

        else if (diff < 0)
        {
            // Jump to the bottom of the list when we're at the first element.

            if (current === 0)
            {
                current = suggestionNodes.length - 1;
                node = suggestionNodes[current];
            }

            // Otherwise, move up 1.

            else
            {
                node = suggestionNodes[--current];
            }
        }
    }

    // Don't highlight unless we chose a new location.

    if (node)
    {
        highlightSuggestion(node);
        textBox.value = node.firstChild.nodeValue;
        suggestions.style.visibility = "visible";
    }
}

/**
 * Processes when the user presses down on a key.
 *
 * @param evt 
 * The event that triggered the function call.
 * @param textBox
 * The text box the user is typing into.
 */
function handleKeyDown(evt, textBox)
{
    createDropDown(textBox);
    var userText = textBox.value;

    switch(evt.keyCode)
    {
        case 38:
            // This means the user hit the up arrow.
            goToSuggestion(-1, textBox);
            break;
        case 40:
            // This means the user hit the down arrow.
            goToSuggestion(1, textBox);
            break;
        case 27:
            // This means the user hit escape.
            textBox.value = userText;
            current = undefined;
            hideSuggestions();
        case 13:
        case 9:
            // This means the user hit enter or tab. 

            if (!isNaN(current) && current >= 0 
                    && current < suggestionList.length)
            {
                textBox.value = suggestionList[current];
            }

            hideSuggestions();
            current = undefined;

            break;
        default:
            break;
    }
}

/**
 * Hides the list of suggestions.
 */
function hideSuggestions()
{
    // Don't try to hide the suggestions div if it's not there.

    if (suggestions)
    {
        suggestionDiv = document.getElementById("suggestions");
        suggestionDiv.parentElement.removeChild(suggestionDiv);
        suggestions.style.visibility = "hidden";
        suggestionList = [];
        suggestions = null;
    }
}

/**
 * Highlights the current suggestion and clears the highlight from previous 
 * suggested locations.
 *
 * @param suggestedLocation
 * The currently suggested location.
 */
function highlightSuggestion(suggestedLocation)
{
    /* 
     * Go through every element in the suggestion list and clear the 
     * highlight from what was already highlighed and highlight the 
     * current selection.
     */
    for (var suggested = 0; suggested < suggestions.childNodes.length; 
            suggested++)
    {
        var node = suggestions.childNodes[suggested];

        // If the current node is the current suggestion, highlight it.

        if (node === suggestedLocation)
        {
            node.className = "current";
        }

        // Or if the current node is already highlighted, remove the highlight.

        else if (node.className === "current")
        {
            node.className = "";
        }
    }
}

/**
 * Parses the XML document with location information to get the list of 
 * locations campus navigator can support.
 */
function initialize() 
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
 
    /*
     * Development note: Since we're just retrieving data from the server, 
     * we're using GET. However, because GET caches results, changes to 
     * configuration files aren't picked up immediately. If you need to edit
     * configuration data, it's recommended you change the HTTP method to 
     * POST to get current data every time you load the application. Just 
     * remember to change it back before committing changes. 
     */

    // Get the configuration XML data.
    
    xmlhttpConfig.open("GET", "configuration/configuration.xml", true);
    
    /*
     * When the configuration XML data is retrieved, hand it off to the 
     * appropriate function for parsing.
     */
    
    xmlhttpConfig.onreadystatechange = function()
        {
            // If the AJAX call was is done, parse the configuration.xml file.
            
            if (xmlhttpConfig.readyState === 4 && xmlhttpConfig.status === 200)
            {
                parseConfiguration(xmlhttpConfig.responseXML);
            }
        }
    
    xmlhttpConfig.send();    
    
    var xmlhttpLoc = new XMLHttpRequest();
    xmlhttpLoc.open("GET", "configuration/locations.xml", true);
    
    /*
     * When the configuration XML data is retrieved, hand it off to the 
     * appropriate function for parsing.
     */
    
    xmlhttpLoc.onreadystatechange = function()
    {
        // If the AJAX call was is done, parse the locations.xml file.
        
        if (xmlhttpLoc.readyState === 4 && xmlhttpLoc.status === 200)
        {
            parseLocations(xmlhttpLoc.responseXML);
        }
    }
    
    xmlhttpLoc.send();
}

/**
 * Creates the key handlers for the given text box. This will handle 
 * populating the auto-suggestion boxes and navigating the auto-suggestion
 * boxes.
 *
 * @param textBox
 * The text box to set up key handlers for.
 */
function initializeKeyHandlers(textBox)
{
    textBox.onkeyup = function(evt)
        {
            var keyCode = evt.keyCode;

            // Ignore navigation and function keys.
            
            if ((keyCode < 32 && keyCode != 8) 
                    || (keyCode >= 33 && keyCode <= 46) 
                    || (keyCode >= 112 && keyCode <= 123))
            {
                // DO NOTHING
            }

            // Since we know this is text data, process it.

            else
            {
                suggestionList = lookupLocations(textBox.value);
                autosuggest(suggestionList, textBox);
            }
        };
    textBox.onkeydown = function(evt)
        {
            evt = evt || window.event;
            handleKeyDown(evt, textBox);
        };
}

/**
 * Loads the map.
 */
function loadScript() 
{
    var script = document.createElement('script');

    script.type = 'text/javascript';
    script.src = 'http://maps.googleapis.com/maps/api/js?sensor=false&' +
        'callback=initialize';

    document.body.appendChild(script);
}

/**
 * Looks up all location names that have the text the user entered and returns 
 * a list with just those location names.
 *
 * @param evt
 * The keyup event that triggered this function call.
 * @param text
 * The text the user entered.
 *
 * @return
 * A list of suggested locations matching what the user typed.
 */
function lookupLocations(text)
{
    // Don't do anything if there's no text in the field.

    if (!text)
    {
        return;
    }

    var suggestedLocations = [];
    var userValue = text.toLowerCase();

    /* 
     * Check each location name and see if it contains the text the
     * user entered. If it does, add the name to the list of selected 
     * locations.
     */
    for (var index = 0; index < locationNames.length; index++)
    {
        var currentLocation = locationNames[index].toLowerCase();

        /*
         * If the current location name has the text the user typed in
         * it anywhere, add it to the list of selected locations.
         */
        if (currentLocation.indexOf(userValue) !== -1)
        {
            suggestedLocations.push(locationNames[index]);
        }
    }


    return suggestedLocations;
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
    
    // Set up the map options
    
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
    
    // We have a map, we can enable the "Get directions" button. 
    
    document.getElementById("addDestination").disabled = false;
    document.getElementById("directions").disabled = false;
    document.getElementById("switch").disabled = false;
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
    // locationNames will be used for suggestions in the auto-complete code.
    locationNames = [];
    locations = [];
    
    var tags = locXML.getElementsByTagName("location");
    
    for (var num = 0; num < tags.length; num++)
    {
        var name = 
            tags[num].getElementsByTagName("name")[0].childNodes[0].nodeValue;
        name = name.ltrim();
        name = name.rtrim();
        
        locationNames.push(name);

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
            var streetAddress = 
                streetAddressElement[0].childNodes[0].nodeValue;
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
        
        // Add the Location to the list of Locations we have on campus.
        
        locations[name.toLowerCase()] = xmlLocation;
    }
   
    locationNames.sort();

    var startTextBox = document.getElementById("startingLocation");
    initializeKeyHandlers(startTextBox);

    var endTextBox = document.getElementById("endingLocation");
    initializeKeyHandlers(endTextBox);

    // We have locations, so we can enable the text fields.
      
    var elem =  document.getElementById("startingLocation");
    
    document.getElementById("startingLocation").disabled = false;
    document.getElementById("endingLocation").disabled = false;
}

/**
 * Shows the suggestion list under the given text box.
 *
 * @param list
 * The list of suggestions to display.
 * @param textBox
 * The text box to show the list under.
 */
function showSuggestions(list, textBox)
{
    var div = null;

    if (!suggestions)
    {
        suggestions = document.createElement("div");
        suggestions.setAttribute("id", "suggestions");
    }

    suggestions.innerHTML = "";

    for (var index = 0; index < list.length; index++)
    {
        div = document.createElement("div");
        div.appendChild(document.createTextNode(list[index]));
        suggestions.appendChild(div);
    }

    suggestions.style.left = getLeft(textBox) + "px";
    suggestions.style.top = (getTop(textBox) + textBox.offsetHeight) + "px";
    suggestions.style.visibility = "visible";

    current = 0;
    highlightSuggestion(suggestions.children[0]);
}

/**
 * Switches the current values in the starting and ending location combo boxes.
 */
function switchLocations()
{
    var currentStart = document.getElementById("startingLocation").value;
    var currentEnd = document.getElementById("endingLocation").value;
    
    document.getElementById("startingLocation").value = currentEnd;
    document.getElementById("endingLocation").value = currentStart;
}

window.onload = loadScript;
