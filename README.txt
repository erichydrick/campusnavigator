Each configuration file has a corresponding xsd file to enforce the schema. The xsd files have the same name as the configuration files.

CONFIGURATION/CONFIGURATION.XML

The <center> tag is used to indicate where the center of your map should be when the application launches. Enter the latitude and longitude of the center point for your map in the respective <latitude> and <longitude> tags. For the <city> tag, enter city, state, and zip code where the campus is located (commas are optional).

CONFIGURATION/LOCATIONS.XML

The <location> tag holds an individual location. For each location, enter the name, and coordinates in the respective <name>, <address>, and <coordinates> tags. Name and coordinate information is mandatory for all locations. If the location doesn't have a full street address (i.e. a street number and name), the <location> should only have child <name> and <coordinates> tags. The <coordinates> should have the <latitude> and <longitude> for the given location. These values must be numeric. <name> and <address> data should be strings. The order in which locations appear in the locations.xml file is the same order they appear in the list of starting and ending locations in the application, so bear that in mind while editing your locations list.

DEPLOYMENT:
Populate the configuration.xml and locations.xml files. Copy the navigator directory to the location on your server where you want the application hosted. Open a browser, enter the URL of the server location, and begin using Campus Navigator!

For a demo, copy the files in sample_configuration/ to the configuration/ directory. This will run the application for Elon University in North Carolina.
