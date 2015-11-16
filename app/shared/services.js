(function() {

    'use strict';

    angular
        .module('socialMediaExplorerApp')
        .factory('selectedImages', [selectedImages])
        .factory('webServicesLocal', ['$http', webServicesLocal]);

    function selectedImages() {
        return {
            images: [],
            selectedImage: {}
        };
    }

    function webServicesLocal($http) {
        return {
            getImageCoordinates: function() {
                return $http({
                    url: '/assets/images/imdata3d.txt',
                    method: "GET",
                    cache: true
                });
            },
            getImageMap: function(path) {
                return $http({
                    url: '/assets/images/' + path + '/images.csv',
                    method: "GET",
                    cache: true
                });
            },
            getShippingData: function() {
                return $http({
                    url: '/assets/data/aisdataoneaday.json',
                    method: "GET",
                    cache: true
                });
            }
        }
    }
})();