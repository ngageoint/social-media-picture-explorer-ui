(function() {

    'use strict';

    angular
        .module('socialMediaExplorerApp')
        .directive("imageClusterer", [imageClustererDirective]);

    function imageClustererDirective(selectedImages) {
        return {
            restrict: "E",
            scope: {
                imageCoordinates: "=imagecoordinates"
            },
            templateUrl: './views/imageClustererInnerView.html',
            link: link,
            controller: controller,
            controllerAs: 'vm',
            bindToController: true
        };

        function controller($scope, selectedImages) {
            var vm = this;
            //scope variables to display for general information
            vm.selectedImages = selectedImages;
            vm.highlightedImageCount = 0;
            vm.selectSize = 2; //the size of the select range, currently can range from 1 to 3

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
            //init the 3d image clusterer with the image coordinates	
            if (!Detector.webgl) Detector.addGetWebGLMessage();

            var vm = $scope.vm;
            var container, stats;
            var scene, renderer, particles, geometry, material, i, h, color, sprite, size, imagePlanes, raycaster, mouse, controls;
            var mouseX = 0,
                mouseY = 0,
                initRayCast = true;

            createWorld(vm.imageCoordinates);
            animateWorld();

            // When the destroy event is triggered, check to see if the above
            // data is still available.
            $scope.$on(
                "$destroy",
                function handleDestroyEvent() {
                    cancelAnimationFrame(vm.requestId);
                    renderer.domElement.addEventListener('dblclick', null, false); //remove listener to render
                    scene, camera, controls, renderer, geometry, imagePlanes, vm.camera = null;
                    empty(elem.find("#container")[0]);

                    function empty(elem) {
                        while (elem.lastChild) elem.removeChild(elem.lastChild);
                    }
                }


            );

            function createWorld(imageCoords) {

                __createScene__();

                function __createScene__() {
                    THREE.ImageUtils.crossOrigin = ''; //allow loading of images from cross origin      
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

                    imagePlanes = __createImagePlanes__(imageCoords);
                    scene.add(imagePlanes);

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

                    function __createImagePlanes__(data) {
                        var planes = new THREE.Object3D();
                        for (i = 0; i < 300; i++) {
                            var bitmap = new Image();
                            bitmap.src = '/assets/images/thumbnails/' + data[i].split("\t")[0]; // Pre-load the bitmap, in conjunction with the Start button, to avoid any potential THREE.ImageUtils.loadTexture async issues.
                            bitmap.onerror = function() {
                                console.error("Error loading: " + bitmap.src);
                            }

                            var texture = THREE.ImageUtils.loadTexture(bitmap.src); // Create texture object based on the given bitmap path.
                            texture.minFilter = THREE.LinearFilter
                            var material = new THREE.MeshPhongMaterial({
                                map: texture
                            }); // Create a material (for the spherical mesh) that reflects light, potentially causing sphere surface shadows.                      
                            var plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);

                            plane.position.x = data[i].split("\t")[1];
                            plane.position.y = data[i].split("\t")[2];
                            plane.position.z = data[i].split("\t")[3];
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
                        vm.selectedImages.images = _.pluck(vm.highlightedImages, "imgSrc");
                        $scope.$apply();
                        vm.camera.lookAt(new THREE.Vector3(0, 0, 0));
                    });
                }


            } //end init function

            function animateWorld() {

                vm.requestId = requestAnimationFrame(animateWorld); //three js speak to call the animate method every so often                                           

                //pass initial raycast because screen will be set with incorrect images selected
                if (!initRayCast) {
                    __styleObjects__(imagePlanes, vm.camera, vm.selectSize);
                }

                initRayCast = false;
                controls.update();
                renderer.render(scene, vm.camera);

                function __styleObjects__(objects, camera, selectSize) {
                    var selectedObjects = []; //array to hold the euclidean distances of all images to the mouse location

                    //for each image, style the image and calculate the distance to the mouse
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

                    //sort the images by the distance
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
                    vm.highlightedImages = [];

                    //if an object existed in distance that is within a selectable range
                    if (closestObjCoords != null) {
                        distances.forEach(function(obj) {
                            var objPosition = {
                                x: obj.obj.position.x,
                                y: obj.obj.position.y,
                                z: obj.obj.position.z
                            }
                            if (euclideanDistance3D(objPosition, closestObjCoords) < 3 * vm.selectSize) {
                                vm.highlightedImages.push(obj.obj);
                                styleSelectedObject(obj);
                            }
                        });
                    }
                    vm.highlightedImageCount = vm.highlightedImages.length;
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
                    //calculate the distance from the image to the mouse
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
                //project the image from 3d space to 2d coordinates
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