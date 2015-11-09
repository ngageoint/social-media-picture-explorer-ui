app.controller('imageClustererCtrl',['$scope', 'imageCoords', function ($scope, $imageCoords) {
	console.log("cluster images");	
	$scope.imageCoords = $imageCoords.split("\n");	
}])