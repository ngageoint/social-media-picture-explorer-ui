(function() {

    'use strict';

    angular
        .module('socialMediaExplorerApp')
        .directive('navigationBar', ['$rootScope', '$state', navigationDirective]);

    function navigationDirective($rootScope, $state) {
        return {
            restrict: 'E',
            templateUrl: './views/navigationView.html',
            controller: function($rootScope, $stateParams, $scope, $state, $element) {
                $scope.state = $state;
            }
        }
    }
})();