(function() {

    'use strict';

    angular
        .module('socialMediaExplorerApp')
        .directive("threeDimMediaClusterer", [threedDimMediaClustererDirective]);

    function threedDimMediaClustererDirective(selectedMediaFactory) {
        return {
            restrict: "E",
            scope: {
                media: "=media"
            },
            templateUrl: 'views/threeDimMediaClustererInnerView.html',
            link: link,
            controller: controller,
            controllerAs: 'vm',
            bindToController: true
        };

        function controller($scope, selectedMediaFactory) {
            var vm = this;

            //scope variables to display for general information
            //the currently selected images
            vm.selectedMedia = selectedMediaFactory;
            //the amount of media currently highlighted (media are highlighted via proximity to mouse)
            vm.highlightedMediaCount = 0;
            //the size of the select range, currently can range from 1 to 3.  
            //Alters the proximity of media highlighted and selected in relation to the mouse
            vm.selectSize = 2;

            //changes the select size based on the object passed to the function
            //1 is the min select size
            //3 is the max select size
            vm.changeSelectSize = function(obj) {
                var sizeChange = obj.target.attributes.size.value; //get the selected object sizeChange value (increase or decrease)	      	
                if (sizeChange.toLowerCase() == "increase") {
                    vm.selectSize = vm.selectSize < 3 ? vm.selectSize + 1 : vm.selectSize;
                } else if (sizeChange.toLowerCase() == "decrease") {
                    vm.selectSize = vm.selectSize > 1 ? vm.selectSize - 1 : vm.selectSize;
                }
            }
        }

        function link($scope, elem, attr) {
            //init the 3d media clusterer with the media coordinates	
            if (!Detector.webgl) Detector.addGetWebGLMessage();

            var vm = $scope.vm;
            var container, stats;
            var scene, renderer, particles, geometry, material, i, h, color, sprite, size, mediaPlanes, raycaster, mouse, controls;
            var mouseX = 0,
                mouseY = 0,
                initRayCast = true;

            createWorld(vm.media);
            animateWorld();

            // When the destroy event is triggered, check to see if the above
            // data is still available.
            $scope.$on(
                "$destroy",
                function handleDestroyEvent() {
                    cancelAnimationFrame(vm.requestId);
                    renderer.domElement.addEventListener('dblclick', null, false); //remove listener to render
                    scene, camera, controls, renderer, geometry, mediaPlanes, vm.camera = null;
                    empty(elem.find("#container")[0]);

                    function empty(elem) {
                        while (elem.lastChild) elem.removeChild(elem.lastChild);
                    }
                }
            );

            function createWorld(media) {

                __createScene__();

                function __createScene__() {
                    THREE.ImageUtils.crossOrigin = ''; //allow loading of media from cross origin      
                    container = elem.find("#container")[0]; //container for 3js

                    vm.camera = new THREE.PerspectiveCamera(45, window.innerWidth / getWindowHeightAdjusted(), 1, 10000);
                    vm.camera.position.set(0, 0, 50);
                    vm.camera.lookAt(new THREE.Vector3(0, 0, 0));

                    raycaster = new THREE.Raycaster();
                    mouse = new THREE.Vector2();
                    controls = new THREE.OrbitControls(vm.camera, container);

                    controls.rotateSpeed = 1.0;
                    controls.zoomSpeed = 1.2;
                    controls.panSpeed = 1.1;

                    controls.noZoom = false;
                    controls.noPan = false;

                    controls.staticMoving = true;
                    controls.dynamicDampingFactor = 0.3;

                    controls.keys = [65, 83, 68];

                    //add fog to the scene to make images further back less vibrant
                    scene = new THREE.Scene();
                    scene.fog = new THREE.FogExp2(0x353245, 0.02);

                    //add lighting to the scene
                    var light;

                    light = new THREE.DirectionalLight(0xffffff);
                    light.position.set(1, 1, 1);
                    scene.add(light);

                    light = new THREE.DirectionalLight(0xffffff);
                    light.position.set(-1, -1, -1);
                    scene.add(light);

                    var ambientLight = new THREE.AmbientLight(0xCCCCCC);
                    scene.add(ambientLight);

                    //setup the images and then add all images to the scene
                    geometry = new THREE.Geometry();

                    mediaPlanes = __createMediaPlanes__(media);
                    scene.add(mediaPlanes);

                    //setup the webgl rendering
                    renderer = new THREE.WebGLRenderer({
                        devicePixelRatio: 1,
                        antialias: true
                    });

                    renderer.setClearColor(0x252235);

                    // set the size of the drawingBuffer                    
                    renderer.setSize(window.innerWidth - 20, getWindowHeightAdjusted() - 83);
                    container.appendChild(renderer.domElement);

                    // User interaction
                    document.addEventListener('mousemove', onMouseMove, false);
                    window.addEventListener('resize', onWindowResize, false);

                    function __createMediaPlanes__(media) {
                        var planes = new THREE.Object3D();
                        var maxMediaToShow = 300; //max size set to an amount of media that won't crush the user's browser
                        var amtMediaToShow = media.getCount() > maxMediaToShow ? maxMediaToShow : media.getCount();

                        for (i = 0; i < amtMediaToShow; i++) {
                            var bitmap = new Image();
                            bitmap.src = media.getMediaUrl(i); // Pre-load the bitmap, in conjunction with the Start button, to avoid any potential THREE.ImageUtils.loadTexture async issues.
                            bitmap.onerror = function() {
                                console.error("Error loading: " + bitmap.src);
                            }

                            var texture = THREE.ImageUtils.loadTexture(bitmap.src); // Create texture object based on the given bitmap path.
                            texture.minFilter = THREE.LinearFilter
                            var material = new THREE.MeshPhongMaterial({
                                map: texture
                            }); // Create a material (for the spherical mesh) that reflects light, potentially causing sphere surface shadows.                      
                            var plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);

                            plane.position.x = media.getXCoordinate(i);
                            plane.position.y = media.getYCoordinate(i);
                            plane.position.z = media.getZCoordinate(i);
                            plane.imgSrc = bitmap.src;

                            planes.add(plane);
                        }
                        return planes;
                    }

                    //EVENTS 
                    //resize the window
                    function onWindowResize() {
                        vm.camera.aspect = window.innerWidth / getWindowHeightAdjusted();
                        vm.camera.updateProjectionMatrix();
                        renderer.setSize(window.innerWidth, getWindowHeightAdjusted());
                    }

                    function onMouseMove(event) {
                        // calculate mouse position in normalized device coordinates
                        // (-1 to +1) for both components
                        mouse.realX = event.clientX + 10;
                        mouse.realY = event.clientY - 50;

                        mouse.x = (mouse.realX / window.innerWidth) * 2 - 1;
                        mouse.y = -(mouse.realY / getWindowHeightAdjusted()) * 2 + 1;
                    }

                    elem.dblclick(function(event) {
                        event.preventDefault();
                        vm.selectedMedia.media = _.pluck(vm.highlightedMedia, "imgSrc");
                        $scope.$apply();
                        vm.camera.lookAt(new THREE.Vector3(0, 0, 0));
                    });
                }


            } //end init function

            function animateWorld() {

                vm.requestId = requestAnimationFrame(animateWorld); //three js speak to call the animate method every so often                                           

                //pass initial raycast because screen will be set with incorrect media selected
                if (!initRayCast) {
                    __styleObjects__(mediaPlanes, vm.camera, vm.selectSize);
                }

                initRayCast = false;
                controls.update();
                renderer.render(scene, vm.camera);

                function __styleObjects__(objects, camera, selectSize) {
                    var selectedObjects = []; //array to hold the euclidean distances of all media to the mouse location

                    //for each media, style the media and calculate the distance to the mouse
                    objects.children.forEach(function(obj) {
                        //style the image                   
                        styleUnselectedObject(obj);

                        var toSelect = toSelectObject(obj, camera, selectSize);

                        if (toSelect) {
                            selectedObjects.push({
                                "obj": obj
                            });
                        }
                    });

                    //closestCoords is equal to the closest coordinates intersecting the mouse.
                    //if no object is intersecting with the mouse, the camera coordinates are returned
                    var closestCoords = getClosestIntersectingObjCoords(mouse, camera, objects.children) != null ?
                        getClosestIntersectingObjCoords(mouse, camera, objects.children) : {
                            x: vm.camera.position.x,
                            y: vm.camera.position.y,
                            z: vm.camera.position.z
                        };

                    //calculate the distance between the selected objects and the closest coordinates
                    var distances = getObjectAndCoordsDist(selectedObjects, closestCoords);

                    //sort the media by the distance
                    distances = _.sortBy(distances, "dist3D");

                    //get the coordinates of the closest object
                    var closestObjCoords = null;
                    if (distances.length > 0) {
                        closestObjCoords = {
                            x: distances[0].obj.position.x,
                            y: distances[0].obj.position.y,
                            z: distances[0].obj.position.z
                        }
                    }

                    //select the object that are within a certain distance from the closest selectable coordinates
                    //and style them appropriately
                    vm.highlightedMedia = [];

                    //if an object existed in distance that is within a selectable range
                    if (closestObjCoords != null) {
                        distances.forEach(function(obj) {
                            var objPosition = {
                                x: obj.obj.position.x,
                                y: obj.obj.position.y,
                                z: obj.obj.position.z
                            }
                            if (euclideanDistance3D(objPosition, closestObjCoords) < 3 * vm.selectSize) {
                                vm.highlightedMedia.push(obj.obj);
                                styleSelectedObject(obj);
                            }
                        });
                    }
                    vm.highlightedMediaCount = vm.highlightedMedia.length;
                    $scope.$apply();
                }

                function styleUnselectedObject(plane) {
                    plane.lookAt(vm.camera.position);
                    plane.material.color.setRGB(.75, .75, .75);
                    plane.scale.set(1, 1, 1);
                }

                function styleSelectedObject(obj) {
                    obj.obj.material.color.setRGB(1.0, .5, .5);
                    obj.obj.scale.set(1.5, 1.5, 1.5);
                }

                function toSelectObject(obj, camera, selectSize) {
                    //calculate the distance from the media to the mouse
                    var distMouseToPlane = euclideanDistance(toScreenPosition(obj, camera), {
                        'x': mouse.x,
                        'y': mouse.y
                    });

                    //the current position of the camera
                    var cameraPosition = {
                        x: camera.position.x,
                        y: camera.position.y,
                        z: camera.position.z
                    };

                    //the position of the origin
                    var originPosition = {
                        x: 0,
                        y: 0,
                        z: 0
                    };

                    //calculate the distance of the camera from the origin
                    var cameraDistFromOrigin = euclideanDistance3D(cameraPosition, originPosition);

                    //toSelectPlane determines if the plane should be selected based on the distance of the mouse to this plane
                    //if its distance is less than the selectSize as chosen by the user or set by default scaled by the distance 
                    //the camera from the origin (the distance between planes and the mouse becomes smaller the further the camera
                    //is from the origin)
                    var toSelect = (distMouseToPlane / 3) < (selectSize / (cameraDistFromOrigin + 2));

                    return toSelect;
                }

                function getClosestIntersectingObjCoords(mouse, camera, objects) {
                    // calculate planes intersecting the picking ray
                    raycaster.setFromCamera(mouse, camera);
                    var intersects = raycaster.intersectObjects(objects, true);

                    //set closest coords equal to an intertersecting plane or the camera if no intersection is found
                    if (typeof(intersects) !== "undefined" && intersects.length > 0) {
                        return {
                            x: intersects[0].object.position.x,
                            y: intersects[0].object.position.y,
                            z: intersects[0].object.position.z
                        }
                    } else {
                        return null;
                    }
                }

                function getObjectAndCoordsDist(objects, coords) {
                    return _.map(objects, function(obj) {
                        var objectPosition = {
                            x: obj.obj.position.x,
                            y: obj.obj.position.y,
                            z: obj.obj.position.z
                        };

                        return {
                            "obj": obj.obj,
                            "dist3D": euclideanDistance3D(coords, objectPosition)
                        };
                    });
                }

                //calculate the euclidean distance between two spaces
                function euclideanDistance(p, q) {
                    p.x = (p.x / window.innerWidth) * 2 - 1;
                    p.y = -(p.y / getWindowHeightAdjusted()) * 2 + 1;
                    return Math.sqrt(Math.pow(p.x - q.x, 2) + Math.pow(p.y - q.y, 2));
                }

                function euclideanDistance3D(loc1, loc2) {
                    return Math.sqrt(Math.pow(loc1.x - loc2.x, 2) + Math.pow(loc1.y - loc2.y, 2) + Math.pow(loc1.z - loc2.z, 2));
                }
                //project the media from 3d space to 2d coordinates
                function toScreenPosition(obj, camera) {
                    var vector = new THREE.Vector3();

                    var widthHalf = 0.5 * renderer.domElement.width;
                    var heightHalf = 0.5 * renderer.domElement.height;

                    obj.updateMatrixWorld(true);
                    vector.setFromMatrixPosition(obj.matrixWorld);
                    vector.project(camera);

                    vector.x = (vector.x * widthHalf) + widthHalf;
                    vector.y = -(vector.y * heightHalf) + heightHalf;

                    return {
                        x: vector.x,
                        y: vector.y
                    };
                }
            }

            function getWindowHeightAdjusted() {
                return window.innerHeight - 45;
            }
        }
    }
})();