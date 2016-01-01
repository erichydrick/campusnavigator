# Campus Navigator README

To get Campus Navigator up and running for your campus, all you need to do is to fill out the configuration.xml and locations.xml files in the configuration/ directory. Each configuration file has a corresponding xsd file to ensure the files are set up corectly. You can test to make sure your configuration files are structured correctly using an online XML validation tool such as http://www.xmlvalidation.com/. 

# configuration/configuration.xml

The configuration.xml The <center> tag is used to indicate where the center of your map should be when the application launches. Enter the latitude and longitude of the center point for your map in the respective <latitude> and <longitude> tags. <allowMultipleRoutes> is used to indicate whether Campus Navigator should let users choose between multiple routes when viewing directions. For many campuses, the default value of _false_ will be fine.

For an example on what a valid configuration.xml file looks like, please see https://github.com/erichydrick/campusnavigator/blob/master/sample_configuration/configuration.xml.

# configuration/locations.xml

locations.xml holds a list of all the locations on and around campus that Campus Navigator can provide directions to and from. It's recommended that this list be alphabetized based on the name of the location, and that each location name be listed using the name students use to refer to the location, not necessarily the official name (i.e. Most students don't use the full name of the donor for whom a building is named, so often just their last name will do). 

Locations can be campus buildings, parking lots, restaurants, sports fields/stadiums, and any other place on campus that people want to be able to find.

The <location> tag holds an individual location. For each location, enter the name, and coordinates in the respective <name> and <coordinates> tags. Name and coordinate information is mandatory for all locations. If the location doesn't have a full street address (i.e. a concrete street number and name), the <location> should only have child <name> and <coordinates> tags. The <coordinates> should have the <latitude> and <longitude> for the given location. These values must be numeric. <name> and <address> data should be strings. 

An example location entry for a campus location that doesn't have a street address is:

```
<location>
    <name>Parking Lot - Student Permits</name>
    <coordinates>
        <latitude>36.1018953</latitude>
        <longitude>-79.4988567</longitude>
    </coordinates>
</location>

```

An example location entry for a campus location that does have a street address is:

```
<location>
    <name>Phoenix Softball Clubhouse</name>
    <address>
        <street>542 North Williamson Avenue</street>
        <cityStateZip>Elon NC 27244</cityStateZip>
    </address>
    <coordinates>
        <latitude>36.1075557</latitude>
        <longitude>-79.5097357</longitude>
    </coordinates>
</location>
```

For more examples on what the locations.xml should look like, see https://github.com/erichydrick/campusnavigator/blob/master/sample_configuration/locations.xml.

# Deployment

Download the Campus Navigator files from GitHub, making sure you keep the same directory structure (you can ignore the sample_configuration/ directory). Fill out the configuration.xml and locations.xml files. Copy the Campus Navigator files to the location on your server where you want the application hosted. Open a browser, enter the URL of the server location, and begin using Campus Navigator!

For a demo, copy the files in sample_configuration/ to the configuration/ directory. This will run the application for Elon University in North Carolina.
