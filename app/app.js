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

            var componentsPath = 'views';
            var sharedPath = 'views/';
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
                .state('home.3dClusterer', {
                    url: '3dClusterer',
                    views: {
                        'main@home': {
                            templateUrl: componentsPath + '/threeDimMediaClustererView.html',
                            controller: 'threeDimMediaClustererCtrl',
                            controllerAs: 'vm',
                            resolve: {
                                webServiceRef: "mediaFactory",
                                media: function(webServiceRef) {
                                    return webServiceRef.getMedia();
                                }
                            }
                        }
                    }
                })
                .state('home.geo', {
                    url: 'geo',
                    views: {
                        'main@home': {
                            templateUrl: componentsPath + '/mediaGeoView.html',
                            controller: 'mediaGeoCtrl',
                            controllerAs: 'vm'
                        }
                    }
                })
                .state('home.labeledgeo', {
                    url: 'labeledgeo',
                    views: {
                        'main@home': {
                            templateUrl: componentsPath + '/labeledMediaGeoView.html',
                            controller: 'labeledMediaGeoCtrl',
                            resolve: {
                                webServiceRef: "labeledMediaFactory",
                                labeledMedia: function(webServiceRef) {
                                    return webServiceRef.getLabeledMedia("example_media");
                                }
                            }
                        }
                    }
                })
                .state('home.shiptracker', {
                    url: 'shiptracker',
                    views: {
                        'main@home': {
                            templateUrl: componentsPath + '/shipTrackerView.html',
                            controller: 'shipTrackerCtrl',
                            resolve: {
                                webServiceRef: "shipsFactory",
                                ships: function(webServiceRef) {
                                    return webServiceRef.getShips();
                                }
                            }
                        }
                    }
                });
        }
    ]);

angular.module('socialMediaExplorerApp').constant('APP_CONFIG', {
    baseImageUrl: 'assets/images/',
    baseDataUrl: 'assets/data/',
    mediaThumbnailUrl: 'assets/images/thumbnails/',
    shipsFactoryFilename: 'ships.json',
    mediaFactoryFilename: 'media.csv',
    labeledMediaFactoryFilename: 'media.csv'
});