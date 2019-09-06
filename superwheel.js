window.SuperWheel = undefined;
$(function ($) {
    'use strict';
    let SuperWheel = window.SuperWheel || {};
    SuperWheel = (function () {
        let instanceUid = 0;

        function SuperWheel(element, settings) {
            let self = this,
                dataSettings;
            self.defaults = {
                slices: [{name: 'Win', message: 'You win', value: 'win'}, {
                    name: 'Lose',
                    message: 'You lose',
                    value: 'lose'
                }],
                slice: {
                    background: "#009688",
                },
                text: {
                    type: 'text',
                    color: '#fefefe',
                    size: 17,
                    offset: 10,
                    letterSpacing: 1,
                    orientation: 'v',
                    arc: false
                },
                line: {
                    width: 3,
                    color: "#d6d6d6",
                },
                outer: {
                    width: 2,
                    color: "#d6d6d6",
                },
                inner: {
                    width: 2,
                    color: "#d6d6d6",
                },
                center: {
                    width: 30,
                    background: '#FFFFFF00',
                    rotate: true,
                    class: "",
                    image: {
                        url: "",
                        width: 45,
                    },
                    html: {
                        template: '',
                        width: 45,
                    }
                },
                marker: {
                    animate: true,
                    background: '#e74c3c'
                },
                width: 400,
                easing: 'superWheel',
                duration: 15000,
                selector: 'value',
                type: 'rotate',
                rotates: 22,
                frame: 1,
            };
            dataSettings = $(element).data('superWheel') || {};
            self.o = $.extend({}, self.defaults, settings, dataSettings);
            $.each(self.o.slices, function (i, slice) {
                let validatedSlice = slice;
                if (typeof validatedSlice.color === 'undefined') {
                    validatedSlice.color = self.o.text.color;
                }
                if (typeof validatedSlice.background === 'undefined') {
                    validatedSlice.background = self.o.slice.background;
                }
                self.o.slices[i] = validatedSlice;
            });

            if ((typeof self.o.center.image.url === 'undefined' || self.o.center.image.url) && typeof self.o.center.image.src !== 'undefined')
                self.o.center.image.url = self.defaults.center.image.src;

            if (typeof self.o.center.image.width !== 'undefined')
                self.o.center.image.width = Math.abs(self.o.center.image.width);

            self.o.width = Math.abs(self.o.width);
            self.o.center.width = Math.abs(self.o.center.width);
            self.o.outer.width = Math.abs(self.o.outer.width / 2);
            self.o.inner.width = Math.abs(self.o.inner.width / 2);
            self.o.line.width = Math.abs(self.o.line.width / 2);
            self.initials = {
                spinner: false,
                now: 0,
                spinning: false,
                slice: {
                    id: null,
                    results: null,
                },
                currentSliceData: {
                    id: null,
                    results: null,
                },
                winner: false,
                spinCount: 0,
                counter: 0,
                currentSlice: 0,
                currentStep: 0,
                lastStep: 0,
                slicePercent: 0,
                circlePercent: 0,
                rotates: parseInt(self.o.rotates, 10),
                $element: $(element),
                slices: self.o.slices,
                width: 400,
                cache: $(element).data('superWheelData') ? $(element).data('superWheelData').cache : []
            };
            $.extend(self, self.initials);
            self.half = 200 / 2;
            $.extend($.easing, {
                superWheel:  function (x, t, b, c, d) {
                    return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
                }
            });
            self.instanceUid = $(element).data('superWheelData') ? $(element).data('superWheelData').instanceUid : instanceUid++;
            $(element).data('superWheelData', self);
            self.init();
        }
        return SuperWheel;
    }());
    /*#######################################################
    /////////////////////////////////////////////////////////
    ////////////////////   Initialize   /////////////////////
    /////////////////////////////////////////////////////////
    #######################################################*/
    SuperWheel.prototype.init = function () {
        let self = this;
        self.$element.addClass('superWheel _' + self.instanceUid).html('');
        self.$element.html('');
        let arcSize = 360 / self.totalSlices(),
            pStart = 0,
            pEnd = 0,
            wrapper = $('<div/>').addClass('sWheel-wrapper').appendTo(self.$element),
            inner = $('<div/>').addClass('sWheel-inner').appendTo(wrapper),
            spinner = $('<div/>').addClass('sWheel').prependTo(inner),
            LayerBg = $('<div/>').addClass('sWheel-bg-layer').appendTo(spinner),
            Layersvg = $(self.SVG('svg', {
                'version': '1.1',
                'xmlns': 'http://www.w3.org/2000/svg',
                'xmlns:xlink': 'http://www.w3.org/1999/xlink',
                'x': '0px',
                'y': '0px',
                'viewBox': '0 0 200 200',
                'xml:space': 'preserve',
                'style': 'enable-background:new 0 0 200 200;',
            })),
            mask = $('<defs><clipPath id="cut-off-line"></circle></clipPath></defs>'),
            maskArc = self.annularSector({
                centerX: self.half,
                centerY: self.half,
                startDegrees: 0,
                endDegrees: 359.990000,
                innerRadius: 0,
                outerRadius: self.half - (parseInt(self.o.outer.width, 10) > 1 ? 1 : 0)
            });
        mask.find('clipPath')
            .append(self.SVG('path', {
                'stroke-width': 0,
                'fill': '#ccc',
                'd': maskArc
            }))
            .closest('defs').appendTo(Layersvg);
        if ((self.o.text.orientation === 'v' || self.o.text.orientation === 'vertical') ||
            ((self.o.text.type === 'icon' || self.o.text.type === 'image') && (self.o.text.orientation === 'h' || self.o.text.orientation === 'horizontal'))) {
            var Layertext = $('<div/>'),
                textHtml = $('<div/>');
            Layertext.addClass('sWheel-txt-wrap');
            Layertext.appendTo(spinner);
            textHtml.addClass('sWheel-txt');
            textHtml.css({
                '-webkit-transform': 'rotate(' + ((-(360 / self.totalSlices()) / 2) + self.getDegree()) + 'deg)',
                '-moz-transform': 'rotate(' + ((-(360 / self.totalSlices()) / 2) + self.getDegree()) + 'deg)',
                '-ms-transform': 'rotate(' + ((-(360 / self.totalSlices()) / 2) + self.getDegree()) + 'deg)',
                '-o-transform': 'rotate(' + ((-(360 / self.totalSlices()) / 2) + self.getDegree()) + 'deg)',
                'transform': 'rotate(' + ((-(360 / self.totalSlices()) / 2) + self.getDegree()) + 'deg)'
            });
            textHtml.appendTo(Layertext);
        } else {
            var textsGroup = $('<g class="sWheel-txt"/>'),
                LayerDefs = $('<defs/>');
        }
        var Layercenter = $('<div/>');
        Layercenter.addClass('sWheel-center');
        Layercenter.addClass(self.o.center.class);
        Layercenter.appendTo(self.o.center.rotate === true || self.o.center.rotate === 1 || self.o.center.rotate === "true" ? spinner : inner);
        if (typeof self.o.center.image.url === 'string' && $.trim(self.o.center.image.url) !== '') {
            var centerImage = $('<img  alt="" src=""/>');
            if (!parseInt(self.o.center.image.width, 10)) self.o.center.image.width = parseInt(self.o.center.width, 10);
            centerImage.css('width', parseInt(self.o.center.image.width, 10) + '%');
            centerImage.attr('src', self.o.center.image.url);
            centerImage.appendTo(Layercenter);
            Layercenter.append('<div class="sw-center-empty" style="width:' + parseInt(self.o.center.image.width, 10) + '%; height:' + parseInt(self.o.center.image.width, 10) + '%" />');
        }
        if (typeof self.o.center.html.template === 'string' && $.trim(self.o.center.html.template) !== '') {
            var centerHtml = $('<div class="sw-center-html">' + self.o.center.html.template + '</div>');
            if (!parseInt(self.o.center.html.width, 10)) self.o.center.html.width = parseInt(self.o.center.width, 10);
            centerHtml.css({
                'width': parseInt(self.o.center.html.width, 10) + '%',
                'height': parseInt(self.o.center.html.width, 10) + '%'
            });
            centerHtml.appendTo(Layercenter);
        }
        if ($.trim(self.o.type) !== 'color') {
            let Layermarker = $('<div/>').addClass('sWheel-marker').appendTo(wrapper);
            Layermarker.append('<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 80 115" style="enable-background:new 0 0 80 115;" xml:space="preserve">' + '<g>' + '<path stroke="#fff" stroke-width="1" fill="' + self.o.marker.background + '" d="M40,0C17.9,0,0,17.7,0,39.4S40,115,40,115s40-53.9,40-75.6S62.1,0,40,0z M40,52.5c-7,0-12.6-5.6-12.6-12.4 S33,27.7,40,27.7s12.6,5.6,12.6,12.4C52.6,46.9,47,52.5,40,52.5z"/>' + '<path fill="#fff" d="M40,19.2c-11.7,0-21.2,9.3-21.2,20.8S28.3,60.8,40,60.8S61.2,51.5,61.2,40S51.7,19.2,40,19.2z "/>' + '</g>' + '</svg>');
        }
        let slicesGroup = $('<g/>'),
            linesGroup = $('<g/>'),
            corner = 360 / self.totalSlices(),
            lineLength = self.half,
            cx = self.half,
            cy = self.half,
            cr = 0;
        $.each(self.slices, function (i, slice) {
            /*#######################################################
            /////////////////////////////////////////////////////////
            //////////////////   Slice Drawer   /////////////////////
            /////////////////////////////////////////////////////////
            #######################################################*/
            let rotate = (360 / self.totalSlices()) * i;
            pEnd += arcSize;
            let arc = self.annularSector({
                centerX: self.half,
                centerY: self.half,
                startDegrees: pStart,
                endDegrees: pEnd,
                innerRadius: 0,
                // innerRadius: parseInt(self.o.center.width, 10),
                outerRadius: self.half - (parseInt(self.o.outer.width, 10) > 1 ? 1 : 0)
            });
            slicesGroup.append(self.SVG('path', {
                'stroke-width': 0,
                'fill': slice.background,
                'data-fill': slice.background,
                'd': arc
            }));
            let p1 = self.findPoint(cx, cy, cr + lineLength, corner * i),
                p2 = self.findPoint(cx, cy, cr, corner * i);
            linesGroup.append(self.SVG('line', {
                'x1': p1.x,
                'y1': p1.y,
                'x2': p2.x,
                'y2': p2.y,
                'stroke': self.o.line.color,
                'stroke-width': self.o.line.width,
                'fill': 'none',
                'clip-path': 'url(#cut-off-line)',
            }));
            /*#######################################################
            /////////////////////////////////////////////////////////
            //////////////////   Slice Content   ////////////////////
            /////////////////////////////////////////////////////////
            #######################################################*/
            if ((self.o.text.orientation === 'v' || self.o.text.orientation === 'vertical') ||
                ((self.o.text.type === 'icon' || self.o.text.type === 'image') && (self.o.text.orientation === 'h' || self.o.text.orientation === 'horizontal'))) {
                var LayerTitle = $('<div/>');
                if (self.toNumber(self.o.text.letterSpacing) > 0) textHtml.css('letter-spacing', self.toNumber(self.o.text.letterSpacing));
                LayerTitle.css({
                    paddingRight: parseInt(self.o.text.offset, 10) + '%',
                    '-webkit-transform': 'rotate(' + rotate + 'deg) translate(0px, -50%)',
                    '-moz-transform': 'rotate(' + rotate + 'deg) translate(0px, -50%)',
                    '-ms-transform': 'rotate(' + rotate + 'deg) translate(0px, -50%)',
                    '-o-transform': 'rotate(' + rotate + 'deg) translate(0px, -50%)',
                    'transform': 'rotate(' + rotate + 'deg) translate(0px, -50%)',
                    'color': slice.color
                });
                if (self.o.text.type === 'icon') {
                    LayerTitle.html('<i class="' + slice.text + '" aria-hidden="true"></i>')
                    if (self.o.text.orientation === 'h' || self.o.text.orientation === 'horizontal') {
                        LayerTitle.find('>i').css({
                            '-webkit-transform': 'rotate(90deg)',
                            '-moz-transform': 'rotate(90deg)',
                            '-ms-transform': 'rotate(90deg)',
                            '-o-transform': 'rotate(90deg)',
                            'transform': 'rotate(90deg)'
                        });
                    }
                } else if (self.o.text.type === 'image') {
                    LayerTitle.html('<img src="' + slice.text + '"/>')
                    if (self.o.text.orientation === 'h' || self.o.text.orientation === 'horizontal') {
                        LayerTitle.find('>img').css({
                            '-webkit-transform': 'rotate(90deg)',
                            '-moz-transform': 'rotate(90deg)',
                            '-ms-transform': 'rotate(90deg)',
                            '-o-transform': 'rotate(90deg)',
                            'transform': 'rotate(90deg)'
                        });
                    }
                } else {
                    LayerTitle.html(slice.text);
                }
                LayerTitle.attr('data-color', slice.color);
                LayerTitle.addClass('sWheel-title').appendTo(textHtml);
            } else {
                var LayerText = $('<text stroke-width="0" data-color="' + slice.color + '" fill="' + slice.color + '" dy="' + (self.toNumber(self.o.text.offset)) + '%">' + '<textPath xlink:href="#sw-text-' + i + '" startOffset="50%" style="text-anchor: middle;">' + slice.text + '</textPath>' + '</text>');
                LayerText.addClass('sWheel-title');
                textsGroup.css('font-size', parseInt(self.o.text.size / 2, 10));
                if (parseInt(self.o.text.letterSpacing, 10) > 0) textsGroup.css('letter-spacing', parseInt(self.o.text.letterSpacing / 2, 10));
                textsGroup.append(LayerText);
                var firstArcSection = /(^.+?)L/;
                var newD = firstArcSection.exec(arc)[1];
                if (self.o.text.arc !== true && self.o.text.arc !== 'true' && self.o.text.arc !== 1) {
                    var secArcSection = /(^.+?)A/;
                    var Commas = /(^.+?),/;
                    var newc = secArcSection.exec(newD);
                    var replaceVal = newD.replace(newc[0], "");
                    var getFirstANumber = Commas.exec(replaceVal);
                    var nval = replaceVal.replace(getFirstANumber[1], 0);
                    newD = newD.replace(replaceVal, nval);
                }
                LayerDefs.append(self.SVG('path', {
                    'stroke-width': 0,
                    'fill': 'none',
                    'id': 'sw-text-' + i,
                    'd': newD
                }));
            }
            var LayerTitleInner = $('<div/>');
            LayerTitleInner.html(slice);
            LayerTitleInner.appendTo(LayerTitle);
            pStart += arcSize;
        });
        slicesGroup.addClass('sw-slicesGroup').appendTo(Layersvg);
        linesGroup.appendTo(Layersvg);
        if (self.o.text.orientation !== 'v' && self.o.text.orientation !== 'vertical' && self.o.text.type === 'text') {
            LayerDefs.appendTo(Layersvg);
            textsGroup.appendTo(Layersvg);
        }
        var outerLine = self.SVG('circle', {
            'class': 'outerLine',
            'cx': self.half,
            'cy': self.half,
            'r': self.half - (parseInt(self.o.outer.width, 10) / 2),
            'stroke': self.o.outer.color,
            'stroke-width': parseInt(self.o.outer.width, 10),
            'fill-opacity': 0,
            'fill': 'none'
        });
        // $(outerLine).appendTo(Layersvg);
        var innerLine = self.SVG('circle', {
            'class': 'innerLine',
            'cx': self.half,
            'cy': self.half,
            'r': parseInt(self.o.center.width, 10) + (parseInt(self.o.inner.width, 10) ? parseInt(self.o.inner.width, 10) / 2 - 1 : 0),
            'stroke': self.o.inner.color,
            'stroke-width': parseInt(self.o.inner.width, 10),
            'fill-opacity': self.o.center.background ? 1 : 0,
            'fill': self.o.center.background ? self.o.center.background : 'none'
        });
        // $(innerLine).appendTo(Layersvg);
        Layersvg.appendTo(LayerBg);
        LayerBg.html(LayerBg.html());
        self.$element.css('font-size', parseInt(self.o.text.size, 10));
        self.$element.width(parseInt(self.o.width, 10));
        self.$element.height(self.$element.width());
        self.$element.find('.sWheel-wrapper').width(self.$element.width());
        self.$element.find('.sWheel-wrapper').height(self.$element.width());
        self.FontScale();
        $(window).on('resize.' + self.instanceUid, function () {
            self.$element.height(self.$element.width());
            self.$element.find('.sWheel-wrapper').width(self.$element.width());
            self.$element.find('.sWheel-wrapper').height(self.$element.width());
            self.FontScale();
        });
    };
    /*#######################################################
    /////////////////////////////////////////////////////////
    ///////////////////   SVG OBJECTS   /////////////////////
    /////////////////////////////////////////////////////////
    #######################################################*/
    SuperWheel.prototype.SVG = function (e, t) {
        let r = document.createElementNS("http://www.w3.org/2000/svg", e);
        for (let n in t) r.setAttribute(n, t[n]);
        return r
    };
    SuperWheel.prototype.annularSector = function (options) {
        let self = this;
        let opts = self.oWithDefaults(options);
        let p = [ // points
            [opts.cx + opts.r2 * Math.cos(opts.startRadians), opts.cy + opts.r2 * Math.sin(opts.startRadians)],
            [opts.cx + opts.r2 * Math.cos(opts.closeRadians), opts.cy + opts.r2 * Math.sin(opts.closeRadians)],
            [opts.cx + opts.r1 * Math.cos(opts.closeRadians), opts.cy + opts.r1 * Math.sin(opts.closeRadians)],
            [opts.cx + opts.r1 * Math.cos(opts.startRadians), opts.cy + opts.r1 * Math.sin(opts.startRadians)]
        ];
        let angleDiff = opts.closeRadians - opts.startRadians;
        let largeArc = (angleDiff % (Math.PI * 2)) > Math.PI ? 1 : 0;
        let cmds = [];
        cmds.push("M" + p[0].join());
        cmds.push("A" + [opts.r2, opts.r2, 0, largeArc, 1, p[1]].join());
        cmds.push("L" + p[2].join());
        cmds.push("A" + [opts.r1, opts.r1, 0, largeArc, 0, p[3]].join());
        cmds.push("z");
        return cmds.join(' ');
    };
    SuperWheel.prototype.oWithDefaults = function (o) {
        let o2 = {
            cx: o.centerX || 0,
            cy: o.centerY || 0,
            startRadians: (o.startDegrees || 0) * Math.PI / 180,
            closeRadians: (o.endDegrees || 0) * Math.PI / 180,
        };
        let t = o.thickness !== undefined ? o.thickness : 100;
        if (o.innerRadius !== undefined) o2.r1 = o.innerRadius;
        else if (o.outerRadius !== undefined) o2.r1 = o.outerRadius - t;
        else o2.r1 = 200 - t;
        if (o.outerRadius !== undefined) o2.r2 = o.outerRadius;
        else o2.r2 = o2.r1 + t;
        if (o2.r1 < 0) o2.r1 = 0;
        if (o2.r2 < 0) o2.r2 = 0;
        return o2;
    };
    SuperWheel.prototype.findPoint = function (cx, cy, rad, cornerGrad) {
        var cornerRad = cornerGrad * Math.PI / 180;
        var nx = Math.cos(cornerRad) * rad + cx;
        var ny = Math.sin(cornerRad) * rad + cy;
        return {x: nx, y: ny};
    };
    /*#######################################################
    /////////////////////////////////////////////////////////
    ////////////////////   Wheel Core   /////////////////////
    /////////////////////////////////////////////////////////
    #######################################################*/
    SuperWheel.prototype.start = function (key, val) {
        var self = this;
        if (self.spinning) return;
        if (typeof val === 'undefined') {
            val = key;
            key = self.o.selector;
        }
        self.o.selector = key;
        if (typeof val !== 'undefined') {
            self.winner = self.findWinner(val, false);
            if (self.winner !== false) {
                self.slice.id = self.winner;
            } else {
                return;
            }
        } else {
            return;
        }
        self.spinning = true;
        if (typeof self.slices[self.slice.id] === 'undefined') return;
        self.slice.results = self.slices[self.slice.id];
        self.slice.length = self.slice.id;
        if (typeof self.cache['onStart'] !== 'undefined') {
            $.each(self.cache['onStart'], function (i, callback) {
                if (typeof callback === 'function')
                    callback.call(self.$wheel, self.slice.results, self.spinCount, self.now);
            });
        }
        var selectedSlicePos = self.calcSliceSize(self.slice.id);
        var randomize = self.randomInt(selectedSlicePos.start, selectedSlicePos.end);
        var _deg = (360 * parseInt(self.rotates, 10)) + randomize;
        var temp = self.numberToArray(self.totalSlices()).reverse();
        var MarkerAnimator = false;
        if (parseInt(self.o.frame, 10) !== 0) {
            var oldinterval = $.fx.interval;
            $.fx.interval = parseInt(self.o.frame, 10);
        }
        self.spinner = $({
            deg: self.now
        }).animate({
            deg: _deg
        }, {
            duration: parseInt(self.o.duration, 10),
            easing: $.trim(self.o.easing),
            step: function (now, fx) {
                if (parseInt(self.o.frame, 10) !== 0) $.fx.interval = parseInt(self.o.frame, 10);
                self.now = now % 360;
                if ($.trim(self.o.type) !== 'color') {
                    self.$element.find('.sWheel').css({
                        '-webkit-transform': 'rotate(' + self.now + 'deg)',
                        '-moz-transform': 'rotate(' + self.now + 'deg)',
                        '-ms-transform': 'rotate(' + self.now + 'deg)',
                        '-o-transform': 'rotate(' + self.now + 'deg)',
                        'transform': 'rotate(' + self.now + 'deg)'
                    });
                }
                self.currentStep = Math.floor(now / (360 / self.totalSlices()));
                self.currentSlice = temp[self.currentStep % self.totalSlices()];
                var ewCircleSize = 400 * 4,
                    ewTotalArcs = self.totalSlices(),
                    ewArcSizeDeg = 360 / ewTotalArcs,
                    ewArcSize = ewCircleSize / ewTotalArcs,
                    point = ewCircleSize / 360,
                    ewCirclePos = (point * self.now),
                    ewCirclePosPercent = (ewCirclePos / ewCircleSize) * 100,
                    ewArcPos = (((self.currentSlice + 1) * ewArcSize) - (ewCircleSize - (point * self.now))),
                    ewArcPosPercent = (ewArcPos / ewArcSize) * 100,
                    cpercent = ewCirclePosPercent,
                    apercent = ewArcPosPercent;
                self.slicePercent = ewArcPosPercent;
                self.circlePercent = ewCirclePosPercent;
                if (typeof self.cache['onProgress'] !== 'undefined') {
                    $.each(self.cache['onProgress'], function (i, callback) {
                        if (typeof callback === 'function')
                            callback.call(self.$element, self.slicePercent, self.circlePercent);
                    });
                }
                if (self.lastStep !== self.currentStep) {
                    self.lastStep = self.currentStep;
                    if ((self.o.marker.animate === true || self.o.marker.animate === 1 || self.o.marker.animate === 'true') && $.inArray($.trim(self.o.easing), ['easeInElastic', 'easeInBack', 'easeInBounce', 'easeOutElastic', 'easeOutBack', 'easeOutBounce', 'easeInOutElastic', 'easeInOutBack', 'easeInOutBounce']) === -1) {
                        var Mduration = parseFloat(self.o.duration) / (((self.totalSlices()) * self.o.rotates + (self.totalSlices() - self.winner)) - self.currentStep) / self.o.rotates;
                        var BDeg = (self.totalSlices() * self.o.rotates - self.currentStep);
                        if (MarkerAnimator) MarkerAnimator.stop();
                        var markerNow = 0;
                        MarkerAnimator = $({
                            deg: (BDeg > 40 ? -40 : -BDeg > -10 ? 0 : -BDeg)
                        }).animate({
                            deg: -10
                        }, {
                            duration: (Mduration / 4),
                            step: function (now) {
                                markerNow = now;
                                $(".sWheel-marker").css({
                                    '-webkit-transform': 'rotate(' + -now + 'deg)',
                                    '-moz-transform': 'rotate(' + -now + 'deg)',
                                    '-ms-transform': 'rotate(' +-now + 'deg)',
                                    '-o-transform': 'rotate(' +-now + 'deg)',
                                    'transform': 'rotate(' + -now + 'deg)'
                                });
                            },
                            complete: function (animation, progress, remainingMs) {
                                MarkerAnimator = $({
                                    deg: markerNow
                                }).animate({
                                    deg: 0
                                }, {
                                    easing: "linear",
                                    duration: 100,
                                    step: function (now) {
                                        $(".sWheel-marker").css({
                                            '-webkit-transform': 'rotate(' + -now + 'deg)',
                                            '-moz-transform': 'rotate(' + -now + 'deg)',
                                            '-ms-transform': 'rotate(' + -now + 'deg)',
                                            '-o-transform': 'rotate(' + -now + 'deg)',
                                            'transform': 'rotate(' + -now + 'deg)'
                                        });
                                    }
                                });
                            },
                        });
                    }
                    if ($.trim(self.o.type) === 'color') {
                        self.$element.find('svg>g.sw-slicesGroup>path').each(function (i) {
                            $(this).attr('class', '').attr('fill', $(this).attr('data-fill'));
                        });
                        self.$element.find('.sWheel-txt>.sWheel-title').each(function (i) {
                            $(this).attr('class', 'sWheel-title');
                            if (self.o.text.orientation === 'v' || self.o.text.orientation === 'vertical') $(this).css('color', $(this).attr('data-color'));
                            else $(this).attr('fill', $(this).attr('data-color'));
                        });
                        self.$element.find('svg>g.sw-slicesGroup>path').eq(self.currentSlice).addClass('sw-ccurrent').attr('fill', self.o.slice.selected.background);
                        if (self.o.text.orientation === 'v' || self.o.text.orientation === 'vertical')
                            self.$element.find('.sWheel-txt>.sWheel-title').eq(self.currentSlice).addClass('sw-ccurrent').css('color', self.o.slice.selected.color);
                        else self.$element.find('.sWheel-txt>.sWheel-title').eq(self.currentSlice).addClass('sw-ccurrent').attr('fill', self.o.slice.selected.color);
                    } else {
                        self.$element.find('svg>g.sw-slicesGroup>path').removeClass('sw-current');
                        self.$element.find('svg>g.sw-slicesGroup>path').eq(self.currentSlice).addClass('sw-current');
                        self.$element.find('.sWheel-txt>.sWheel-title').eq(self.currentSlice).addClass('sw-current');
                    }
                    self.currentSliceData = {};
                    self.currentSliceData.id = self.currentSlice;
                    self.currentSliceData.results = self.slices[self.currentSliceData.id];
                    self.currentSliceData.results.length = self.currentSliceData.id;
                    if (typeof self.cache['onStep'] !== 'undefined') {
                        $.each(self.cache['onStep'], function (i, callback) {
                            if (typeof callback === 'function')
                                callback.call(self.$element, self.currentSliceData.results, self.slicePercent, self.circlePercent);
                        });
                    }
                }
                if (parseInt(self.o.frame, 10) !== 0) $.fx.interval = oldinterval;
            },
            fail: function (animation, progress, remainingMs) {
                self.spinning = false;
                if (typeof self.cache['onFail'] !== 'undefined') {
                    $.each(self.cache['onFail'], function (i, callback) {
                        if (typeof callback === 'function')
                            callback.call(self.$element, self.slice.results, self.spinCount, self.now);
                    });
                }
            },
            complete: function (animation, progress, remainingMs) {
                self.spinning = false;
                console.log(self.slice.results);
                function showAlert(results) {
                    let modal = $("#exampleModal");
                    modal.find(".modal-body").text(results.message);
                    modal.css({opacity:1}).show()
                }

                showAlert(self.slice.results);
                if (typeof self.cache['onComplete'] !== 'undefined') {
                    $.each(self.cache['onComplete'], function (i, callback) {
                        if (typeof callback === 'function')
                            callback.call(self.$element, self.slice.results, self.spinCount, self.now);
                    });
                }
            },
        });
        self.counter++;
        self.spinCount++;
    };
    /*#######################################################
    /////////////////////////////////////////////////////////
    ///////////////////   Core Helpers   ////////////////////
    /////////////////////////////////////////////////////////
    #######################################################*/
    SuperWheel.prototype.totalSlices = function () {
        let self = this;
        return self.slices.length;
    };
    SuperWheel.prototype.calcSliceSize = function (slice) {
        let self = this;
        let start = self.degStart((slice)) - (parseInt(self.o.line.width, 10) + 2);
        let end = self.degEnd(slice) + (parseInt(self.o.line.width, 10) + 2);
        let results = [];
        results.start = start;
        results.end = end;
        return results;
    };
    SuperWheel.prototype.findWinner = function (value) {
        let self = this;
        let filter = [];
        $.each(self.slices, function (i, slice) {
            if (typeof slice[self.o.selector] === 'object' || typeof slice[self.o.selector] === 'string' || typeof slice[self.o.selector] === 'undefined')
                return undefined;
            if (slice[self.o.selector] === value) {
                filter.push(i);
            }
        });
        let keys = Object.keys(filter);
        return filter[keys[keys.length * Math.random() << 0]];
    };
    SuperWheel.prototype.getDegree = function () {
        let self = this;
        return (360 / self.totalSlices());
    };
    SuperWheel.prototype.degStart = function (id) {
        let self = this;
        return 360 - (self.getDegree() * id);
    };
    SuperWheel.prototype.degEnd = function (id) {
        let self = this;
        return 360 - ((self.getDegree() * id) + self.getDegree());
    };
    /*#######################################################
    /////////////////////////////////////////////////////////
    /////////////////////   Helpers   ///////////////////////
    /////////////////////////////////////////////////////////
    #######################################################*/
    SuperWheel.prototype.toNumber = function (e) {
        return isNaN(Number(e)) ? 0 : Number(e)
    };
    SuperWheel.prototype.numberToArray = function (N) {
        let args = [];
        let i;
        for (i = 0; i < N; i++) {
            args[i] = i;
        }
        return args;
    };
    SuperWheel.prototype.randomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    SuperWheel.prototype.FontScale = function () {
        let self = this;
        let Fscale = 1 + (self.$element.width() - parseInt(self.o.width, 10)) / parseInt(self.o.width, 10);
        if (Fscale > 4) {
            Fscale = 4;
        } else if (Fscale < 0.1) {
            Fscale = 0.1;
        }
        self.$element.find(".sWheel-wrapper").css('font-size', Fscale * 100 + '%');
    };
    /*#######################################################
    /////////////////////////////////////////////////////////
    ///////////////////    Callback's   /////////////////////
    /////////////////////////////////////////////////////////
    #######################################################*/
    SuperWheel.prototype.onStart = function (callback) {
        let self = this;
        if (typeof self.cache['onStart'] === 'undefined')
            self.cache['onStart'] = [];
        self.cache['onStart'][self.cache['onStart'].length] = callback;
    };
    SuperWheel.prototype.onStep = function (callback) {
        let self = this;
        if (typeof self.cache['onStep'] === 'undefined')
            self.cache['onStep'] = [];
        self.cache['onStep'][self.cache['onStep'].length] = callback;
    };
    SuperWheel.prototype.onProgress = function (callback) {
        let self = this;
        if (typeof self.cache['onProgress'] === 'undefined')
            self.cache['onProgress'] = [];
        self.cache['onProgress'][self.cache['onProgress'].length] = callback;
    };
    SuperWheel.prototype.onFail = function (callback) {
        let self = this;
        if (typeof self.cache['onFail'] === 'undefined')
            self.cache['onFail'] = [];
        self.cache['onFail'][self.cache['onFail'].length] = callback;
    };
    SuperWheel.prototype.onComplete = function (callback) {
        let self = this;
        if (typeof self.cache['onComplete'] === 'undefined')
            self.cache['onComplete'] = [];
        self.cache['onComplete'][self.cache['onComplete'].length] = callback;
    };
    SuperWheel.prototype.onFail = function (callback) {
        let self = this;
        if (typeof self.cache['onFail'] === 'undefined')
            self.cache['onFail'] = [];
        self.cache['onFail'][self.cache['onFail'].length] = callback;
    };
    /*#######################################################
    /////////////////////////////////////////////////////////
    //////////////////   jQuery Plugin   ////////////////////
    /////////////////////////////////////////////////////////
    #######################################################*/
    $.fn.superWheel = function () {
        let self = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            arg2 = Array.prototype.slice.call(arguments, 2),
            l = self.length,
            i,
            apply,
            allowed = ['destroy', 'start', 'finish', 'option', 'onStart', 'onStep', 'onProgress', 'onComplete', 'onFail'];
        for (i = 0; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined') {
                self[i].superWheel = new SuperWheel(self[i], opt);
            } else if ($.inArray($.trim(opt), allowed) !== -1) {
                if ($.trim(opt) === 'option') {
                    apply = self[i].superWheel[opt].apply(self[i].superWheel, args, arg2);
                } else {
                    apply = self[i].superWheel[opt].apply(self[i].superWheel, args);
                }
            }
            if (typeof apply != 'undefined') return apply;
        }
        return self;
    };
});