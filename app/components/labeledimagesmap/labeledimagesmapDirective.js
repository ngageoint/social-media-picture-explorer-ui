(function() {

    'use strict';

    angular
        .module('socialMediaExplorerApp')
        .controller("labelledMapCtrl", ['$scope', 'imageMap', 'webServicesLocal', labeledImagesMapCtrl]);

    function labeledImagesMapCtrl($scope, initData, $webServicesLocal) {

        var initPath = 'cargo_helicopter';

        $scope.markerWidth = 40;
        $scope.markerHeight = 40;

        $scope.markers = createMarkers(initPath, initData);

        //watch for zoom action and change the image sizes based on the zoom level
        $scope.$watch("center.zoom", function(event) {

            var currentZoom = $scope.center.zoom; //the current zoom level

            //look through the keys of all the markers
            Object.keys($scope.markers).forEach(function(key) {

                //get the iterated marker
                var marker = $scope.markers[key];

                //resize based on the log of the current zoom
                var resize = Math.pow(Math.log(currentZoom), 2);
                //set the new marker width and height
                var markerWidth = $scope.markerWidth * resize;
                var markerHeight = $scope.markerHeight * resize;
                //change the current marker icon size and reanchor the icon so it is properly shown
                var icon = {
                    iconSize: [markerWidth, markerHeight],
                    iconAnchor: [markerWidth / 2, 0]
                };

                angular.extend(marker["icon"], icon);
            });
        });

        //events to occur on a double click on the leaflet map
        $scope.$on('leafletDirectiveMarker.dblclick', function(e, args) {
            // Args will contain the marker name and other relevant information            
            var markerKey = args.modelName; //the key of the marker
            //get the lat and lng of the double clicked marker
            var lat = $scope.markers[markerKey]["lat"];
            var lng = $scope.markers[markerKey]["lng"];

            //resize the clicked marker
            var curMarker = $scope.markers[markerKey];
            var icon = {
                iconSize: [300, 300],
                iconAnchor: [300 / 2, 0]
            };
            console.log(curMarker["icon"]);

            angular.extend(curMarker["icon"], icon);

            console.log(curMarker["icon"]);
            //recenter the map to the double clicked image
            angular.extend($scope.center, {
                lat: lat,
                lng: lng,
                zoom: 10
            });
        });


        $scope.changeData = function(path) {
            //create a promise and get the image data based on the passed in path            
            var promise = $webServicesLocal.getImageMap(path);
            promise.then(
                function(payload) {
                    $scope.markers = createMarkers(path, payload.data);
                },
                function(errorPayload) {
                    //$log.error('failure loading image data', errorPayload);
                });
        }

        //create the markers with the data set
        function createMarkers(path, data) {

            var markers = {};
            var totalLat = 0.0;
            var totalLng = 0.0;
            var ctr = 0;

            data = data.split("\n"); //split the data by newline

            //each data record pertains to a labelled image
            data.forEach(function(image) {
                var imageArr = image.trim(); //remove whitespace from the 
                imageArr = imageArr.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g); //remove ugly things from the array
                var id = imageArr[0].toString(); //image name also used as the id
                var key = "marker" + id; //the key used for the current marker

                markers[key] = {
                    lat: parseFloat(imageArr[1]),
                    lng: parseFloat(imageArr[2]),
                    message: imageArr[3]
                }; //create a new marker

                //increment the total lat and lng for the entirety of the markers                
                totalLat += markers[key]["lat"];
                totalLng += markers[key]["lng"];

                //create the icon for the current marker (an image)
                markers[key]["icon"] = {
                    iconUrl: "assets/images/" + path + "/" + imageArr[0] + ".jpg",
                    iconSize: [$scope.markerWidth, $scope.markerHeight],
                    iconAnchor: [$scope.markerWidth, 0], // point of the icon which will correspond to marker's location
                    popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
                };
                ctr++; //increment counter
            });

            //the map is centered around the average lat and lng of all markers on the map
            $scope.center = {
                lat: totalLat / data.length,
                lng: totalLng / data.length,
                zoom: 4
            };

            return markers;
        }

        angular.extend($scope, {
            events: {
                map: {
                    enable: ['zoomstart', 'zoomend', 'zoomlevelschange'],
                    logic: 'emit'
                }
            },
            layers: {
                baselayers: {
                    mapbox_light: {
                        name: 'Mapbox Light',
                        url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        type: 'xyz',
                        layerOptions: {
                            apikey: 'pk.eyJ1IjoiYnVmYW51dm9scyIsImEiOiJLSURpX0pnIn0.2_9NrLz1U9bpwMQBhVk97Q',
                            mapid: 'bufanuvols.lia22g09'
                        }
                    },
                    osm: {
                        name: 'OpenStreetMap',
                        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        type: 'xyz'
                    }
                }
            }
        });
    }
})();