/* 
selectedImages provides a way to access the i
*/
(function() {

    'use strict';

    angular
        .module('socialMediaExplorerApp')
        .factory('selectedMediaFactory', [selectedMediaFactory]);

    function selectedMediaFactory() {
        return {
            media: [],
            selected: {}
        };
    }
})();