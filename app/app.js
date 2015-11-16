/*global angular */
'use strict';

angular
    .module('socialMediaExplorerApp', [
        'ui.bootstrap',
        'ui.router',
        'ui-timeSlider',
        'angularjs-dropdown-multiselect',
        'angular-underscore',
        'leaflet-directive'
    ]);


angular
    .module('socialMediaExplorerApp')
    .run(['$rootScope', '$window',
        function($rootScope, $window) {}
    ])

.config(
    ['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

            var componentsPath = './views';
            var sharedPath = './views/';
            // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).     
            $urlRouterProvider.otherwise('/');
            // Use $stateProvider to configure your states.
            $stateProvider
                .state('home', {
                    url: '/',
                    views: {
                        '': {
                            templateUrl: sharedPath + 'main.html'
                        },
                        'main@home': {
                            templateUrl: componentsPath + '/ngaView.html',
                        }
                    }
                })
                .state('home.nga', {
                    url: 'nga',
                    views: {
                        'main@home': {
                            templateUrl: componentsPath + '/ngaView.html',
                        }
                    }
                })
                .state('home.imagecluster', {
                    url: 'imagecluster',
                    views: {
                        'main@home': {
                            templateUrl: componentsPath + '/imageClustererView.html',
                            controller: 'imageClustererCtrl',
                            controllerAs: 'vm',
                            resolve: {
                                webServicesString: "webServicesLocal",
                                imageCoords: function(webServicesString) {
                                    return webServicesString.getImageCoordinates().then(function(response) {
                                        return response.data;
                                    });
                                }
                            }
                        }
                    }
                })
                .state('home.map', {
                    url: 'map',
                    views: {
                        'main@home': {
                            templateUrl: componentsPath + '/imageclusterermapInnerView.html',
                            controller: 'imageClustererMapCtrl',
                            controllerAs: 'vm'
                        }
                    }
                })
                .state('home.labelledmap', {
                    url: 'labelledmap',
                    views: {
                        'main@home': {
                            templateUrl: componentsPath + '/labeledimagesmapView.html',
                            controller: 'labelledMapCtrl',
                            resolve: {
                                webServicesString: "webServicesLocal",
                                imageMap: function(webServicesString) {
                                    return webServicesString.getImageMap("cargo_helicopter").then(function(response) {
                                        return response.data;
                                    });
                                }
                            }
                        }
                    }
                })
                .state('home.shiptracker', {
                    url: 'shiptracker',
                    views: {
                        'main@home': {
                            templateUrl: componentsPath + '/shiptrackerView.html',
                            controller: 'shipTrackerCtrl',
                            resolve: {
                                webServicesString: "webServicesLocal",
                                data: function(webServicesString) {
                                    return webServicesString.getShippingData().then(function(response) {
                                        return response.data;
                                    });
                                }
                            }
                        }
                    }
                });
        }
    ]);