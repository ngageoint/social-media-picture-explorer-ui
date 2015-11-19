(function() {

    'use strict';

    angular
        .module('socialMediaExplorerApp')
        .directive("selectableMediaDisplay", [selectableMediaDisplayDirective]);

    function selectableMediaDisplayDirective() {

        var directive = {
            restrict: "E",
            scope: {
                media: "=media"
            },
            templateUrl: 'views/selectableMediaDisplayView.html',
            controller: controller,
            controllerAs: 'vm',
            bindToController: true,
            link: link
        };

        return directive;

        function controller($scope) {
            var vm = this;

            vm.mediaClick = function(index) {
                vm.media.selected = index;
            }
        };

        function link($scope, elem, attr) {}
    }
})();