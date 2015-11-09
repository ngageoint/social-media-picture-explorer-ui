app.controller("shipTrackerCtrl", [ '$scope', 'data', 'webServicesLocal', '$interval', function($scope, $data, $webServicesLocal, $interval) {	
	$scope.example1model = [];
	$scope.example3settings = {displayProp: 'label', idProp: 'label'};
	$scope.example5customTexts= { buttonDefaultText: 'Select Ship Types'};
	$scope.markerWidth = 40;
	$scope.markerHeight = 40;
	
	var min = null, max = 0;

	_.each($data, function(elem) {
		min = (min == null || elem[1] < min) ? elem[1] : min; 
		max = elem[1] > max ? elem[1] : max;
	});
	$scope.layoutEndTimeMS = max;
	$scope.layoutStartTimeMS = min;
	$scope.selectedDate = min;

	var stop;
	$scope.play = function() {
          // Don't start a new fight if we are already fighting
          if ( angular.isDefined(stop) ) return;
          //console.log("play");
          stop = $interval(function() {
          	var days = 86400000;
          	console.log(new Date($scope.selectedDate).toLocaleDateString());          	
            if ($scope.selectedDate < $scope.layoutEndTimeMS) {
              $scope.selectedDate = $scope.selectedDate + days;
              $scope.layoutCurTimeMS = $scope.selectedDate;
              console.log($scope.layoutCurTimeMS);
              $scope.refresh();              
            } 
            else 
            {
              $scope.stopPlay();
            }
          }, 1000);
        };

    $scope.stopPlay = function() {
      if (angular.isDefined(stop)) {
        $interval.cancel(stop);
        stop = undefined;
      }
    };

    $scope.$on('$destroy', function() {
      // Make sure that the interval is destroyed too
      $scope.stopPlay();
    });

	$scope.refresh = function() {
		var val = $scope.selectedDate;		
		tempData = _.filter($data, function(elem)
		{		
			return (new Date(elem[1]).toLocaleDateString() == new Date(val).toLocaleDateString() 
				&& ($scope.example1model.length == 0 || _.findWhere($scope.example1model, {'id' : elem[6]}) != undefined));
		});	
		$scope.updateMarkers(tempData);
		//$scope.$apply();
	};

	$scope.$watch("example1model", function(event){    
		$scope.refresh();
	}, true);

	$scope.layoutSliderChanged = function (value) {
        $scope.selectedDate = value;
        $scope.refresh();
    };

	$scope.$watch("center.zoom", function(event){        
      /*  var currentZoom = $scope.center.zoom;
  		Object.keys($scope.markers).forEach(function(key){
  			var marker = $scope.markers[key];
  			var resize = Math.pow(Math.log(currentZoom), 2);
  			console.log(currentZoom);
  			var markerWidth = $scope.markerWidth * resize;
  			var markerHeight = $scope.markerHeight * resize;
  			marker["icon"].iconSize = [markerWidth,markerHeight];
  			marker["icon"]["iconAnchor"] =  [marker["icon"].iconSize[0] / 2, 0];    
  		})*/
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

	 $scope.getNames = function() {
	 	names = [];
	 	for (i = 0; i < $data.length; i++)
	 	{
	 		var shipname = $data[i][5];
	 		if (_.indexOf(names, shipname) == -1)
	 			names.push(shipname);
	 	}
	 }

	 $scope.getTypes = function() {
	 	types = [];
	 	for (i = 0; i < $data.length; i++)
	 	{
	 		var shipType = $data[i][6];
	 		if (_.findWhere(types, { 'label' : shipType }) == undefined)
	 			types.push({'id' : types.length, 'label' : shipType });
	 	}
	 }
	 $scope.getTypes();
	 $scope.selectedItem = [];
	 $scope.items = types;

	$scope.updateMarkers = function(data) {		
		$scope.markers = {};		

		ctr = 0;	
		var markersSet = {};
		var totalLat = 0.0;
		var totalLng = 0.0;

		var length = data.length < 100 ? data.length : 100;
		
		for (i  = 0; i < data.length; i++)//data.length; i++)
		{			
			rec = data[i];
			var iconUrl = "/assets/images/shipgreen.png";

			if (rec[2].toLowerCase() == "at anchor" || rec[2].toLowerCase() == "moored" || rec[2].toLowerCase() == "not under command")
			{
				iconUrl = "/assets/images/shipred.png";
			}
			
			var id = rec[1].toString() + rec[0].toString();
			var name = "ship" + id;
			ctr++;
			markersSet[name] = {};
			markersSet[name]["lat"] = parseFloat(rec[3]);
			markersSet[name]["lng"] = parseFloat(rec[4]);
			totalLat += parseFloat(rec[3]);
			totalLng += parseFloat(rec[4]);
			markersSet[name]["icon"] = {};			
			markersSet[name]["icon"].iconSize = [$scope.markerWidth,$scope.markerHeight];
			markersSet[name]["icon"].iconUrl = iconUrl;
			markersSet[name]["message"] = "<div>" + rec[5] + "<br/>"+ rec[2] + "<br/>"+ rec[7] + "<br/>" + rec[6];	
			//markersSet[name]["icon"]["iconAnchor"] =  [markersSet[name]["icon"].iconSize[0], 0], // point of the icon which will correspond to marker's location
			//markersSet[name]["icon"]["popupAnchor"] =  [0, 0]; // point from which the popup should open relative to the iconAnchor
		}
		if (length != 0)
		{
		$scope.markers = markersSet;
		
		}
	}

	angular.extend($scope, {
		center: {
			lat: 25.0391667,
			lng: 121.525,
			zoom: 3
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
	$scope.markers = {};
	$scope.updateMarkers($data);
}])