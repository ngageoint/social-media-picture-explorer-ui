app.controller("mapCtrl", [ '$scope', 'selectedImages', function($scope, selectedImages) {
	markersSet = {};	
	ctr = 0;
	$scope.selectedImages = selectedImages;
	$scope.selectedImageClick = function(obj) {
		$scope.center = {};
		console.log(obj.target.attributes.data.value);
		$scope.center.lat = markersSet["test" + obj.target.attributes.data.value].lat;
		$scope.center.lng = markersSet["test" + obj.target.attributes.data.value].lng;
		$scope.center.zoom = 7;
	};

	selectedImages.images.forEach(function(image){		
		markersSet["test" + ctr] = {};
		markersSet["test" + ctr]["lat"] = Math.floor(Math.random() * 180) + 1;
		markersSet["test" + ctr]["lng"] = Math.floor(Math.random() * 90) + 1;
		markersSet["test" + ctr]["icon"] = {};
		markersSet["test" + ctr]["icon"].iconUrl = image;
		markersSet["test" + ctr]["icon"].iconSize = [75,75];
		ctr++;
	});	
	angular.extend($scope, {
		center: {
			lat: 25.0391667,
			lng: 121.525,
			zoom: 3
		},		
		markers: markersSet,		
		layers: {
			baselayers: {
				mapbox_light: {
					name: 'Mapbox Light',
					url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
					type: 'xyz',
					layerOptions: {
						apikey: 'pk.eyJ1IjoiYnVmYW51dm9scyIsImEiOiJLSURpX0pnIn0.2_9NrLz1U9bpwMQBhVk97Q',
						mapid: 'bufanuvols.lia22g09'
					}
				},
				osm: {
					name: 'OpenStreetMap',
					url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
					type: 'xyz'
				}
			}
		}
	});
}]) 