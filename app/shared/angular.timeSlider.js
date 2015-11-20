(function() {
    'use strict';

    angular.module('ui-timeSlider', []).directive('timeSlider', function() {
        var updateCurrentTime, updateEndTime, updateStartTime;
        updateStartTime = function(span, value) {
            var sd, startDate, startTime;
            sd = new Date(value);
            startDate = sd.toLocaleDateString();
            startTime = sd.toLocaleTimeString();
            return span.innerHTML = startDate.trim();
        };
        updateEndTime = function(span, value) {
            var ed, endDate, endTime;
            ed = new Date(value);
            endDate = ed.toLocaleDateString();
            endTime = ed.toLocaleTimeString();
            return span.innerHTML = endDate;
        };
        updateCurrentTime = function(span, value) {
            var cd, curDate, curTime;
            cd = new Date(value);
            curDate = cd.toLocaleDateString();
            curTime = cd.toLocaleTimeString();
            return span.innerHTML = curDate;
        };
        return {
            template: "<div style='margin-top:25px;'>" +
                "<input type='range'></input>" +
                "<span class='startTime'></span>" +
                "<span class='endTime'></span>" +
                "<div style='position:absolute;top:-30px' class='curTime'><span></span></div></div>",
            restrict: 'E',
            scope: {
                min: '=',
                max: '=',
                curtime: '=',
                callback: '='
            },
            link: function(scope, element, attrs) {
                var adjusting, curTimeDiv, moveCurTimeDiv, rangeInput, rangeInputElement, rangeInputOffset, spans;
                rangeInput = element.find('input')[0];
                rangeInputElement = angular.element(rangeInput);
                spans = element.find('span');
                curTimeDiv = element.find('div')[1];
                rangeInputOffset = $(rangeInput).offset();
                adjusting = false;
                rangeInput.min = scope.min;
                rangeInput.max = scope.max;
                rangeInput.step = attrs.step;
                rangeInput.value = scope.min;
                updateStartTime(spans[0], rangeInput.min);
                updateEndTime(spans[1], rangeInput.max);
                moveCurTimeDiv = function(curValue) {
                    console.log(curValue);
                    var ctdElement, curPercentage, curValueLocation;
                    curPercentage = (curValue - scope.min) / (scope.max - scope.min);
                    curValueLocation = (rangeInput.clientWidth * curPercentage) - 25; // + rangeInputOffset.left;
                    ctdElement = angular.element(curTimeDiv);
                    ctdElement.css('left', curValueLocation + 'px');
                    return ctdElement.css('top', rangeInput.clientHeight - curTimeDiv.clientHeight + 'px');
                };
                rangeInputElement.bind('change', function(event) {
                    var curValue;
                    adjusting = true;
                    curValue = parseInt(event.target.value);
                    updateCurrentTime(spans[2], curValue);
                    return moveCurTimeDiv(curValue);
                });
                rangeInputElement.bind('mouseup', function(event) {
                    adjusting = false;
                    return scope.callback.call(this, parseInt(event.target.value));
                });
                scope.$watch('curtime', function(newValue, oldValue) {
                    var curValue;
                    adjusting = true;
                    curValue = parseInt(newValue);
                    rangeInput.value = curValue;
                    updateCurrentTime(spans[2], curValue);
                    return moveCurTimeDiv(curValue);
                });
                scope.$watch('min', function(newValue, oldValue) {
                    updateStartTime(spans[0], parseInt(newValue));
                    rangeInput.min = scope.min;
                    rangeInput.value = scope.min;
                    return spans[2].innerHTML = '';
                });
                return scope.$watch('max', function(newValue, oldValue) {
                    updateEndTime(spans[1], parseInt(newValue));
                    return rangeInput.max = scope.max;
                });
            }
        };
    });

}).call(this);