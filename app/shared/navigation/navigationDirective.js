app.directive('navigationBar', ['$rootScope', '$state', function($rootScope, $state) {
  return {
    restrict: 'E',
    templateUrl: './views/navigationView.html',
    controller: function($rootScope, $stateParams, $scope, $state, $element) {  
    	//$scope.state = elem.closest('[ui-view]').data('$uiView').state;
    	$scope.state = $state;
    	console.log($scope.$state);
    	}
    }
}])