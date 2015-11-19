/* 
labeledMediaFactory loads data from the labeled media files 
and provides an object to access the data.
*/

(function() {

    'use strict';

    angular
        .module('socialMediaExplorerApp')
        .factory('labeledMediaFactory', ['$http', labeledMediaFactory]);

    function labeledMediaFactory($http) {
        function labeledMedia(labeledMediaData, path) {
            if (labeledMediaData) {
                this.setData(labeledMediaData);
                this.path = path;
            }
        }
        labeledMedia.prototype = {
            setData: function(labeledMediaData) {
                this.data = labeledMediaData.split("\n");
                this.mediaFilenameIdx = 0;
                this.latitudeIdx = 1;
                this.longitudeIdx = 2;
                this.messageIdx = 3;
                this.pathToMedia = "assets/images/";
            },
            getRowAsArray: function(idx) {
                return this.data[idx].trim().match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            },
            getId: function(idx) {
                return this.getRowAsArray(idx)[this.mediaFilenameIdx].toString();
            },
            getMediaUrl: function(idx) {
                return this.pathToMedia + this.path + "/" + this.getRowAsArray(idx)[this.mediaFilenameIdx] + ".jpg";
            },
            getLatitude: function(idx) {
                return parseFloat(this.getRowAsArray(idx)[this.latitudeIdx]);
            },
            getLongitude: function(idx) {
                return parseFloat(this.getRowAsArray(idx)[this.longitudeIdx]);
            },
            getMessage: function(idx) {
                return this.getRowAsArray(idx)[this.messageIdx];
            },
            getCount: function() {
                return this.data.length;
            }
        }
        return {
            //getLabeledMedia takes a path and returns
            //a labeled media object from the data file
            //stored at that path
            getLabeledMedia: function(path) {
                return (function(path) {
                    var p = path;
                    return $http({
                        url: 'assets/images/' + path + '/images.csv',
                        method: "GET",
                        cache: true
                    }).then(function(response) {
                        return new labeledMedia(response.data, p);
                    });
                })(path);
            }
        }
    }
})();