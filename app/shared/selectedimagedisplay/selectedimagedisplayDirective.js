(function() {

    'use strict';

    angular
        .module('socialMediaExplorerApp')
        .directive("selectedImageDisplay", [selectedimagedisplayDirective]);

    function selectedimagedisplayDirective() {

        var directive = {
            restrict: "E",
            scope: {
                selectedImages: "=selectedimages"
            },
            templateUrl: './views/selectedimagedisplayView.html',
            controller: controller,
            controllerAs: 'vm',
            bindToController: true,
            link: link
        };

        return directive;

        function controller($scope) {
            var vm = this;

            vm.imageClick = function(index) {
                vm.selectedImages.selectedImage = index;
            }
        };

        function link($scope, elem, attr) {}
    }
})();