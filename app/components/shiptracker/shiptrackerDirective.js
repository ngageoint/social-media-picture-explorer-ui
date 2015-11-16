(function() {

    'use strict';

    angular
        .module('socialMediaExplorerApp')
        .controller("shipTrackerCtrl", ['$scope', 'data', 'webServicesLocal', '$interval', shipTrackerController]);

    function shipTrackerController($scope, $data, $webServicesLocal, $interval) {

        var dataDateIndex = 1;
        var dataNameIndex = 5;
        var dataTypeIndex = 6;

        updateMarkers($data);
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
        $scope.items = getUniqueFromCol($data, dataTypeIndex);

        $scope.$watch("shipTypesModel", function(event) {
            $scope.getData($data, $scope.currentDate);
        }, true);

        $scope.layoutSliderChanged = function(value) {
            $scope.getData($data, value);
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


        setSliderMinMaxDates(getDataMinMaxDates($data));

        //set the min and max dates for the slider from the range object
        function setSliderMinMaxDates(range) {
            $scope.layoutEndTimeMS = range.max;
            $scope.layoutStartTimeMS = range.min;
            $scope.currentDate = range.min;
        }

        //get the min and max dates from the data
        function getDataMinMaxDates(data) {
            var min = null,
                max = 0;

            //search through all of the data for the min and max dates
            _.each(data, function(elem) {
                min = (min == null || elem[1] < min) ? elem[1] : min;
                max = elem[1] > max ? elem[1] : max;
            });

            return {
                min: min,
                max: max
            };
        }

        //get the unique values for a column
        function getUniqueFromCol(data, index) {
            var vals = [];
            //loop through all rows of data
            for (var i = 0; i < data.length; i++) {
                var val = data[i][index]; //current row col val
                if (_.findWhere(vals, {
                    'label': val
                }) == undefined) {
                    vals.push({
                        'id': vals.length,
                        'label': val
                    });
                }
            }
            return vals;
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
                    $scope.getData($data, $scope.currentDate);
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

            var tempData = _.filter(data, function(elem) {
                return (new Date(elem[dataDateIndex]).toLocaleDateString() == new Date(date).toLocaleDateString() && ($scope.shipTypesModel.length == 0 || _.findWhere($scope.shipTypesModel, {
                    'id': elem[dataTypeIndex]
                }) != undefined));
            });

            $scope.markers = updateMarkers(tempData);
        };

        function updateMarkers(data) {

            var ctr = 0;
            var markers = {};
            var totalLat = 0.0;
            var totalLng = 0.0;

            for (var i = 0; i < data.length; i++) {
                var rec = data[i]; //get record
                var iconUrl = getShipIconUrl(rec[2].toLowerCase());

                var id = rec[1].toString() + rec[0].toString();
                var key = "marker" + id;

                markers[key] = {
                    lat: parseFloat(rec[3]),
                    lng: parseFloat(rec[4]),
                    icon: {
                        iconSize: [$scope.markerWidth, $scope.markerHeight],
                        iconUrl: iconUrl
                    },
                    message: "<div>" + rec[5] + "<br/>" + rec[2] + "<br/>" + rec[7] + "<br/>" + rec[6]
                };

                totalLat += parseFloat(rec[3]);
                totalLng += parseFloat(rec[4]);
            }

            function getShipIconUrl(status) {
                var iconUrl = "/assets/images/shipgreen.png";

                if (status == "at anchor" || status == "moored" || status == "not under command") {
                    iconUrl = "/assets/images/shipred.png";
                }

                return iconUrl;
            }

            return markers;
        }


        angular.extend($scope, {
            center: {
                lat: 25.0391667,
                lng: 121.525,
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


        $scope.$on('$destroy', function() {
            // Make sure that the interval is destroyed too
            $scope.stopPlay();
        });

    }
})();