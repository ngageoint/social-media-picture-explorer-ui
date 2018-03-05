# What it Does

The Social Media Picture Explorer allows users to explore social media by using state of the art machine learning techniques to cluster similar images and provide automatic object recognition. This allows users to navigate social media and attached pictures via visual similarity to ease sifting through large amounts of graphical data without the need for specialized language skills for meta-text descriptions. 

Backend of UI https://github.com/ngageoint/social-media-picture-explorer

It currently consists of 4 main areas: 

1.  3D Clusterer
2.  Geo
3.  Labelled Geo
4.  Ship Tracker

These views are discussed in further depth below.

## Build & development
* This project was scaffolded with yeoman angular generator.  
* Bower is used for dependency injection and Grunt is used as the task runner.  
* Run `grunt build` for building distribution and `grunt serve` for building for development.  'grunt serve:dist' will build and view for distribution.

## Steps to get you up and running :)  
* $ represent cmd prompt.  Do not type it in the prompt.
* Clone repo!
* Download Node.js at https://nodejs.org/
  * Verify Node Package Manager is installed $ npm -v
  * If previous command does not echo npm version num search google for help :)
* Install Bower (http://bower.io/), Grunt (http://gruntjs.com/) or Node Package Manager (https://www.npmjs.com/) for details.
  * To install use $ npm install
  * See bower.io or gruntjs web sites for more details.
* Install Bower dependencies (this downloads all external needed js/css/etc for the app to run)
  * In command prompt navigate to the repo directory and use $ bower install
  * You may be asked to resolve dependencies. Don't panic.
* Run app locally using grunt serve.  Files are output to .tmp folder.  
* You may need to type in the localhost:port into your browser to view the running app.
* Deploy app using grunt build and copy contents of .dist to serve

## Leveraged frameworks and libraries
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

## Application parts
The app is currently structured into 4 main areas.  All file paths are defined in APP_CONFIG in app.js.  Feel free to change these paths to meet the needs of your app.

### 1.  3D Clusterer
The 3D clusterer takes a file of media data with 3d coordinates and displayed via threejs.  Media is highlighted according to a distance algorithm that takes in account the distance of the camera from the origin and the distance of the media from the mouse and each other.  Media can be selected by double clicking when it ise highlighted.  When clicking Geo, your selected items are carried over to the geographic view and a represented geographically.

Images are read from a file called imdata3d.txt stored in the images directory
The format of the file is below:
  1. filename
  2. xcoord
  3. ycoord
  4. zcoord

The records are delimited by tabs and each line is delimted by a new line.   The media is read in from the mediaFactory.js 

![alt tag](https://github.com/ngageoint/social-media-explorer-ui/blob/master/docs/3d-cluster-view.png)

### 2.  Geo
The geographic view displays the media that are selected from the 3D clusterer on a leaflet provided map.  The directive provides multiple basemaps and can be extended to provide more.  If you click on one of the items from the row of selected media on the bottom of the screen, the map will focus on the image.

The selectedMediaDisplay directive and service manages the selected items between the 3D Clusterer and Geo views.

![alt tag](https://github.com/ngageoint/social-media-explorer-ui/blob/master/docs/geo-view.png)

### 3. Labeled Geo
The labeled geo view presents media that was classified (labeled) by deep learning algorithms.  Currently, a folder in the assets/images directory represents a class of labeled images.  The buttons on the page are currently static, and simply send the path to a function that will refresh the screen with the desired data.  images.csv with the specified path contains the data and is as follows:

  1.  mediafilename
  2.  lat
  3.  lng
  4.  message 

The records are delimited by commas and each line is delimited by a new line. This file is read in by the labeledMediaFactory and turned into a javascript object for easy access throughout the application.  Modify this file to alter the object and/or data format.

### 4. Ship Tracker
The ship tracker loads data that is an array of arrays and is formatted as follows:
In the current data format, one row of the array corresponds to one recording from a ship.  Only a max of one record is recorded for a ship per day.

Array values:
  0. MMSI
  1. Date
  2. Status
  3. Latitude
  4. Longitude
  5. shipname
  6. type 
  7. name
  8. country
  9. IMO
  10. YOB
  11. GT
  12. LOA
  13. Beam
  14. shiptype
  15. DWT
  16. Type 
  17. summary
  18. Prev Port
  19. Next Port

Only fields 1 through 8 are currently used in the application.  The shipsFactory class reads in the data and provides an object to use to access throughout the application.  Modify this file to alter the object and/or data format.

The ship tracker colors ships green that are not anchored or moored.  The tracker can be "played" to see the ships move over time.

## Origin
Social Media Picture Explorer UI was developed at the National Geospatial-Intelligence Agency (NGA) in collaboration with Booz Allen. The government has "unlimited rights" and is releasing this software to increase the impact of government instruments by providing developers with the opportunity to take things in new directions. The software use, modification, and distribution rights are stipulated within the Apache 2.0 License. 

## Pull Requests
If you'd like to contribute to this project, please make a pull request. We'll review the pull request and discuss the changes. All pull request contributions to this project will be released under the Apache 2.0 license.  

Software source code previously released under an open source license and then modified by NGA staff is considered a "joint work" (see 17 USC 101); it is partially copyrighted, partially public domain, and as a whole is protected by the copyrights of the non-government authors and must be released according to the terms of the original open source license.
