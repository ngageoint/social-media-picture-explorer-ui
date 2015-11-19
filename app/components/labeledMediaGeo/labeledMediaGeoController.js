(function() {

    'use strict';

    angular
        .module('socialMediaExplorerApp')
        .controller("labeledMediaGeoCtrl", ['$scope', 'labeledMedia', 'labeledMediaFactory', labeledMediaCtrl]);

    function labeledMediaCtrl($scope, initLabeledMedia, labeledMediaFactory) {

        var initPath = 'cargo_helicopter';

        $scope.markerWidth = 40;
        $scope.markerHeight = 40;

        $scope.markers = createMarkers(initPath, initLabeledMedia);

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

            angular.extend(curMarker["icon"], icon);
            //recenter the map to the double clicked image
            angular.extend($scope.center, {
                lat: lat,
                lng: lng,
                zoom: 10
            });
        });


        $scope.changeData = function(path) {
            //create a promise and get the image data based on the passed in path            
            var promise = labeledMediaFactory.getLabeledMedia(path);
            promise.then(
                function(labeledMedia) {
                    $scope.markers = createMarkers(path, labeledMedia);
                },
                function(errorPayload) {
                    $log.error('failure loading labeled media', errorPayload);
                });
        }

        //create the markers with the data set
        function createMarkers(path, labeledMedia) {

            var markers = {};
            var totalLat = 0.0;
            var totalLng = 0.0;
            var ctr = 0;

            //each data record pertains to a labelled image
            for (var idx = 0; idx < labeledMedia.getCount(); idx++) {

                var key = "marker" + labeledMedia.getId(idx); //the key used for the current marker

                markers[key] = {
                    lat: labeledMedia.getLatitude(idx),
                    lng: labeledMedia.getLongitude(idx),
                    message: labeledMedia.getMessage(idx)
                }; //create a new marker

                //increment the total lat and lng for the entirety of the markers                
                totalLat += markers[key]["lat"];
                totalLng += markers[key]["lng"];

                //create the icon for the current marker (an image)
                markers[key]["icon"] = {
                    iconUrl: labeledMedia.getMediaUrl(idx),
                    iconSize: [$scope.markerWidth, $scope.markerHeight],
                    iconAnchor: [$scope.markerWidth, 0], // point of the icon which will correspond to marker's location
                    popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
                };
                ctr++; //increment counter
            }

            //the map is centered around the average lat and lng of all markers on the map
            $scope.center = {
                lat: totalLat / labeledMedia.getCount(),
                lng: totalLng / labeledMedia.getCount(),
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