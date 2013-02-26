/**
 * The Location class holds the data for a particular Location on the campus. 
 * The Location class will provide the means to access and update the Location
 * data.
 * 
 * @param initialName
 * The name of the Location. Must be a string value.
 * @param initialCoordinate
 * The coordinates of the Location on Earth. Must be a Coordinate object.
 */
function Location(initialName, initialCoordinate)
{
    /*
     * Name is a required field, if it's not defined, default it to 
     * "<Location Name>"
     */
    var name = (!initialName || typeof initialName === "undefined") ? 
        "<Location Name>" : initialName;
    
    /*
     * Coordinate is a required field, if it's not defined or not a Coordinate
     * object, use a fresh Coordinate object - pointing to (0, 0) - instead.
     */
    
    var coordinate = null;
    
    /*
     * Coordinates are required for all Locations. If we don't have a valid 
     * one, create one with default values.
     */
    
    if (!initialCoordinate || typeof initialCoordinate === "undefined"
            || !(initialCoordinate instanceof Coordinate))
    {
        coordinate = new Coordinate();
    }
    
    // Otherwise, we have a valid coordinate, so just use it.
    
    else 
    {
        coordinate = initialCoordinate;
    }
     
    /*
     * Street address, city, and descriptions are optional fields, so default
     * them to null and let them get set later.
     */
    
    var streetAddress = null;
    var cityStateZip = null;
    var description = null;

    /**
     * Return's this Location as a Google Maps LatLng object.
     *
     * @return
     * This Location's Coordinate in LatLng form.
     */

    this.getMapCoordinate = function()
    {
        return new google.maps.LatLng(coordinate.getLatitude(), 
                coordinate.getLongitude());
    };

    /**
     * Returns the city where this location is found.
     * 
     * @return
     * A string containing the city that's home to the Location. 
     */
    this.getCityStateZip = function()
    {
        return cityStateZip;
    }
    
    /**
     * Returns the coordinates of the Location.
     * 
     * @return
     * A Coordinate object with the coordinates for the Location.
     */
    this.getCoordinate = function()
    {
        return coordinate;
    };
    
    /**
     * Returns a brief description of the Location if 1 is available.
     * 
     * @return
     * A string describing the Location.
     */
    this.getDescription = function()
    {
        return description;
    }
    
    /**
     * Returns the Location's name.
     * 
     * @return
     * The name of the Location.
     */
    this.getName = function() 
    {
        return name;
    };
    
    /**
     * Returns the Location's street address.
     * 
     * @return
     * The street address of the Location, if available.
     */
    this.getStreetAddress = function()
    {
        return streetAddress;
    };
    
    /**
     * Sets the street address of the Location to the given value.
     * 
     * @param newAddress
     * The new street address of the Location. The address will be converted to
     * a string.
     */
    this.setStreetAddress = function(newAddress)
    {        
        streetAddress = newAddress;
    };
    
    /**
     * Sets the Location's coordinates to the given value.
     * 
     * @param coordinate
     * A Coordinate object with data.
     */
    this.setCoordinate = function(newCoordinate)
    {
        /*
         * The new coordinates must be an initialized Coordinate object, 
         * otherwise, things break. If that's not the case, show the user an
         * error message. 
         */
        
        if (!newCoordinate || typeof newCoordinate === "undefined" 
            || !(newCoordinate instanceof Coordinate))
        {
            alert("Location coordinates must be an initialized Coordinate " 
                    + "object.");
        }
        
        // Otherwise the new Coordinate is fine, so update it.
        
        else
        {
            coordinate = newCoordinate;
        }
    };
    
    /**
     * Sets the city where this Location can be found to the given value.
     * 
     * @param newCityStateZip
     * The city, state, and zip code where the Location can be found.
     */
    this.setCityStateZip = function(newCityStateZip)
    {
        cityStateZip = newCityStateZip;
    }
    
    /**
     * Sets the Location's coordinates to the given latitude and longitude.
     * 
     * @param latitude
     * A numeric value representing the latitude of the Location.
     * @param longitude
     * A numeric value representing the longitude of the Location. 
     */
    this.setCoordinate = function(latitude, longitude)
    {
        /*
         * Since the Coordinate constructor can validate the given latitude 
         * and longitude, there's no need to do so here. Just use them to 
         * create a fresh Coordinate.
         */
        coordinate = new Coordinate(latitude, longitude);
    };
    
    /**
     * Sets the decription of the Location to the given value.
     * 
     * @param newDescription
     * The new description of the Location.
     */
    this.setDescription = function(newDescription)
    {
        description = newDescription;
    }
    
    /**
     * Sets the Location's name to the given value. The name must be a 
     * string with text in it.
     * 
     * @param name
     * The new name for the Location
     */
    this.setName = function(newName)
    {
        /*
         * Names are required fields, and must be strings. If this isn't the 
         * case, then the application will behave funny, so notify the user
         * to the problem.
         */
        
        if (!newName || typeof newName !== "string")
        {
            alert("Name is a required field that takes a string value.");
        }
        
        // Otherwise, the given name is fine, so update the Location name.
        
        else
        {
            name = newName;
        }
    };
}
