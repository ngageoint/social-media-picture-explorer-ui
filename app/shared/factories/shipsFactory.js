(function() {

    'use strict';

    angular
        .module('socialMediaExplorerApp')
        .factory('shipsFactory', ['$http', 'APP_CONFIG', shipsFactory]);

    function shipsFactory($http, APP_CONFIG) {
        function ships(shipData) {
            if (shipData) {
                this.setData(shipData);
            }
        }
        ships.prototype = {
            setData: function(shipData) {
                this.data = shipData;
                this.mmsiIdx = 0;
                this.dateIdx = 1;
                this.statusIdx = 2;
                this.latitudeIdx = 3;
                this.longitudeIdx = 4;
                this.shipnameIdx = 5;
                this.typeIdx = 6;
                this.nameIdx = 7;
                this.countryIdx = 8;
                this.imoIdx = 9;
                this.yobIdx = 10;
                this.gtIdx = 11;
                this.loaIdx = 12
                this.beamIdx = 13;
                this.shiptypeIdx = 14;
                this.dwtIdx = 15;
                this.type2Idx = 16;
                this.summaryIdx = 17;
                this.prevIdx = 18;
                this.portIdx = 19;
                this.nextPortIdx = 20;
                this.pathToMedia = APP_CONFIG.baseImageUrl;
            },
            getRowAsArray: function(idx) {
                return this.data[idx];
            },
            get: function(idx, varIdx) {
                return this.getRowAsArray(idx)[varIdx];
            },
            getId: function(idx) {
                return this.get(idx, this.mmsiIdx).toString();
            },
            getDate: function(idx) {
                return this.get(idx, this.dateIdx);
            },
            getLatitude: function(idx) {
                return parseFloat(this.get(idx, this.latitudeIdx));
            },
            getLongitude: function(idx) {
                return parseFloat(this.get(idx, this.longitudeIdx));
            },
            getStatus: function(idx) {
                return this.get(idx, this.statusIdx);
            },
            getShipname: function(idx) {
                return this.get(idx, this.shipnameIdx);
            },
            getType: function(idx) {
                return this.get(idx, this.typeIdx);
            },
            getCount: function() {
                return this.data.length;
            },
            //get the min and max dates from the data
            getMinMaxDates: function(data) {
                var min = null,
                    max = 0;

                //search through all of the data for the min and max dates
                _.each(this.data, function(elem) {
                    min = (min == null || elem[1] < min) ? elem[1] : min;
                    max = elem[1] > max ? elem[1] : max;
                });

                return {
                    min: min,
                    max: max
                };
            },
            getShipIconUrl: function(idx) {
                var iconUrl = APP_CONFIG.baseImageUrl + "shipgreen.png";
                var status = this.getStatus(idx).toLowerCase();
                if (status == "at anchor" || status == "moored" || status == "not under command") {
                    iconUrl = APP_CONFIG.baseImageUrl + "shipred.png";
                }

                return iconUrl;
            },
            //get the unique values for a column
            getUniqueColValues: function(idx) {
                var vals = [];
                //loop through all rows of data
                for (var i = 0; i < this.data.length; i++) {
                    var val = this.data[i][idx]; //current row col val
                    if (_.findWhere(vals, {
                        'label': val
                    }) == undefined) {
                        vals.push({
                            'id': vals.length,
                            'label': val
                        });
                    }
                }
                return vals;
            }
        }
        return {
            getShips: function() {
                return $http({
                    url: APP_CONFIG.baseDataUrl + APP_CONFIG.shipsFactoryFilename,
                    method: "GET",
                    cache: true
                }).then(function(response) {
                    return new ships(response.data);
                });
            },
            setShips: function(data) {
                return new ships(data);
            }
        }
    }
})();