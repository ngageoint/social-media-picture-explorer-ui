app.controller("labelledMapCtrl", [ '$scope', 'imageMap', 'webServicesLocal', function($scope, $imageMap, $webServicesLocal) {	

	$scope.markerWidth = 40;
	$scope.markerHeight = 40;
	$scope.$watch("center.zoom", function(event){        
        var currentZoom = $scope.center.zoom;
  		Object.keys($scope.markers).forEach(function(key){
  			var marker = $scope.markers[key];
  			var resize = Math.pow(Math.log(currentZoom), 2);
  			console.log(currentZoom);
  			var markerWidth = $scope.markerWidth * resize;
  			var markerHeight = $scope.markerHeight * resize;
  			marker["icon"].iconSize = [markerWidth,markerHeight];
  			marker["icon"]["iconAnchor"] =  [marker["icon"].iconSize[0] / 2, 0];    
  		})
    });

    $scope.$on('leafletDirectiveMarker.dblclick', function(e, args) {
            // Args will contain the marker name and other relevant information
            console.log(args);
            var markerName = args.modelName; //has to be set above
            var lat = $scope.markers[markerName]["lat"];
            var lng = $scope.markers[markerName]["lng"];
            $scope.markers[markerName]["icon"].iconSize = [300, 300];  
            $scope.markers[markerName]["icon"]["iconAnchor"] =  [$scope.markers[markerName]["icon"].iconSize[0] / 2, 0];        
            $scope.center = {
				lat: lat,
				lng: lng,
				zoom: 10
			};
        }); 


	$scope.refresh = function(path) {
		$scope.path = path;
		 var promise = $webServicesLocal.getImageMap(path);
       promise.then(
          function(payload) { 
              $scope.updateMarkers(payload.data);
          },
          function(errorPayload) {
              $log.error('failure loading movie', errorPayload);
          });
	}
	$scope.updateMarkers = function(data) {
		console.log(data);
		$scope.markers = {};
		message = $scope.path;
		ctr = 0;	
		var markersSet = {};
		var totalLat = 0.0;
		var totalLng = 0.0;
		$scope.imageMap = data.split("\n");		
		$scope.imageMap.forEach(function(image){			
			var imageArr = image.trim();			
			imageArr = imageArr.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
			console.log(imageArr);
			var id = imageArr[0].toString();
			var name = "test" + id;
			ctr++;
			markersSet[name] = {};
			markersSet[name]["lat"] = parseFloat(imageArr[1]);
			markersSet[name]["lng"] = parseFloat(imageArr[2]);
			totalLat += parseFloat(imageArr[1]);
			totalLng += parseFloat(imageArr[2]);
			markersSet[name]["icon"] = {};
			markersSet[name]["icon"].iconUrl = "assets/images/" + $scope.path + "/" + imageArr[0] + ".jpg";
			markersSet[name]["icon"].iconSize = [$scope.markerWidth,$scope.markerHeight];
			markersSet[name]["message"] = imageArr[3];	
			markersSet[name]["icon"]["iconAnchor"] =  [markersSet[name]["icon"].iconSize[0], 0], // point of the icon which will correspond to marker's location
			markersSet[name]["icon"]["popupAnchor"] =  [0, 0]; // point from which the popup should open relative to the iconAnchor
		});	
		$scope.markers = markersSet;
		$scope.center = {
			lat: totalLat / $scope.imageMap.length,
			lng: totalLng / $scope.imageMap.length,
			zoom: 4
		};
	}

	angular.extend($scope, {
		center: {
			lat: 25.0391667,
			lng: 121.525,
			zoom: 10
		},
		 events: {
            map: {
                enable: ['zoomstart', 'zoomend', 'zoomlevelschange'],
                logic: 'emit'
            }
        },
		markers: {},		
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
	$scope.path = 'cargo_helicopter';
	$scope.markers = {};
	$scope.updateMarkers($imageMap);
}]) 