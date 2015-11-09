app.directive("imageClusterer",
	function (selectedImages) {
		return {
			restrict: "E",
			scope: {
				imageCoordinates: "=imagecoordinates"					
			},
			templateUrl: './views/imageClustererInnerView.html',
			 controller: function ($scope, selectedImages) {
		      $scope.selectedImages = selectedImages;
		      $scope.highlightedImageCount = 0;		      
		      $scope.selectSize = 2;  

		      $scope.changeSelectSize = function(obj) {
		      	var sizeChange = obj.target.attributes.size.value;
		      	console.log(sizeChange);
		      	if (sizeChange == "increase")
		      	{
		      		$scope.selectSize = $scope.selectSize < 3 ? $scope.selectSize + 1 : $scope.selectSize;
		      	}
		      	else if (sizeChange == "decrease")
		      	{
		      		$scope.selectSize = $scope.selectSize > 1 ? $scope.selectSize - 1 : $scope.selectSize;
		      	}
		      }
		     },

			link: function ($scope, elem, attr) {
				//init the 3d image clusterer with the image coordinates	
				//if ($scope.selectedImages.images.length == 0)
				//{
				if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

				var container, stats;
				var scene, renderer, particles, geometry, material, i, h, color, sprite, size, imagePlanes, raycaster, mouse, controls;
				var mouseX = 0, mouseY = 0, initRayCast = true;	

				
				init($scope.imageCoordinates)		
				animate();
				//}	
				function getWindowHeightAdjusted() {
					 return window.innerHeight - 45;
				}

				function init(imageCoords) {

					//add double click event 
					var timeoutId = 0;
					elem.dblclick(function(event) {
						event.preventDefault();				  
					  	$scope.selectedImages.images = _.pluck($scope.highlightedImages, "imgSrc");
					  	$scope.$apply();		  	
					  	//camera.position.set( new THREE.Vector3( 0, 0, 0 ) );
					  	$scope.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

					});

					THREE.ImageUtils.crossOrigin = ''; //allow loading of images from cross origin		
					container = elem.find("#container")[0];  //container for 3js

					$scope.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / getWindowHeightAdjusted(), 1, 10000 );
					$scope.camera.position.set( 0, 0, 50);
					$scope.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

					raycaster = new THREE.Raycaster();
					mouse = new THREE.Vector2();
					controls = new THREE.OrbitControls( $scope.camera );

					controls.rotateSpeed = 1.0;
					controls.zoomSpeed = 1.2;
					controls.panSpeed = 1.1;

					controls.noZoom = false;
					controls.noPan = false;

					controls.staticMoving = true;
					controls.dynamicDampingFactor = 0.3;

					controls.keys = [ 65, 83, 68 ];					

					//add fog to the scene to make images further back less vibrant
					scene = new THREE.Scene();
					scene.fog = new THREE.FogExp2( 0x353245, 0.02 );


					//add lighting to the scene
					var light;

					light = new THREE.DirectionalLight( 0xffffff );
					light.position.set( 1, 1, 1 );
					scene.add( light );

					light = new THREE.DirectionalLight( 0xffffff );
					light.position.set( -1, -1, -1 );
					scene.add( light );

					var ambientLight = new THREE.AmbientLight( 0xCCCCCC );
					scene.add(ambientLight);

					//setup the images and then add all images to the scene
					geometry = new THREE.Geometry();

					imagePlanes = new THREE.Object3D();
					scene.add( imagePlanes );

					//$scope.selectedImages.images = [];

					for (i = 0; i < 300; i++)
					{
						var bitmap = new Image();
						bitmap.src = '/assets/images/thumbnails/' + imageCoords[i].split("\t")[0]; // Pre-load the bitmap, in conjunction with the Start button, to avoid any potential THREE.ImageUtils.loadTexture async issues.
						bitmap.onerror = function () {
							console.error("Error loading: " + bitmap.src);
						}

						var texture = THREE.ImageUtils.loadTexture(bitmap.src); // Create texture object based on the given bitmap path.
						var material = new THREE.MeshPhongMaterial({ map: texture }); // Create a material (for the spherical mesh) that reflects light, potentially causing sphere surface shadows.						
						var plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);

						plane.position.x = imageCoords[i].split("\t")[1];
						plane.position.y = imageCoords[i].split("\t")[2];
						plane.position.z = imageCoords[i].split("\t")[3];
						plane.imgSrc = bitmap.src;
						
						imagePlanes.add(plane);
					}

					//setup the webgl rendering
					renderer = new THREE.WebGLRenderer({devicePixelRatio : 1, antialias: true});
					renderer.setClearColor( 0x252235);
					// set the size of the drawingBuffer
					//renderer.setPixelRatio( window.devicePixelRatio );
					renderer.setSize( window.innerWidth - 20, getWindowHeightAdjusted() - 83 );
					container.appendChild( renderer.domElement );

					// User interaction
					document.addEventListener( 'mousemove', onMouseMove, false );
					window.addEventListener( 'resize', onWindowResize, false );	
				}

				//resize the window
				function onWindowResize() {					
					$scope.camera.aspect = window.innerWidth / getWindowHeightAdjusted();
					$scope.camera.updateProjectionMatrix();
					renderer.setSize( window.innerWidth, getWindowHeightAdjusted() );
				}
				function onMouseMove( event ) {

					// calculate mouse position in normalized device coordinates
					// (-1 to +1) for both components

					mouse.realX = event.clientX + 10;
					mouse.realY = event.clientY - 50;

					mouse.x = ( mouse.realX / window.innerWidth ) * 2 - 1;
					mouse.y = - ( mouse.realY / getWindowHeightAdjusted() ) * 2 + 1;	
					//console.log(mouse.x.toString(), mouse.y.toString());				
				}

				//calculate the euclidean distance between two spaces
				function euclideanDistance(p, q)
				{
					p.x = ( p.x / window.innerWidth ) * 2 - 1;
					p.y = - ( p.y / getWindowHeightAdjusted() ) * 2 + 1;	
					return Math.sqrt(Math.pow(p.x - q.x, 2) + Math.pow(p.y - q.y, 2));
				}
				function euclideanDistance3D(loc1, loc2)
				{					
					return Math.sqrt(Math.pow(loc1.x - loc2.x, 2) + Math.pow(loc1.y - loc2.y, 2) + Math.pow(loc1.z - loc2.z, 2));
				}
				//project the image from 3d space to 2d coordinates
				function toScreenPosition(obj, camera)
				{
					var vector = new THREE.Vector3();

					var widthHalf = 0.5 * renderer.domElement.width;
					var heightHalf = 0.5 * renderer.domElement.height;

					obj.updateMatrixWorld(true);
					vector.setFromMatrixPosition(obj.matrixWorld);
					vector.project(camera);

					vector.x = ( vector.x * widthHalf ) + widthHalf;
					vector.y = - ( vector.y * heightHalf ) + heightHalf;
				    
				    return { 
				    	x: vector.x,
				    	y: vector.y
				    };

				}

				// When the destroy event is triggered, check to see if the above
                // data is still available.
                $scope.$on(
                    "$destroy",
                    function handleDestroyEvent() {
                        console.log( "destroy" );
                        cancelAnimationFrame($scope.requestId);

                        renderer.domElement.addEventListener('dblclick', null, false); //remove listener to render
					    scene = null;
					    projector = null;
					    camera = null;
					    controls = null;
					    renderer = null;
					    geometry = null;
					    imagePlanes = null;
					    $scope.camera = null;
					    empty(elem.find("#container")[0]);
                    }
                );

                function empty(elem) {
				    while (elem.lastChild) elem.removeChild(elem.lastChild);
				}

				function animate() {
					$scope.requestId = requestAnimationFrame( animate );	//three js speak to call the animate method every so often											
					
					//pass initial raycast because screen will be set with incorrect images selected
					if (!initRayCast)
					{			
						
						var euclideanDistances = [];  //array to hold the euclidean distances of all images to the mouse location

						//for each image, style the image and calculate the distance to the mouse
						imagePlanes.children.forEach(function(plane) {	
							//style the image					
							plane.lookAt( $scope.camera.position );
							plane.material.color.setRGB( .75, .75, .75 );
							plane.scale.set(1,1,1);
							
							//calculate the distance from the image to the mouse
							eucDist = euclideanDistance(toScreenPosition(plane, $scope.camera), {'x' : mouse.x, 'y' : mouse.y});	

							//if(eucDist < 1 / Math.sqrt(Math.abs($scope.camera.position.z))))
							var toSelect = false;

							var loc1 = {};
							loc1["x"] = $scope.camera.position.x;
							loc1["y"] = $scope.camera.position.y;
							loc1["z"] = $scope.camera.position.z;

							var loc2 = {};
							loc2["x"] = 0;
							loc2["y"] = 0;
							loc2["z"] = 0;

							var distFromOrigin = euclideanDistance3D(loc1 , loc2);

							toSelect = ((eucDist / 3) < (1 * $scope.selectSize) / (distFromOrigin + 2));							

							if (toSelect)
							{	
								euclideanDistances.push({"obj" : plane, "euc" :  eucDist });
							}											
						});

						// calculate objects intersecting the picking ray
						raycaster.setFromCamera( mouse, $scope.camera );
						var intersects = raycaster.intersectObjects( imagePlanes.children );

						//find the closest coordinate to the selected images.  If no image is interstected with, the closest z coordinate
						//to the images is the camera z coordinate
						var closestCoords = {};
						if (typeof(intersects) !== "undefined" && intersects.length > 0)
						{
							closestCoords["x"] = intersects[0].object.position.x, 
							closestCoords["y"] = intersects[0].object.position.y,
							closestCoords["z"] = intersects[0].object.position.z;														
						}
						else
						{
							closestCoords["x"] = $scope.camera.position.x, 
							closestCoords["y"] = $scope.camera.position.y,
							closestCoords["z"] = $scope.camera.position.z;							
						}
						
						//calculate the distance between the image z and the closest z
						euclideanDistances = _.map(euclideanDistances, function(ed) {
							var loc1 = {};
							loc1["x"] = ed.obj.position.x;
							loc1["y"] = ed.obj.position.y;
							loc1["z"] = ed.obj.position.z;

							return {"obj" : ed.obj, "threeDDist" : euclideanDistance3D(closestCoords, loc1)};
						});

						//sort the images by the z coordinates
						euclideanDistances = _.sortBy(euclideanDistances, "threeDDist");
						/*_.each(euclideanDistances, function(ed) {	
							euclideanDistances["closestObjDist"] = 
						});*/


						//if there are valid images within the range of the mouse grab the image with the closest z coordinate
						var closestObjCoords = null;
						if (euclideanDistances.length > 0)
						{						
							closestObjCoords = {};	
							closestObjCoords["x"] = euclideanDistances[0].obj.position.x;
							closestObjCoords["y"] = euclideanDistances[0].obj.position.y;
							closestObjCoords["z"] = euclideanDistances[0].obj.position.z;
						}
												
						//select the images that are within a certain distance from the mouse
						//and style them appropriately
						$scope.highlightedImages = [];
						if (closestObjCoords != null)
						{
							euclideanDistances.forEach(function(ed) {
								var loc1 = {};
								loc1["x"] = ed.obj.position.x;
								loc1["y"] = ed.obj.position.y;
								loc1["z"] = ed.obj.position.z;
							
								if(euclideanDistance3D(loc1, closestObjCoords) < 3 * $scope.selectSize)
								{
									$scope.highlightedImages.push(ed.obj);
									ed.obj.material.color.setRGB(1.0, .5, .5 );
									ed.obj.scale.set(1.5,1.5,1.5);
								}							
							});
						}	
						$scope.highlightedImageCount = $scope.highlightedImages.length;
						$scope.$apply();
					}

					initRayCast = false;
					controls.update();
					renderer.render( scene, $scope.camera );					
			}
		}		
	}
});