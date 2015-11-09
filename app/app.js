/*global angular */
'use strict';

var app = angular.module('imageClustererApp', [
  'ui.bootstrap',
  'ui.router', 
  'ui-timeSlider', 
  'angularjs-dropdown-multiselect',
  'angular-underscore', 
//  'angulike', 
  'leaflet-directive'
  ]);


app
.run(['$rootScope', '$window',
  function($rootScope, $window) { }])

.config(
  ['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

      var componentsPath = './views';
      var sharedPath = './views/';
      // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
      $urlRouterProvider
        // If the url is ever invalid, e.g. '/asdf', then redirect to '/home' aka the home state
        .otherwise('/');
      // Use $stateProvider to configure your states.
      $stateProvider

      .state('home', {
        url: '/',          
        views: {   
          'app': {
            templateUrl: sharedPath + 'main.html'
          }          
        }         
        })
      .state('home.nga', {
        url: '/',          
        views: {   
          'main@home': {
            templateUrl: componentsPath + 'ngalogo/nga/ngaView.html',            
          }          
        }         
        })
      .state('home.imagecluster', {
        url: 'imagecluster',
        views: {          
          'main@home': {
            templateUrl: componentsPath + '/imageClustererView.html',
            controller: 'imageClustererCtrl',
            persist: true,
             resolve: {               
              webServicesString: "webServicesLocal",
              imageCoords: function(webServicesString){
                    return webServicesString.getImageCoordinates().then(function (response) {
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
            templateUrl: componentsPath + '/imageclusterermapView.html',
            controller: 'mapCtrl'              
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
              imageMap: function(webServicesString){
                    return webServicesString.getImageMap("cargo_helicopter").then(function (response) {
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
              data: function(webServicesString){
                    return webServicesString.getShippingData().then(function (response) {
                      return response.data;
                    });
                  }  
                }                  
            }          
         }
      });
    }]);