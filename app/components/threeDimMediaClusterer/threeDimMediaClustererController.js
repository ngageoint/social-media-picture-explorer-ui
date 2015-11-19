(function() {

    'use strict';

    angular
        .module('socialMediaExplorerApp')
        .controller('threeDimMediaClustererCtrl', ['media', threeDimMediaClustererCtrl]);

    function threeDimMediaClustererCtrl($media) {
        var vm = this;
        vm.media = $media;
    }
})();