/**
 * The Coordinate class represents a latitude/longitude coordinate on the 
 * Earth. It will hold latitude/longitude values and provide the means for 
 * accessing and modifying their values. If a latitude or longitude value 
 * isn't supplied when initializing the Coordinate, they will default to an
 * initial value of 0.
 * 
 * @param initialLatitude
 * The starting latitude value of the Coordinate.
 * @param initialLongitude
 * The starting longitude value of the Coordinate.
 */
function Coordinate(initialLatitude, initialLongitude)
{
    /*
     * Latitude and longitude are required fields. If either of them doesn't 
     * have a value, just use "0" as a placeholder.
     */
    
    var latitude = (!initialLatitude) ? 0 : initialLatitude;
    var longitude = (!initialLongitude) ? 0 : initialLongitude;
    
    /**
     * Returns the Coordinate's latitude value.
     * 
     * @return
     * The latitude of the Coordinate.
     */
    this.getLatitude = function()
    {
        return latitude;
    };

    /**
     * Returns the Coordinate's longitude value.
     */
    this.getLongitude = function()
    {
        return longitude;
    };
    
    /**
     * Sets the latitude to the the given value.
     * 
     * @param newLatitude
     * The new latitude of the Coordinate. It must be a numeric value.
     */
    this.setLatitude = function(newLatitude)
    {
        /*
         * Latitudes are numeric values. If the value we're given isn't 
         * numeric, things will break. Show the user an error message 
         * informing them that the new latitude has to be a number.
         */
        
        if (!newLatitude || typeof newLatitude !== "number" 
                || isNaN(newLatitude))
        {
            alert("Latitude values must be numeric.");
        }
        
        // Otherwise, the new latitude value is fine, so update the latitude.
        
        else
        {
            latitude = newLatitude;
        }
    };
    
    /**
     * Sets the longitude to the given value.
     * 
     * @param newLongitude
     * The new longitude of the Coordinate. It must be a numeric value.
     */
    this.setLongitude = function(newLongitude)
    {
        /*
         * Longitudes are numeric values. If the value we're given isn't 
         * numeric, things will break. Show the user an error message  
         * informing them that the new longitude has to be a number.   
         */
        
        if (!newLongitude || typeof newLongitude !== "number" 
                || isNaN(newLongitude))
        {
            alert("Longitude values must be numeric.");
        }
        
        // Otherwise, the new longitude value is fine, so update the longitude.
        
        else
        {
            longitude = newLongitude;
        }
    };
}

