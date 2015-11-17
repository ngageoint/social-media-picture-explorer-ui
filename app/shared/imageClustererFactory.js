(function() {

    'use strict';

    angular
        .module('socialMediaExplorerApp')
        .factory('imageClustererFactory', [returnViewerImageClusterer]);

    function returnViewerImageClusterer() {
        return new ViewerImageClusterer();
    }

    function ViewerImageClusterer() {

        this.camera = null;
        this.selectedImages = null;
        this.highlightedImageCount = null;


        var scene, renderer, particles, geometry, camera, material, i, h, color, sprite, size, imagePlanes, raycaster, mouse, controls;
        var mouseX = 0,
            mouseY = 0,
            initRayCast = true;

        this.init = function() {}

        /* Public Methods */
        this.CreateWorld = function(imageCoords, container) {
            THREE.ImageUtils.crossOrigin = ''; //allow loading of images from cross origin      
            //set camera
            Cameras();

            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();

            controls = new THREE.OrbitControls(camera, container);

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
            Lights();

            //add lighting to the scene
            //setup the images and then add all images to the scene
            geometry = new THREE.Geometry();

            imagePlanes = Objects(imageCoords);
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
            Listeners();
        }

        this.AnimateWorld = function(selectSize) {
            //pass initial raycast because screen will be set with incorrect images selected
            if (!initRayCast) {
                styleObjects(imagePlanes, camera, selectSize);
            }

            initRayCast = false;
            controls.update();
            renderer.render(scene, camera);
        }

        this.Destroy = function(requestId, container) {
            window.cancelAnimationFrame(requestId);
            renderer.domElement.addEventListener('dblclick', null, false); //remove listener to render
            scene, camera, controls, renderer, geometry, imagePlanes = null;
            empty(container);

            function empty(elem) {
                while (elem.lastChild) elem.removeChild(elem.lastChild);
            }
        }

        var Cameras = function() {
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / getWindowHeightAdjusted(), 1, 10000);
            camera.position.set(0, 0, 50);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
        }

        var Listeners = function() {
            document.addEventListener('mousemove', onMouseMove, false);
            window.addEventListener('resize', onWindowResize, false);
            //EVENTS 
            //resize the window
            function onWindowResize() {
                camera.aspect = window.innerWidth / getWindowHeightAdjusted();
                camera.updateProjectionMatrix();
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

            /*  container.dblclick(function(event) {
                event.preventDefault();
                selectedImages.images = _.pluck(highlightedImages, "imgSrc");
                $scope.$apply();
                camera.lookAt(new THREE.Vector3(0, 0, 0));
            });*/
        }

        var Lights = function() {
            var light;

            light = new THREE.DirectionalLight(0xffffff);
            light.position.set(1, 1, 1);
            scene.add(light);

            light = new THREE.DirectionalLight(0xffffff);
            light.position.set(-1, -1, -1);
            scene.add(light);

            var ambientLight = new THREE.AmbientLight(0xCCCCCC);
            scene.add(ambientLight);
        }

        var Objects = function(data) {
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

        var styleObjects = function(objects, camera, selectSize) {
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
                    x: camera.position.x,
                    y: camera.position.y,
                    z: camera.position.z
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
            var highlightedImages = [];

            //if an object existed in distance that is within a selectable range
            if (closestObjCoords != null) {
                distances.forEach(function(obj) {
                    var objPosition = {
                        x: obj.obj.position.x,
                        y: obj.obj.position.y,
                        z: obj.obj.position.z
                    }
                    if (euclideanDistance3D(objPosition, closestObjCoords) < 3 * selectSize) {
                        highlightedImages.push(obj.obj);
                        styleSelectedObject(obj);
                    }
                });
            }
            var highlightedImageCount = highlightedImages.length;

        }

        var styleUnselectedObject = function(plane) {
            plane.lookAt(camera.position);
            plane.material.color.setRGB(.75, .75, .75);
            plane.scale.set(1, 1, 1);
        }

        var styleSelectedObject = function(obj) {
            obj.obj.material.color.setRGB(1.0, .5, .5);
            obj.obj.scale.set(1.5, 1.5, 1.5);
        }

        var toSelectObject = function(obj, camera, selectSize) {
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

        var getClosestIntersectingObjCoords = function(mouse, camera, objects) {
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

        var getObjectAndCoordsDist = function(objects, coords) {
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
        var euclideanDistance = function(p, q) {
            p.x = (p.x / window.innerWidth) * 2 - 1;
            p.y = -(p.y / getWindowHeightAdjusted()) * 2 + 1;
            return Math.sqrt(Math.pow(p.x - q.x, 2) + Math.pow(p.y - q.y, 2));
        }

        var euclideanDistance3D = function(loc1, loc2) {
                return Math.sqrt(Math.pow(loc1.x - loc2.x, 2) + Math.pow(loc1.y - loc2.y, 2) + Math.pow(loc1.z - loc2.z, 2));
            }
            //project the image from 3d space to 2d coordinates
        var toScreenPosition = function(obj, camera) {
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
        var getWindowHeightAdjusted = function() {
            return window.innerHeight - 45;
        }
        this.AnimateWorld.bind(this);
    }

})();