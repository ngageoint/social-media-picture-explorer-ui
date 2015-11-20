# social-media-explorer-ui
This application visualizes social media data with an emphasis of geographic coordinates.  It currently consists of 4 main areas: 

1.  3D Clusterer
2.  Geo
3.  Labelled Geo
4.  Ship Tracker

These views are discussed in further depth below.

## Build & development
* This project was scaffolded with yeoman angular generator.  
* Bower is used for dependency injection and Grunt is used as the task runner.  
* Run `grunt build` for building distribution and `grunt serve` for building for development.  'grunt serve:dist' will build and view for distribution.

##Steps to get you up and running :)  
* $ represent cmd prompt.  Do not type it in the prompt.
* Clone repo!
* Download Node.js at https://nodejs.org/
  * Verify Node Package Manager is installed $ npm -v
  * If previous command does not echo npm version num search google for help :)
* Install Bower (http://bower.io/), Grunt (http://gruntjs.com/) or Node Package Manager (https://www.npmjs.com/) for details.
  * To install use $ npm install
  * See bower.io, gruntjs or for more details.
* Install Bower dependencies (this downloads all external needed js/css/etc for the app to run)
  * In command prompt navigate to the repo directory and use $ bower install
  * You may be asked to resolve dependencies. Don't panic.
* Run app locally using grunt serve.  Files are output to .tmp folder.  
* You may need to type in the localhost:port into your browser to view the running app.
* Deploy app using grunt build and copy contents of .dist to serve

##Leveraged frameworks and libraries
The application is built using bootstrap, sass, and AngularJS 1.4.7 with some angular plugins.  It heavily relies on the Threejs and the angular leaflet directive.

* threejs : http://threejs.org/
* angular leaflet : https://github.com/tombatossals/angular-leaflet-directive
* bootstrap : http://getbootstrap.com/
* sass : http://sass-lang.com/

also used :
* angular bootstrap : https://angular-ui.github.io/bootstrap/
* angular multiselect : http://dotansimha.github.io/angularjs-dropdown-multiselect/
* svg draw animation : http://tympanus.net/Development/SVGDrawingAnimation/
* angular timeslider : http://jsfiddle.net/lsiv568/WJqx7/1/

The app is currently structured into 4 main areas.

##1.  3D Clusterer
The 3D clusterer takes a file of media data with 3d coordinates called imdata3d.txt stored in the images directory.
The format of the file is filename\txcoord\tycoord\tzcoord\n.  The media is read in from the mediaFactory.js and displayed via threejs.  Media is highlighted according to a distance algorithm that takes in account the distance of the camera from the origin and the distance of the media from the mouse and each other.  Media can be selected by double clicking when it ise highlighted.  When clicking Geo, your selected items are carried over to the geographic view and a represented geographically.

![alt tag](https://github.com/ngageoint/social-media-explorer-ui/blob/master/docs/3d-cluster-view.png)

##2.  Geo
The geographic view displays the media that are selected from the 3D clusterer on a leaflet provided map.  The directive provides multiple basemaps and can be extended to provide more.  If you click on one of the items from the row of selected media on the bottom of the screen, the map will focus on the image.

The selectedMediaDisplay directive and service manages the selected items between the 3D Clusterer and Geo views.

![alt tag](https://github.com/ngageoint/social-media-explorer-ui/blob/master/docs/geo-view.png)

##3. Labeled Geo
The labeled geo view presents media that was classified (labeled) by deep learning algorithms.  Currently, a folder in the assets/images directory represents a class of labeled images.  The buttons on the page are currently static, and simply send the path to a function that will refresh the screen with the desired data.  images.csv with the specified path contains the data and is as follows:

imagename, lat, lng, message (in our case a tweet)

This file is read in by the labeledMediaFactory and turned into a javascript object for easy access throughout the application.

![alt tag](https://github.com/ngageoint/social-media-explorer-ui/blob/master/docs/labeled-geo-view.png)

##4. Ship Tracker
The ship tracker loads data that is an array of arrays and is formatted as follows:
In the current data format, one row of the array corresponds to one recording from a ship.  Only a max of one record is recorded for a ship per day.

The data of the format is below:
MMSI,Date,Status,Latitude,Longitude,shipname,type name,country,IMO,YOB,GT,LOA,Beam,shiptype,DWT,Type summary,Prev Port,Next Port

The ship tracker colors ships green that are not anchored or moored.  The tracker can be "played" to see the ships move over time.

The shipsFactory class reads in the data and provides an object to use to access throughout the application.

