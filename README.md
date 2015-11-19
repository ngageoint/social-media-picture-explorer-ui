# social-media-explorer
This application visualizes social media data with an emphasis of geographic coordinates.  It currently consists of 4 main areas: 

1.  Image Clusterer
2.  Map
3.  Labelled Map
4.  Ship Tracker

These views are discussed in further depth below.

## Build & development
This project was scaffolded with yeoman angular generator.  Bower is used for dependency injection and Grunt is used as the task runner.  Run `grunt build` for building distribution and `grunt serve` for building for development.  'grunt serve:dist' will build and view for distribution.

##Leveraged frameworks and libraries
The application is built using bootstrap, sass, and AngularJS 1.4.7 with some angular plugins.  It heavily relies on the Threejs and the angular leaflet directive.

* threejs : http://threejs.org/
* angular leaflet : https://github.com/tombatossals/angular-leaflet-directive
* bootstrap : http://getbootstrap.com/
* sass : http://sass-lang.com/

* also used :
* angular bootstrap : https://angular-ui.github.io/bootstrap/
* angular multiselect : http://dotansimha.github.io/angularjs-dropdown-multiselect/
* svg draw animation : http://tympanus.net/Development/SVGDrawingAnimation/
* angular timeslider : http://jsfiddle.net/lsiv568/WJqx7/1/

The app is currently structured into 4 main areas.

##1.  Image Clusterer
The image clusterer takes a file of image data with 3d coordinates called imdata3d.txt stored in the images directory.
The format of the file is filename\txcoord\tycoord\tzcoord\n.  The images are read in from the imageclustererDirective.js and displayed via threejs.  Images are highlighted according to a distance algorithm that takes in account the distance of the camera from the origin and the distance of the images from the mouse and each other.  Images can be selected by double clicking when images are highlighted.  When clicking map, these images are carried over to the map view and a represented geographically.

##2.  Map
The map view displays the images that are selected from the image clusterer on a leaflet provided map.  The directive provides multiple basemaps and can be extended to provide more.  If you click on one of the image from the row of selected images on the bottom of the screen, the map will focus on the image.

The selectedimagedisplay directive and service manages the selected image between displays 1 and 2.

##3. Labelled Map
The labelled map present images that were classified by deep learning algorithms.  Currently, a folder represents a class of labelled images.  The buttons on the page are currently static, and simply send the path to a function that will refresh the screen with the desired data.  The images.csv file contains the data and is as follows:

imagename, lat, lng, message (in our case a tweet)

##4. Ship Tracker
The ship tracker loads data that is an array of arrays and is formatted as follows:
In the current data, one row of the array corresponds to one record from a ship.  Only a max of one record is recorded for a ship per day.
MMSI,Date,Status,Latitude,Longitude,shipname,type name,country,IMO,YOB,GT,LOA,Beam,shiptype,DWT,Type summary,Prev Port,Next Port

The ship tracker colors ships green that are not anchored or moored.  The tracker can be "played" to see the ships move over time.
