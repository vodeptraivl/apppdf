
/*
* PDF WRITTING APP
* MODIFY : ~ FKVL
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global.FKPaint = factory());
}(this, (function () {
    'use strict';
    var Point = (function () {
        function Point(x, y, time) {
            this.x = x;
            this.y = y;
            this.time = time || Date.now();
        }
        Point.prototype.distanceTo = function (start) {
            return Math.sqrt(Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2));
        };
        Point.prototype.equals = function (other) {
            return this.x === other.x && this.y === other.y && this.time === other.time;
        };
        Point.prototype.velocityFrom = function (start) {
            return this.time !== start.time
                ? this.distanceTo(start) / (this.time - start.time)
                : 0;
        };
        return Point;
    }());

    

    var FKPaint = (function () {
        function FKPaint(
            canvas= null, canvasMain= null, options= null, pageNumber= null,
            callbackHis= null,
            callbackClearRedo= null,
            callbackEraser= null,
            callbackTouchZoom= null,
            callBackScrollBar= null,
            callbackMouseZoom= null,
            callbackTextStart= null,
            callbackText= null,
            callbackTextEnd= null,
            opacity = 0.7,
            callBackMouseEvevent= null,
            callBackShape = null
        ) {
            if (options === void 0) { options = {}; }
            var _this = this;
            this._dataPop = [];
            this.canvas = canvas;
            this.canvasMain = canvasMain;
            this._ctx = this.canvas.getContext('2d');
            this._mctx = this.canvasMain.getContext("2d");
            this.canvas.style.opacity = 0.7;
            this.canPaint = true;
            this.canText = false;
            this.canEraser = false;
            this.canDrawShape = false;
            this.pageNumber = pageNumber;
            // ~ FKVL
            this.callbackHis = callbackHis || null;
            this.callbackClearRedo = callbackClearRedo || null;
            this.callbackEraser = callbackEraser || null;
            this.callbackTouchZoom = callbackTouchZoom || null;
            this.callBackScrollBar = callBackScrollBar || null;
            this.callbackMouseZoom = callbackMouseZoom || null;
            this.callBackMouseEvevent = callBackMouseEvevent || null;
            this.callbackTextStart = callbackTextStart || null;
            this.callbackText = callbackText || null;
            this.callbackTextEnd = callbackTextEnd || null;

            this.callBackShape = callBackShape || null;
            this._mouseDown = false;
            this._tochText = false;
            this._mouseButtonDown = false;
            this._scrollbarAction = false;
            this._touched = false;
            this.highLight = false;
            this.lz = 0;
            this.tm = false;
            //   this.canvasMain.style.opacity = 1;
            this._mctx.globalAlpha = 1;
            this.options = options;
            this.HLopacity = opacity;
            this.onDrawShape = false;
            this.idSvg = this._UUID();
            this.stampMode = false;
            this._handleMousewheel = function (event) {
                if (event.ctrlKey == true && event.x != null && event.y != null) {
                    event.preventDefault();
                    if (_this.callbackMouseZoom != null) {
                        let align = _this.canvas.parentElement.getAttribute('align');
                        _this.callbackMouseZoom({ zoomDelta: event.deltaY, point: { x: event.x, y: event.y }, endTouch: false, page: align });
                    }
                }
            }

            // ~ FKVL
            this._handleMouseDown = function (event) {
                event.preventDefault();
                if (event.which === 1 && _this.canPaint == true) {
                    _this.lz = _this._data.length;
                    _this._mouseButtonDown = true;
                    _this._strokeBegin(event);
                    $('.imgContainer,.svg-container').removeClass('active zindx1 zindx2 zindx3').addClass('zindx1');
                    $('.stampProdCon').removeClass('active');
                    _this._dataPop = [];
                }
                else if (event.which === 1 && _this.canText == true) {
                    _this._mouseDown = true;
                    if (_this.callbackTextStart != null) {
                        _this.callbackTextStart(event, null, _this.pageNumber);
                    }
                }
                else if (_this.canEraser && _this.callbackEraser != null) {
                    let x = event.offsetX * _this.canvas.width / _this.canvas.clientWidth;
                    let y = event.offsetY * _this.canvas.height / _this.canvas.clientHeight;
                    let dataDelete = _this.eraser(x, y);
                    if (dataDelete.type != null) {
                        _this._dataPop = [];
                        _this.callbackEraser(dataDelete);
                    }
                }else if (event.which === 1 && _this.canDrawShape) {
                    _this.onDrawShape = true;
                    _this.callBackShape({event, pageNumber : _this.pageNumber, type : 'mouseDown' , idSVG : _this.idSvg})
                }else if (event.which === 1 && _this.stampMode) {
                    if(_this.options.isOtherStamp){
                        _this.callBackMouseEvevent({event, divMain : '.conOtherStamp', type : 'stampSign'});
                    }else{
                        _this.callBackMouseEvevent({event, pageNumber : _this.pageNumber, type : 'stampSign'});
                    }
                    
                }
                else if ((event.which === 1 || event.which === 2) && _this.callBackScrollBar != null) {
                    _this._scrollbarAction = true;
                    _this.callBackScrollBar({ x: event.clientX, y: event.clientY, scroll: true, which: event.which });
                }
                if (event.which === 2 && _this.callBackScrollBar != null) {
                    _this._scrollbarAction = true;
                    _this.callBackScrollBar({ x: event.clientX, y: event.clientY, scroll: true, which: event.which });
                }
            };

            this._handleMouseMove = function (event) {
                event.preventDefault();
                if (event.ctrlKey == true) {
                    if (_this.callbackMouseZoom != null) {
                        _this.callbackMouseZoom({ zoomDelta: null, point: null, endTouch: true });
                    }
                }

                if (_this._mouseButtonDown) {
                    _this._strokeMoveUpdate(event);
                } else if (_this._mouseDown) {
                    if (_this.callbackText != null) {
                        _this.callbackText(event);
                    }
                }else if (_this.canDrawShape && _this.onDrawShape){
                    _this.callBackShape({event, pageNumber : _this.pageNumber, type : 'mouseMove', idSVG : _this.idSvg})
                }
                else if (_this._scrollbarAction == true && _this.callBackScrollBar != null) {
                    _this.callBackScrollBar({ x: event.clientX, y: event.clientY, scroll: true, which: event.which });
                }
            };

            this._handleMouseUp = function (event) {
                event.preventDefault();
                if (event.which == 1 && _this._mouseButtonDown) {
                    _this._mouseButtonDown = false;

                    _this._strokeEnd(event);
                    // $('.imgContainer').removeClass('active zindx2 zindx1').addClass('zindx2');
                    _this._mctx.drawImage(_this.canvas, 0, 0);
                    _this._ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
                    if (_this.callbackHis != null) {
                        _this.callbackHis(_this.pageNumber);
                    }
                }
                if (event.which == 1 && _this._mouseDown) {
                    _this._mouseDown = false;
                    if (_this.callbackTextEnd != null) {
                        _this.callbackTextEnd(_this.pageNumber);
                    }
                }
                if (event.which == 1 && _this.canDrawShape && _this.onDrawShape){
                    _this.canDrawShape = false;
                    _this.onDrawShape = false;
                    _this.callBackShape({event, pageNumber : _this.pageNumber, type : 'mouseUp', idSVG : _this.idSvg})
                }
                _this._scrollbarAction = false;
                if(_this.callBackScrollBar) _this.callBackScrollBar({ scroll: false });
            };

            this._handleTouchStart = function (event) {
                event.preventDefault();
                var touchs = event.touches;
                if (touchs.length == 2) {
                    if (_this.callbackTouchZoom != null) {
                        var touch1 = { x: touchs[0].clientX, y: touchs[0].clientY };
                        var touch2 = { x: touchs[1].clientX, y: touchs[1].clientY };
                        _this.callbackTouchZoom({ touchs: [touch1, touch2], endTouch: false });
                    }
                    return;
                }

                $('.imgContainer,.svg-container').removeClass('active zindx1 zindx2 zindx3').addClass('zindx1');
                $('.stampProdCon').removeClass('active');
                if (_this.canPaint == true) {
                    _this._touched = true;
                    _this.lz = _this._data.length;
                    _this._strokeBegin(event);
                    _this._dataPop = [];
                } else if (_this.canText) {
                    _this._tochText = true;
                    if (_this.callbackTextStart != null) {
                        let tou = event.touches[0];
                        let data = _this._getPositionReal(event.touches[0].clientX, event.touches[0].clientY);
                        tou.offsetX = data.x;
                        tou.offsetY = data.y;
                        _this.callbackTextStart(tou, event, _this.pageNumber, data.w, data.h);
                    }
                }
                else if (_this.canEraser && _this.callbackEraser != null) {
                    let pointTouch = event.touches.length > 0 ? event.touches[0] : event.targetTouches[0];
                    let pos = _this._getPositionReal(pointTouch.clientX, pointTouch.clientY);
                    let x = pos.x * _this.canvas.width / _this.canvas.clientWidth;
                    let y = pos.y * _this.canvas.height / _this.canvas.clientHeight;
                    let dataDelete = _this.eraser(x, y);
                    if (dataDelete.type != null) {
                        _this._dataPop = [];
                        _this.callbackEraser(dataDelete);
                    }
                }
                else if(_this.canDrawShape){
                    _this.onDrawShape = true;
                    let tou = event.touches[0];
                    let data = _this._getPositionReal(event.touches[0].clientX, event.touches[0].clientY);
                    tou.offsetX = data.x;
                    tou.offsetY = data.y;
                    _this.callBackShape({event : tou, touch : tou , pageNumber: _this.pageNumber, type : 'touchStart', idSVG : _this.idSvg});
                }else if (_this.stampMode) {
                    _this.callBackMouseEvevent({event, pageNumber : _this.pageNumber, type : 'stampSign'})
                }
                else if (_this.callBackScrollBar != null) {
                    _this._scrollbarAction = true;
                    _this.callBackScrollBar({ x: event.touches[0].clientX, y: event.touches[0].clientY, scroll: true });
                }
            };

            this._handleTouchMove = function (event) {
                event.preventDefault();
                var touchs = event.touches;
                if (touchs.length == 2) {
                    if (_this.callbackTouchZoom != null) {
                        var touch1 = { x: touchs[0].clientX, y: touchs[0].clientY };
                        var touch2 = { x: touchs[1].clientX, y: touchs[1].clientY };
                        _this.callbackTouchZoom({ touchs: [touch1, touch2], endTouch: false });
                    }

                    if (_this.canPaint) {
                        _this.tm = true;
                    }
                    return;
                }

                if (_this._touched == true && touchs.length == 1) {
                    _this._strokeMoveUpdate(event);
                }
                else if (_this._tochText && touchs.length == 1) {
                    if (_this.callbackText != null) {
                        _this.callbackText(event.touches[0]);
                    }
                }
                else if (_this.canDrawShape && touchs.length == 1){
                    if(_this.onDrawShape){
                        
                        let tou = event.touches[0];
                        let data = _this._getPositionReal(event.touches[0].clientX, event.touches[0].clientY);
                        tou.offsetX = data.x;
                        tou.offsetY = data.y;
                        _this.callBackShape({event : tou ,touch : tou, pageNumber : _this.pageNumber, type : 'touchMove', idSVG : _this.idSvg})
                    }
                }
                else if (_this._scrollbarAction == true && _this.callBackScrollBar != null && !_this._tochText) {
                    _this.callBackScrollBar({ x: event.touches[0].clientX, y: event.touches[0].clientY, scroll: true });
                }
            };

            this._handleTouchEnd = function (event) {

                if (_this.callbackTouchZoom != null) {
                    _this.callbackTouchZoom({ touchs: [], endTouch: true });
                }

                var wasCanvasTouched = event.target === _this.canvas;
                if (wasCanvasTouched && _this._touched == true) {
                    event.preventDefault();
                    _this._touched = false;
                    _this._strokeEnd(event);
                    $('.imgContainer').removeClass('active zindx1 zindx2 zindx3').addClass('zindx3');
                    $('.svg-container').removeClass('active zindx1 zindx2 zindx3').addClass('zindx3');
                    _this._mctx.drawImage(_this.canvas, 0, 0);
                    _this._ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
                    if (_this.tm && _this.lz < _this._data.length) {
                        _this._data.pop();
                        _this.fromData(_this._data);
                        _this.tm = false;
                        _this.lz = 0;
                    } else {
                        if (_this.callbackHis != null) {
                            _this.callbackHis(_this.pageNumber);
                        }
                    }
                }
                if (wasCanvasTouched && _this._tochText) {
                    _this._tochText = false;
                    if (_this.callbackTextEnd != null) {
                        _this.callbackTextEnd(_this.pageNumber);
                    }
                }

                if (_this.canDrawShape){
                    _this.canDrawShape = false;
                    _this.onDrawShape = false;
                    _this.callBackShape({event : event.touches[0],touch : event.touches[0], pageNumber : _this.pageNumber, type : 'touchEnd', idSVG : _this.idSvg})
                }

                _this._scrollbarAction = false;
                _this.callBackScrollBar({ scroll: false });
            };

            this.velocityFilterWeight = options.velocityFilterWeight || 0.7;
            this.minWidth = options.minWidth || 0.5;
            this.maxWidth = options.maxWidth || 2.5;
            this.throttle = ('throttle' in options ? options.throttle : 16);
            this.minDistance = ('minDistance' in options ? options.minDistance : 5);
            if (this.throttle) {
                this._strokeMoveUpdate = throttle(FKPaint.prototype._strokeUpdate, this.throttle);
            }
            else {
                this._strokeMoveUpdate = FKPaint.prototype._strokeUpdate;
            }
            this.dotSize =
                options.dotSize ||
                function dotSize() {
                    return (this.minWidth + this.maxWidth) / 2;
                };
            this.penColor = options.penColor || 'black';
            this.backgroundColor = options.backgroundColor || 'rgb(0,0,0)';
            this.onBegin = options.onBegin;
            this.onEnd = options.onEnd;
            this.clear();
            this.on();
        }

        // ~ FKVL
        FKPaint.prototype.setCanPaint = function (canPaint, highLight) {
            this.canPaint = canPaint || false;
            this.canEraser = false;
            this.highLight = highLight ? highLight : false;
        };

        // ~ FKVL
        FKPaint.prototype.setOpacity = function (opacity) {
            this.HLopacity = opacity;
        };

        // ~ FKVL
        FKPaint.prototype.setCanText = function (opt) {
            this.canText = opt || false;
        };

        // ~ FKVL
        FKPaint.prototype.setCanEraser = function (canEraser) {
            this.canEraser = canEraser || false;
            this.canPaint = canEraser ? false : this.canPaint;
            this.canText = canEraser ? false : this.canText;
        };

        // ~ FKVL
        FKPaint.prototype.setColor = function (options) {
            this.penColor = options.penColor || this.penColor;
            this.backgroundColor = options.backgroundColor || this.backgroundColor;
        };

        // ~ FKVL
        FKPaint.prototype.setDotSize = function (dotSize) {
            this.dotSize = dotSize || this.dotSize();
        };

        // ~ FKVL
        FKPaint.prototype.clear = function () {
            var ctx = this._ctx;
            var canvas = this.canvas;
            this._mctx.clearRect(0, 0, canvas.width, canvas.height);
            this._data = [];
            this._reset();
            this._isEmpty = true;
        };

        FKPaint.prototype.fromDataURL = function (dataUrl, options, callback) {
            var _this = this;
            if (options === void 0) { options = {}; }
            var image = new Image();
            var ratio = options.ratio || window.devicePixelRatio || 1;
            var width = options.width || this.canvas.width / ratio;
            var height = options.height || this.canvas.height / ratio;
            this._reset();
            image.onload = function () {
                _this._ctx.drawImage(image, 0, 0, width, height);
                if (callback) {
                    callback();
                }
            };
            image.onerror = function (error) {
                if (callback) {
                    callback(error);
                }
            };
            image.src = dataUrl;
            this._isEmpty = false;
        };

        FKPaint.prototype.toDataURL = function (type, encoderOptions) {
            if (type === void 0) { type = 'image/png'; }
            switch (type) {
                case 'image/svg+xml':
                    return this._toSVG();
                default:
                    return this.canvas.toDataURL(type, encoderOptions);
            }
        };

        FKPaint.prototype.on = function () {
            this.canvas.style.touchAction = 'none';
            this.canvas.style.msTouchAction = 'none';
            this._handleMouseEvents();
            if ('ontouchstart' in window) {
                this._handleTouchEvents();
            }
        };

        FKPaint.prototype.destroy = function () {
            this.canvas.style.touchAction = 'auto';
            this.canvas.style.msTouchAction = 'auto';
            this.canvas.removeEventListener('pointerdown', this._handleMouseDown);
            this.canvas.removeEventListener('pointermove', this._handleMouseMove);
            this.canvas.removeEventListener('mousewheel', this._handleMousewheel);
            document.removeEventListener('pointerup', this._handleMouseUp);
            this.canvas.removeEventListener('mousedown', this._handleMouseDown);
            this.canvas.removeEventListener('mousemove', this._handleMouseMove);
            this.canvas.removeEventListener('mousewheel', this._handleMousewheel);
            document.removeEventListener('mouseup', this._handleMouseUp);
            this.canvas.removeEventListener('touchstart', this._handleTouchStart);
            this.canvas.removeEventListener('touchmove', this._handleTouchMove);
            this.canvas.removeEventListener('touchend', this._handleTouchEnd);
        };

        FKPaint.prototype.isEmpty = function () {
            return this._isEmpty;
        };

        FKPaint.prototype.fromData = function (pointGroups, lastSize) {
            var _this = this;
            this.clear();
            this._fromData(pointGroups, function (_a) {
                var color = _a.color, width = _a.width, curve = _a.curve, highLight = _a.highLight, opacity = _a.opacity;
                return _this._drawCurve({ color, width, curve, highLight, opacity });
            }, function (_a) {
                var color = _a.color, width = _a.width, point = _a.point, highLight = _a.highLight, opacity = _a.opacity;
                return _this._drawDot({ color, width, point, highLight, opacity });
            }, lastSize);

            this._data = pointGroups;

        };

        FKPaint.prototype.getUndoData = function () {
            return this._data;
        };

        FKPaint.prototype.getRedoData = function () {
            return this._dataPop;
        };

        FKPaint.prototype.setRedoData = function (dataUrl) {
            this._dataPop = dataUrl;
        };

        FKPaint.prototype.undo = function (unData = null) {
            let dataUndoFilter = [];
            if (unData != null && (unData.type == "del" || (unData.type == "draw" && unData.status == "delete"))) {
                dataUndoFilter = JSON.parse(JSON.stringify(this._data));
                dataUndoFilter.push(unData.data);
            } else {
                let x = JSON.stringify(unData.data, (k, v) => v && typeof v === 'object' ? v : '' + v);
                this._data.map(b => {
                    let y = JSON.stringify(b, (k, v) => v && typeof v === 'object' ? v : '' + v);
                    if (x != y) {
                        dataUndoFilter.push(b);
                    } else {
                        this._dataPop.push(b);
                    }
                });
            }
            this.clear();

            this.fromData(dataUndoFilter, null);
        };

        FKPaint.prototype.redo = function (reData = null) {
            let dataRedoFilter = JSON.parse(JSON.stringify(this._data));

            if (reData.type == 'del' || (reData.type == "draw" && reData.status == "delete")) {
                let x = JSON.stringify(reData.data, (k, v) => v && typeof v === 'object' ? v : '' + v);
                let indexDel = -1;
                dataRedoFilter.map((b, index) => {
                    if (x == JSON.stringify(b, (k, v) => v && typeof v === 'object' ? v : '' + v)) indexDel = index;
                });
                if (indexDel > -1) dataRedoFilter.splice(indexDel, 1);
            } else {
                dataRedoFilter.push(reData.data);
            }
            this.clear();
            this.fromData(dataRedoFilter, null);
        };

        FKPaint.prototype.xpv = function (data) {
            let datacurrent = [];
            datacurrent.push(data);
            this.clear();
            this.fromData(datacurrent, null);
        };

        // ~ FKVL
        FKPaint.prototype.eraser = function (x, y) {
            if (this._data.length == 0) {
                return -1;
            }

            let index = -1;
            let itemRemove = {};
            for (let i = 0; i < this._data.length; i++) {
                let penWidth = (+this._data[i].width) || (+this.dotSize);
                penWidth *= (penWidth == 0.25 ? 30 : (penWidth == 0.5 ? 25 : (penWidth == 0.75 ? 20 : (penWidth == 1 ? 15 : (penWidth == 1.5 ? 10 : (penWidth == 2.25 ? 7 : 3))))));
                let _lastPointsEraser = [];
                for (let j = 0; j < this._data[i].points.length; j++) {
                    if (j == 0) {
                        let pointXPlus = +(this._data[i].points[j].x + (+penWidth));
                        let pointXMinus = +(this._data[i].points[j].x - (+penWidth));
                        let pointYPlus = +(this._data[i].points[j].y + (+penWidth));
                        let pointYMinus = +(this._data[i].points[j].y - (+penWidth));

                        if (x <= pointXPlus && x >= pointXMinus && y <= pointYPlus && y >= pointYMinus) {
                            index = i;
                            break;
                        }
                        let basicPoint = this._data[i].points[j];
                        let point = new Point(basicPoint.x, basicPoint.y, basicPoint.time);
                        _lastPointsEraser.push(point);
                    }
                    else {
                        var basicPoint = this._data[i].points[j];
                        var point = new Point(basicPoint.x, basicPoint.y, basicPoint.time);
                        var curve = this._addPointEraser(point, _lastPointsEraser);
                        if (curve) {
                            let isSamePoint = this.checkSamePoint(curve, penWidth, { x: x, y: y });
                            if (isSamePoint == true) {
                                index = i;

                                break;
                            }
                        }
                    }
                }

                if (index > -1) {
                    break;
                }
            }

            if (index > -1) {
                let datacurrent = this._data;
                itemRemove = { type: "del", page: this.pageNumber, data: this._data[index] }
                datacurrent.splice(index, 1);
                this.clear();
                this.fromData(datacurrent, null);
            }
            return itemRemove;
        };

        FKPaint.prototype._addPointEraser = function (point, _lastPointsEraser) {
            _lastPointsEraser.push(point);
            if (_lastPointsEraser.length > 2) {
                if (_lastPointsEraser.length === 3) {
                    _lastPointsEraser.unshift(_lastPointsEraser[0]);
                }
                var widths = this._calculateCurveWidths(_lastPointsEraser[1], _lastPointsEraser[2]);
                var curve = Bezier.fromPoints(_lastPointsEraser, widths);
                _lastPointsEraser.shift();

                return curve;
            }

            return null;
        };

        // ~ FKVL
        FKPaint.prototype.checkSamePoint = function (curve, penWidthAvg, pointCheck) {
            let drawSteps = Math.floor(curve.length()) * 2;
            for (let i = 0; i < drawSteps; i += 1) {
                let t = i / drawSteps;
                let tt = t * t;
                let ttt = tt * t;
                let u = 1 - t;
                let uu = u * u;
                let uuu = uu * u;

                let x = uuu * curve.startPoint.x;
                x += 3 * uu * t * curve.control1.x;
                x += 3 * u * tt * curve.control2.x;
                x += ttt * curve.endPoint.x;

                let y = uuu * curve.startPoint.y;
                y += 3 * uu * t * curve.control1.y;
                y += 3 * u * tt * curve.control2.y;
                y += ttt * curve.endPoint.y;

                let pointXPlus = x + (+penWidthAvg);
                let pointXMinus = x - (+penWidthAvg);
                let pointYPlus = y + (+penWidthAvg);
                let pointYMinus = y - (+penWidthAvg);

                if (pointCheck.x <= pointXPlus && pointCheck.x >= pointXMinus && pointCheck.y <= pointYPlus && pointCheck.y >= pointYMinus) {
                    return true;
                }
            }

            return false;
        };

        FKPaint.prototype.rePaint = function (undoData, lastSize) {
            if (undoData == null || undoData.length == 0) {
                return;
            }

            this._data = undoData;
            this._dataPop = [];
            let datacurrent = this._data;

            this.clear();
            this.fromData(datacurrent, lastSize);
        };

        FKPaint.prototype.zoomplus = function (widthNum, heightNum) {
            this._mctx.scale(widthNum, heightNum);
            this._mctx.strokeRect(0, 0, this.canvasMain.width, this.canvasMain.height);
        };

        FKPaint.prototype._strokeBegin = function (event) {
            var newPointGroup = {
                color: this.penColor,
                width: typeof this.dotSize === 'function' ? this.dotSize() : this.dotSize,
                points: [],
                highLight: this.highLight,
                opacity: (this.highLight ? this.HLopacity : 1)
            };
            if (typeof this.onBegin === 'function') {
                this.onBegin(event);
            }
            this._data.push(newPointGroup);
            this._reset();
            this._strokeUpdate(event);
        };

        FKPaint.prototype._strokeUpdate = function (event) {
            var pos = { x: 0, y: 0 };
            if ((event.touches || event.targetTouches) && (event.touches.length > 0 || event.targetTouches.length > 0)) {
                var pointTouch = event.touches.length > 0 ? event.touches[0] : event.targetTouches[0];
                pos = this._getPositionReal(pointTouch.clientX, pointTouch.clientY);
                pos.x = pos.x * this.canvas.width / this.canvas.clientWidth;
                pos.y = pos.y * this.canvas.height / this.canvas.clientHeight;
            }
            else {
                pos.x = event.offsetX * this.canvas.width / this.canvas.clientWidth;
                pos.y = event.offsetY * this.canvas.height / this.canvas.clientHeight;
            }
            var point = this._createPoint(pos.x, pos.y);
            var lastPointGroup = this._data[this._data.length - 1];
            var lastPoints = lastPointGroup.points;
            var lastPoint = lastPoints.length > 0 && lastPoints[lastPoints.length - 1];
            var isLastPointTooClose = lastPoint
                ? point.distanceTo(lastPoint) <= 0.1
                : false;
            var color = lastPointGroup.color;
            var width = lastPointGroup.width;
            var highLight = lastPointGroup.highLight;
            var opacity = lastPointGroup.opacity;
            if (!lastPoint || !(lastPoint && isLastPointTooClose)) {
                var curve = this._addPoint(point);
                if (!lastPoint) {
                    this._drawDot({ color, width, point, highLight, opacity });
                }
                else if (curve) {
                    this._drawCurve({ color, width, curve, highLight, opacity });
                }
                lastPoints.push({
                    time: point.time,
                    x: point.x,
                    y: point.y
                });
            }
        };

        FKPaint.prototype._strokeEnd = function (event) {
            this._strokeUpdate(event);
            if (typeof this.onEnd === 'function') {
                this.onEnd(event);
            }
        };

        // ~ FKVL
        FKPaint.prototype._getPositionReal = function (sx, sy) {
            var rect = this.canvas.getBoundingClientRect();
            let degree = (+this.canvas.parentElement.getAttribute('rotate')),
                cale = (+this.canvas.parentElement.getAttribute('scale')),
                currentScale = 1 / cale,
                realX = (sx - rect.left) * currentScale,
                realY = (sy - rect.top) * currentScale,
                w = rect.width * currentScale - realX,
                h = rect.height * currentScale - realY,
                res = {};
            switch (degree) {
                case 0:
                    res = { x: realX, y: realY, w, h };
                    break;
                case 90:
                    res = { x: realY, y: (rect.width * currentScale - realX), w, h };
                    break;
                case 180:
                    res = { x: (rect.width * currentScale - realX), y: (rect.height * currentScale - realY), w, h };
                    break;
                case 270:
                    res = { x: (rect.height * currentScale - realY), y: realX, w, h };
                    break;
            }
            return res;
        };

        FKPaint.prototype._handlePointerEvents = function () {
            this._mouseButtonDown = false;
            this.canvas.addEventListener('pointerdown', this._handleMouseDown);
            this.canvas.addEventListener('pointermove', this._handleMouseMove);
            document.addEventListener('pointerup', this._handleMouseUp);
            this.canvas.addEventListener('mousewheel', this._handleMousewheel);
        };

        FKPaint.prototype._handleMouseEvents = function () {
            this._mouseButtonDown = false;
            this.canvas.addEventListener('mousedown', this._handleMouseDown);
            this.canvas.addEventListener('mousemove', this._handleMouseMove);
            document.addEventListener('mouseup', this._handleMouseUp);
            this.canvas.addEventListener('mousewheel', this._handleMousewheel);
        };

        FKPaint.prototype._handleTouchEvents = function () {
            this._mouseButtonDown = false;
            this._touched = false;
            this.canvas.addEventListener('touchstart', this._handleTouchStart);
            this.canvas.addEventListener('touchmove', this._handleTouchMove);
            this.canvas.addEventListener('touchend', this._handleTouchEnd);
        };

        FKPaint.prototype._reset = function () {
            this._lastPoints = [];
            this._lastVelocity = 0;
            this._lastWidth = (this.minWidth + this.maxWidth) / 2;
            this._ctx.fillStyle = this.penColor;
        };

        FKPaint.prototype._createPoint = function (x, y) {
            var rect = this.canvas.getBoundingClientRect();
            return new Point(x, y, new Date().getTime());
        };

        FKPaint.prototype._addPoint = function (point) {
            var _lastPoints = this._lastPoints;
            _lastPoints.push(point);
            if (_lastPoints.length > 2) {
                if (_lastPoints.length === 3) {
                    _lastPoints.unshift(_lastPoints[0]);
                }
                var widths = this._calculateCurveWidths(_lastPoints[1], _lastPoints[2]);
                var curve = Bezier.fromPoints(_lastPoints, widths);
                _lastPoints.shift();
                return curve;
            }
            return null;
        };

        FKPaint.prototype._calculateCurveWidths = function (startPoint, endPoint) {
            var velocity = this.velocityFilterWeight * endPoint.velocityFrom(startPoint) +
                (1 - this.velocityFilterWeight) * this._lastVelocity;
            var newWidth = this._strokeWidth(velocity);
            var widths = {
                end: newWidth,
                start: this._lastWidth
            };
            this._lastVelocity = velocity;
            this._lastWidth = newWidth;
            return widths;
        };

        FKPaint.prototype._strokeWidth = function (velocity) {
            return Math.max(this.maxWidth / (velocity + 1), this.minWidth);
        };

        FKPaint.prototype._UUID = function (){
            var dt = new Date().getTime();
            var uuid = 'xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (dt + Math.random()*16)%16 | 0;
                dt = Math.floor(dt/16);
                return (c=='x' ? r :(r&0x3|0x8)).toString(16);
            });
            return uuid;
        }

        FKPaint.prototype._drawCurveSegment = function (x, y, width, highLight, opacity) {
            var ctx = this._ctx;
            this._mctx.globalAlpha = parseFloat(opacity);
            this.canvas.style.opacity = parseFloat(opacity);
            ctx.moveTo(x, y);
            ctx.arc(x, y, width, 0, 2 * Math.PI, false);
            this._isEmpty = false;
        };

        FKPaint.prototype._drawCurve = function (_a) {
            var color = _a.color, width = _a.width, curve = _a.curve, highLight = _a.highLight, opacity = _a.opacity;
            var ctx = this._ctx;
            var widthDelta = curve.endWidth - curve.startWidth;
            var drawSteps = Math.floor(curve.length()) * 2;
            ctx.beginPath();
            ctx.fillStyle = color;
            for (var i = 0; i < drawSteps; i += 1) {
                var t = i / drawSteps, tt = t * t, ttt = tt * t, u = 1 - t, uu = u * u, uuu = uu * u;
                var x = uuu * curve.startPoint.x;
                x += 3 * uu * t * curve.control1.x;
                x += 3 * u * tt * curve.control2.x;
                x += ttt * curve.endPoint.x;
                var y = uuu * curve.startPoint.y;
                y += 3 * uu * t * curve.control1.y;
                y += 3 * u * tt * curve.control2.y;
                y += ttt * curve.endPoint.y;
                this._drawCurveSegment(x, y, width, highLight, opacity);
            }
            ctx.closePath();
            ctx.fill();
        };

        FKPaint.prototype._drawDot = function (_a) {
            var color = _a.color, width = _a.width, point = _a.point, highLight = _a.highLight, opacity = _a.opacity;
            var ctx = this._ctx;

            ctx.beginPath();
            this._drawCurveSegment(point.x, point.y, width, highLight, opacity);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        };

        FKPaint.prototype._fromData = function (pointGroups, drawCurve, drawDot, lastSize) {
            for (var _i = 0, pointGroups_1 = pointGroups; _i < pointGroups_1.length; _i++) {
                var group = pointGroups_1[_i];
                var color = group.color, width = group.width, points = group.points, highLight = group.highLight, opacity = group.opacity;
                if (points.length > 2) {
                    for (var j = 0; j < points.length; j += 1) {
                        var basicPoint = points[j];
                        basicPoint.x = lastSize != null ? (basicPoint.x * (this.canvas.width / lastSize.width)) : basicPoint.x;
                        basicPoint.y = lastSize != null ? (basicPoint.y * (this.canvas.height / lastSize.height)) : basicPoint.y;
                        var point = new Point(basicPoint.x, basicPoint.y, basicPoint.time);
                        this.penColor = color;
                        if (j === 0) this._reset();
                        var curve = this._addPoint(point);
                        if (curve) drawCurve({ color, width, curve, highLight, opacity });
                    }
                }
                else {
                    this._reset();
                    drawDot({
                        color: color,
                        width: width,
                        point: points[0],
                        highLight: highLight,
                        opacity: opacity
                    });
                }

                this._mctx.drawImage(this.canvas, 0, 0);
                this._ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        };

        FKPaint.prototype._toSVG = function () {
            var _this = this;
            var pointGroups = this._data;
            var ratio = Math.max(window.devicePixelRatio || 1, 1);
            var minX = 0;
            var minY = 0;
            var maxX = this.canvas.width / ratio;
            var maxY = this.canvas.height / ratio;
            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', this.canvas.width.toString());
            svg.setAttribute('height', this.canvas.height.toString());
            this._fromData(pointGroups, function (_a) {
                var color = _a.color, curve = _a.curve;
                var path = document.createElement('path');
                if (!isNaN(curve.control1.x) &&
                    !isNaN(curve.control1.y) &&
                    !isNaN(curve.control2.x) &&
                    !isNaN(curve.control2.y)) {
                    var attr = "M " + curve.startPoint.x.toFixed(3) + "," + curve.startPoint.y.toFixed(3) + " " +
                        ("C " + curve.control1.x.toFixed(3) + "," + curve.control1.y.toFixed(3) + " ") +
                        (curve.control2.x.toFixed(3) + "," + curve.control2.y.toFixed(3) + " ") +
                        (curve.endPoint.x.toFixed(3) + "," + curve.endPoint.y.toFixed(3));
                    path.setAttribute('d', attr);
                    path.setAttribute('stroke-width', (curve.endWidth * 2.25).toFixed(3));
                    path.setAttribute('stroke', color);
                    path.setAttribute('fill', 'none');
                    path.setAttribute('stroke-linecap', 'round');
                    svg.appendChild(path);
                }
            }, function (_a) {
                var color = _a.color, point = _a.point;
                var circle = document.createElement('circle');
                var dotSize = typeof _this.dotSize === 'function' ? _this.dotSize() : _this.dotSize;
                circle.setAttribute('r', dotSize.toString());
                circle.setAttribute('cx', point.x.toString());
                circle.setAttribute('cy', point.y.toString());
                circle.setAttribute('fill', color);
                svg.appendChild(circle);
            }, null);
            var prefix = 'data:image/svg+xml;base64,';
            var header = '<svg' +
                ' xmlns="http://www.w3.org/2000/svg"' +
                ' xmlns:xlink="http://www.w3.org/1999/xlink"' +
                (" viewBox=\"" + minX + " " + minY + " " + maxX + " " + maxY + "\"") +
                (" width=\"" + maxX + "\"") +
                (" height=\"" + maxY + "\"") +
                '>';
            var body = svg.innerHTML;
            if (body === undefined) {
                var dummy = document.createElement('dummy');
                var nodes = svg.childNodes;
                dummy.innerHTML = '';
                for (var i = 0; i < nodes.length; i += 1) {
                    dummy.appendChild(nodes[i].cloneNode(true));
                }
                body = dummy.innerHTML;
            }
            var footer = '</svg>';
            var data = header + body + footer;
            return prefix + btoa(data);
        };

        FKPaint.prototype.setFKPageNumber = function (pageNumber) {
            this.pageNumber = pageNumber;
        };

        FKPaint.prototype.updateCanvas = function (canvas, canvasMain) {
            this.canvas = canvas;
            this.canvasMain = canvasMain;
            this._ctx = this.canvas.getContext('2d');
            this._mctx = this.canvasMain.getContext("2d");
        };

        FKPaint.prototype.setShapeDraw = function (canDraw) {
            this.canDrawShape = canDraw;
        };

        FKPaint.prototype.getIdSvg = function () {
           return this.idSvg;
        };

        FKPaint.prototype.setStampMode = function (mode) {
            this.stampMode = mode;
        };

        return FKPaint;
    }());

    var Bezier = (function () {
        function Bezier(startPoint, control2, control1, endPoint, startWidth, endWidth) {
            this.startPoint = startPoint;
            this.control2 = control2;
            this.control1 = control1;
            this.endPoint = endPoint;
            this.startWidth = startWidth;
            this.endWidth = endWidth;
        }
        Bezier.fromPoints = function (points, widths) {
            var c2 = this.calculateControlPoints(points[0], points[1], points[2]).c2;
            var c3 = this.calculateControlPoints(points[1], points[2], points[3]).c1;
            return new Bezier(points[1], c2, c3, points[2], widths.start, widths.end);
        };
        Bezier.calculateControlPoints = function (s1, s2, s3) {
            var dx1 = s1.x - s2.x;
            var dy1 = s1.y - s2.y;
            var dx2 = s2.x - s3.x;
            var dy2 = s2.y - s3.y;
            var m1 = { x: (s1.x + s2.x) / 2.0, y: (s1.y + s2.y) / 2.0 };
            var m2 = { x: (s2.x + s3.x) / 2.0, y: (s2.y + s3.y) / 2.0 };
            var l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
            var l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            var dxm = m1.x - m2.x;
            var dym = m1.y - m2.y;
            var k = l2 / (l1 + l2);
            var cm = { x: m2.x + dxm * k, y: m2.y + dym * k };
            var tx = s2.x - cm.x;
            var ty = s2.y - cm.y;
            return {
                c1: new Point(m1.x + tx, m1.y + ty),
                c2: new Point(m2.x + tx, m2.y + ty)
            };
        };
        Bezier.prototype.length = function () {
            var steps = 10;
            var length = 0;
            var px;
            var py;
            for (var i = 0; i <= steps; i += 1) {
                var t = i / steps;
                var cx = this.point(t, this.startPoint.x, this.control1.x, this.control2.x, this.endPoint.x);
                var cy = this.point(t, this.startPoint.y, this.control1.y, this.control2.y, this.endPoint.y);
                if (i > 0) {
                    var xdiff = cx - px;
                    var ydiff = cy - py;
                    length += Math.sqrt(xdiff * xdiff + ydiff * ydiff);
                }
                px = cx;
                py = cy;
            }
            return length;
        };
        Bezier.prototype.point = function (t, start, c1, c2, end) {
            return (start * (1.0 - t) * (1.0 - t) * (1.0 - t))
                + (3.0 * c1 * (1.0 - t) * (1.0 - t) * t)
                + (3.0 * c2 * (1.0 - t) * t * t)
                + (end * t * t * t);
        };

        return Bezier;
    }());

    function throttle(fn, wait) {
        if (wait === void 0) { wait = 250; }
        var previous = 0;
        var timeout = null;
        var result;
        var storedContext;
        var storedArgs;
        var later = function () {
            previous = Date.now();
            timeout = null;
            result = fn.apply(storedContext, storedArgs);
            if (!timeout) {
                storedContext = null;
                storedArgs = [];
            }
        };
        return function wrapper() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var now = Date.now();
            var remaining = wait - (now - previous);
            storedContext = this;
            storedArgs = args;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = fn.apply(storedContext, storedArgs);
                if (!timeout) {
                    storedContext = null;
                    storedArgs = [];
                }
            }
            else if (!timeout) {
                timeout = window.setTimeout(later, remaining);
            }
            return result;
        };
    }

    return FKPaint;

})));
