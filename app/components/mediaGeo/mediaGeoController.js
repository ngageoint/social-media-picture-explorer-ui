/* Module to show a set of images on a map */
/* Currently uses artificial coordinates */

(function() {

    'use strict';

    angular
        .module('socialMediaExplorerApp')
        .controller("mediaGeoCtrl", ['$scope', 'selectedMediaFactory', mediaGeoCtrl]);

    //selectedMedia is a service that provides access to the selected images in the dashboard
    function mediaGeoCtrl($scope, selectedMedia) {

        var vm = this; //set vm to current scope

        vm.selectedMedia = selectedMedia;

        var leaflet = {
            markerPrefix: "img", //prefix for the names of the markers
            defaultZoom: 4, //default zoom for leaflet
            focusZoom: 8,
            iconSize: [75, 75]
        };


        //watch for a change in the current selected image from all of the selectedMedia
        $scope.$watch('vm.selectedMedia.selected', selectedMediaChange);

        function selectedMediaChange(newVal, oldVal) {
            if (newVal != oldVal && !angular.isUndefined(newVal)) {
                focusOnImage(newVal);
            }
        };

        //create markers from the images for the map
        function createMarkers(arr, leaflet) {
            var ctr = 0;
            var markers = {};

            arr.media.forEach(function(image) {
                markers[leaflet.markerPrefix + ctr] = {};
                markers[leaflet.markerPrefix + ctr]["lat"] = Math.floor(Math.random() * 180) + 1; //ranom
                markers[leaflet.markerPrefix + ctr]["lng"] = Math.floor(Math.random() * 90) + 1; //random

                //create an object to represent the icon for the marker
                var icon = {
                    iconUrl: image,
                    iconSize: leaflet.iconSize
                }

                markers[leaflet.markerPrefix + ctr]["icon"] = icon
                ctr++;
            });

            return markers;
        }

        //focus the map on the specified index coords in the markers
        function focusOnImage(index) {
            $scope.center.lat = $scope.markers[leaflet.markerPrefix + index].lat;
            $scope.center.lng = $scope.markers[leaflet.markerPrefix + index].lng;
            $scope.center.zoom = leaflet.focusZoom;
        }

        angular.extend($scope, {
            center: {
                lat: 0,
                lng: 0,
                zoom: leaflet.defaultZoom
            },
            markers: createMarkers(vm.selectedMedia, leaflet),
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