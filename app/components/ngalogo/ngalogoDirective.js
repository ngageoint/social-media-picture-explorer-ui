(function() {

    'use strict';
    angular
        .module('socialMediaExplorerApp')
        .directive('nga', ['$rootScope', '$state', ngaLogoDirective]);


    function ngaLogoDirective($rootScope, $state) {
        return {
            restrict: 'E',
            templateUrl: 'views/ngalogoView.html',
            link: function($rootScope, $stateParams, $scope, $state, $element) {
                (function(window) {

                    'use strict';

                    // class helper functions from bonzo https://github.com/ded/bonzo

                    function classReg(className) {
                        return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
                    }

                    // classList support for class management
                    // altho to be fair, the api sucks because it won't accept multiple classes at once
                    var hasClass, addClass, removeClass;

                    if ('classList' in document.documentElement) {
                        hasClass = function(elem, c) {
                            return elem.classList.contains(c);
                        };
                        addClass = function(elem, c) {
                            elem.classList.add(c);
                        };
                        removeClass = function(elem, c) {
                            elem.classList.remove(c);
                        };
                    } else {
                        hasClass = function(elem, c) {
                            return classReg(c).test(elem.className);
                        };
                        addClass = function(elem, c) {
                            if (!hasClass(elem, c)) {
                                elem.className = elem.className + ' ' + c;
                            }
                        };
                        removeClass = function(elem, c) {
                            elem.className = elem.className.replace(classReg(c), ' ');
                        };
                    }

                    function toggleClass(elem, c) {
                        var fn = hasClass(elem, c) ? removeClass : addClass;
                        fn(elem, c);
                    }

                    var classie = {
                        // full names
                        hasClass: hasClass,
                        addClass: addClass,
                        removeClass: removeClass,
                        toggleClass: toggleClass,
                        // short names
                        has: hasClass,
                        add: addClass,
                        remove: removeClass,
                        toggle: toggleClass
                    };

                    // transport
                    if (typeof define === 'function' && define.amd) {
                        // AMD
                        define(classie);
                    } else {
                        // browser global
                        window.classie = classie;
                    }

                })(window);
                (function() {

                    'use strict';

                    var docElem = window.document.documentElement;

                    window.requestAnimFrame = function() {
                        return (
                            window.requestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.oRequestAnimationFrame ||
                            window.msRequestAnimationFrame ||
                            function( /* function */ callback) {
                                window.setTimeout(callback, 1200 / 60);
                            }
                        );
                    }();

                    window.cancelAnimFrame = function() {
                        return (
                            window.cancelAnimationFrame ||
                            window.webkitCancelAnimationFrame ||
                            window.mozCancelAnimationFrame ||
                            window.oCancelAnimationFrame ||
                            window.msCancelAnimationFrame ||
                            function(id) {
                                window.clearTimeout(id);
                            }
                        );
                    }();

                    function SVGEl(el) {
                        this.el = el;
                        this.image = this.el.previousElementSibling;
                        this.current_frame = 0;
                        this.total_frames = 90;
                        this.path = new Array();
                        this.length = new Array();
                        this.handle = 0;
                        this.init();
                    }

                    SVGEl.prototype.init = function() {
                        var self = this;
                        [].slice.call(this.el.querySelectorAll('path')).forEach(function(path, i) {
                            self.path[i] = path;
                            var l = self.path[i].getTotalLength();
                            self.length[i] = l;
                            self.path[i].style.strokeDasharray = l + ' ' + l;
                            self.path[i].style.strokeDashoffset = l;
                        });
                    };

                    SVGEl.prototype.render = function() {
                        if (this.rendered) return;
                        this.rendered = true;
                        this.draw();
                    };

                    SVGEl.prototype.draw = function() {
                        var self = this,
                            progress = this.current_frame / this.total_frames;
                        if (progress > 1) {
                            window.cancelAnimFrame(this.handle);
                            this.showImage();
                        } else {
                            this.current_frame++;
                            for (var j = 0, len = this.path.length; j < len; j++) {
                                this.path[j].style.strokeDashoffset = Math.floor(this.length[j] * (1 - progress));
                            }
                            this.handle = window.requestAnimFrame(function() {
                                self.draw();
                            });
                        }
                    };

                    SVGEl.prototype.showImage = function() {
                        classie.add(this.image, 'show');
                        classie.add(this.el, 'hide');
                    };

                    function getViewportH() {
                        var client = docElem['clientHeight'],
                            inner = window['innerHeight'];

                        if (client < inner)
                            return inner;
                        else
                            return client;
                    }

                    function scrollY() {
                        return window.pageYOffset || docElem.scrollTop;
                    }

                    // http://stackoverflow.com/a/5598797/989439
                    function getOffset(el) {
                        var offsetTop = 0,
                            offsetLeft = 0;
                        do {
                            if (!isNaN(el.offsetTop)) {
                                offsetTop += el.offsetTop;
                            }
                            if (!isNaN(el.offsetLeft)) {
                                offsetLeft += el.offsetLeft;
                            }
                        } while (el = el.offsetParent)

                        return {
                            top: offsetTop,
                            left: offsetLeft
                        };
                    }

                    function inViewport(el, h) {
                        var elH = el.offsetHeight,
                            scrolled = scrollY(),
                            viewed = scrolled + getViewportH(),
                            elTop = getOffset(el).top,
                            elBottom = elTop + elH,
                            // if 0, the element is considered in the viewport as soon as it enters.
                            // if 1, the element is considered in the viewport only when it's fully inside
                            // value in percentage (1 >= h >= 0)
                            h = h || 0;

                        return (elTop + elH * h) <= viewed && (elBottom) >= scrolled;
                    }

                    function init() {
                        var svgs = Array.prototype.slice.call(document.querySelectorAll('.drawings svg')),
                            svgArr = new Array(),
                            didScroll = false,
                            resizeTimeout;

                        // the svgs already shown...
                        svgs.forEach(function(el, i) {
                            var svg = new SVGEl(el);
                            svgArr[i] = svg;
                            setTimeout(function(el) {
                                return function() {
                                    if (inViewport(el.parentNode)) {
                                        svg.render();
                                    }
                                };
                            }(el), 250);
                        });

                        var scrollHandler = function() {
                                if (!didScroll) {
                                    didScroll = true;
                                    setTimeout(function() {
                                        scrollPage();
                                    }, 60);
                                }
                            },
                            scrollPage = function() {
                                svgs.forEach(function(el, i) {
                                    if (inViewport(el.parentNode, 0.5)) {
                                        svgArr[i].render();
                                    }
                                });
                                didScroll = false;
                            },
                            resizeHandler = function() {
                                function delayed() {
                                    scrollPage();
                                    resizeTimeout = null;
                                }
                                if (resizeTimeout) {
                                    clearTimeout(resizeTimeout);
                                }
                                resizeTimeout = setTimeout(delayed, 200);
                            };

                        window.addEventListener('scroll', scrollHandler, false);
                        window.addEventListener('resize', resizeHandler, false);
                    }

                    init();
                })();

            }
        }
    }
})();