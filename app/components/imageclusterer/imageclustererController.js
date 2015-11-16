(function() {

    'use strict';

    angular
        .module('socialMediaExplorerApp')
        .controller('imageClustererCtrl', ['imageCoords', imageClustererCtrl]);

    function imageClustererCtrl($imageCoords) {
        var vm = this;
        vm.imageCoords = $imageCoords.split("\n");
    }
})();