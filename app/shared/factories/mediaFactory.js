/* 
mediaFactory loads data about the media including three dimensional representation 
and provides an object to access the data.  Upcoming versions  should include 
informatino such as latitude, longitude, media details, etc.
*/

(function() {

    'use strict';

    angular
        .module('socialMediaExplorerApp')
        .factory('mediaFactory', ['$http', 'APP_CONFIG', mediaFactory]);

    function mediaFactory($http, APP_CONFIG) {
        function media(mediaData) {
            if (mediaData) {
                this.setData(mediaData);
            }
            // Some other initializations related to book
        };
        media.prototype = {
            setData: function(mediaData) {
                this.mediaFilenameIdx = 0;
                this.xCoordinateIdx = 1;
                this.yCoordinateIdx = 2;
                this.zCoordinateIdx = 3;
                this.splitChar = ",";
                this.pathToMedia = APP_CONFIG.mediaThumbnailUrl;
                this.data = mediaData.split("\n");
            },
            getRowAsArray: function(idx) {
                return this.data[idx].split(this.splitChar);
            },
            getMediaUrl: function(idx) {
                return this.pathToMedia + this.getRowAsArray(idx)[this.mediaFilenameIdx];
            },
            //the x, y, z coordinates correspond to represenation of the media
            //in 3d space in relation to the similarity with the other media           
            getXCoordinate: function(idx) {
                return this.getRowAsArray(idx)[this.xCoordinateIdx];
            },
            getYCoordinate: function(idx) {
                return this.getRowAsArray(idx)[this.yCoordinateIdx];
            },
            getZCoordinate: function(idx) {
                return this.getRowAsArray(idx)[this.zCoordinateIdx];
            },
            getCount: function() {
                return this.data.length;
            }
        };
        return {
            getMedia: function() {

                return $http({
                        url: APP_CONFIG.baseDataUrl + APP_CONFIG.mediaFactoryFilename,
                        method: "GET",
                        cache: true
                    })
                    .then(function(response) {
                        return new media(response.data);
                    });
            }
        };
    }
})();