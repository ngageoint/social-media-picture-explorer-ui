(function() {

    'use strict';

    angular
        .module('socialMediaExplorerApp')
        .controller("shipTrackerCtrl", ['$scope', 'ships', 'shipsFactory', '$interval', shipTrackerController]);

    function shipTrackerController($scope, ships, shipsFactory, $interval) {
        //model for ship types dropdown
        $scope.shipTypesModel = [];
        //settings for the ship type dropdown
        $scope.shipTypesDropDownSettings = {
            displayProp: 'label',
            idProp: 'label'
        };
        //text for the ship type drop down
        $scope.shipTypesDropDownTexts = {
            buttonDefaultText: 'Select Ship Types'
        };

        $scope.markerWidth = 40;
        $scope.markerHeight = 40;
        $scope.items = ships.getUniqueColValues(ships.typeIdx);

        $scope.$watch("shipTypesModel", function(event) {
            $scope.getData(ships, $scope.currentDate);
        }, true);

        $scope.layoutSliderChanged = function(value) {
            $scope.getData(ship, value);
        };


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

        setSliderMinMaxDates(ships.getMinMaxDates());

        //set the min and max dates for the slider from the range object
        function setSliderMinMaxDates(range) {
            $scope.layoutEndTimeMS = range.max;
            $scope.layoutStartTimeMS = range.min;
            $scope.currentDate = range.min;
        }

        var stop;
        //increment the date every second automatically on play
        $scope.play = function() {
            // Don't start if already going
            if (angular.isDefined(stop)) return;

            stop = $interval(function() {

                var dayMS = 86400000; //ms in days 

                //if the current date is less then the last date of the date range
                if ($scope.currentDate < $scope.layoutEndTimeMS) {
                    //the new current date equals the current date + one day
                    $scope.currentDate = $scope.currentDate + dayMS;
                    //set the current time to the current date
                    $scope.layoutCurTimeMS = $scope.currentDate;
                    $scope.getData(ships, $scope.currentDate);
                } else {
                    //if the date has incremented to the end stop play
                    $scope.stopPlay();
                }
            }, 1000);
        };

        //stop the date from incrementing automatically
        $scope.stopPlay = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };

        //update the data 
        $scope.getData = function(data, date) {

            var tempData = _.filter(ships.data, function(elem) {
                return (new Date(elem[ships.dateIdx]).toLocaleDateString() == new Date(date).toLocaleDateString() && ($scope.shipTypesModel.length == 0 || _.findWhere($scope.shipTypesModel, {
                    'id': elem[ships.typeIdx]
                }) != undefined));
            });

            $scope.markers = updateMarkers(shipsFactory.setShips(tempData));
        };

        function updateMarkers(data) {

            var ctr = 0;
            var markers = {};
            var totalLat = 0.0;
            var totalLng = 0.0;

            for (var idx = 0; idx < data.getCount(); idx++) {
                var iconUrl = data.getShipIconUrl(idx);

                var markerId = data.getDate(idx).toString() + data.getId(idx).toString();
                var key = "marker" + markerId;

                markers[key] = {
                    lat: data.getLatitude(idx),
                    lng: data.getLongitude(idx),
                    icon: {
                        iconSize: [$scope.markerWidth, $scope.markerHeight],
                        iconUrl: iconUrl
                    },
                    message: "<div>" + data.getShipname(idx) + "<br/>" + data.getStatus(idx) + "<br/>" + data.getType(idx)
                };

                totalLat += data.getLatitude(idx);
                totalLng += data.getLongitude(idx);
            }
            return markers;
        }


        angular.extend($scope, {
            center: {
                lat: 70,
                lng: 70,
                zoom: 3
            },
            events: {
                map: {
                    enable: ['zoomstart', 'zoomend', 'zoomlevelschange'],
                    logic: 'emit'
                }
            },
            markers: {},
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

        $scope.getData(ships);

        $scope.$on('$destroy', function() {
            // Make sure that the interval is destroyed too
            $scope.stopPlay();
        });

    }
})();