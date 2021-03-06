/**
 * Created by wangchunyang on 16/4/2.
 */
;(function(factory) {
    if("function" === typeof define && define.amd) {
        define(factory);
    } else if("object" === typeof exports) {
        module.exports = factory();
    } else {
        window.pullRefresh = factory();
    }
}(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

    window.requestAnimationFrame = requestAnimationFrame;
    window.cancelAnimationFrame = cancelAnimationFrame;


    function styleHyphenFormat(propertyName) {
        function format(match) {
            return "-" + match.toLowerCase();
        }

        if(propertyName.indexOf("-") !== -1) {
            return propertyName.toLowerCase();
        } else {
            return propertyName.replace(/^[A-Z]/, function(match) {
                return match.toLowerCase();
            }).replace(/^(webkit|moz|ms|o)/i, function(match) {
                return "-" + match;
            }).replace(/[A-Z]/g, format);
        }
    }

    function styleUpperFormat(propertyName) {
        function format(match) {
            return match.charAt(1).toUpperCase();
        }
        return propertyName.replace(/^-/, "").replace(/-[a-zA-Z]/g, format);
    }

    var getCssPrefix = (function() {
        var prx = ["", "-webkit-", "-moz-", "-ms-", "-o-"],
            div = document.createElement("div"),
            style = div.style,
            value;

        return function(property) {
            property = styleHyphenFormat(property);

            for(var i = 0, length = prx.length; i < length; i++) {
                value = "";

                if(!prx[i]) {
                    value = property;
                } else {
                    value = prx[i] + property;
                }

                if(value in style) {
                    return value;
                }
            }
            div = null;
        }
    }());

    // 获取TransitionEnd事件名称
    function getTransitionEndEvent() {
        if(typeof TransitionEvent !== "undefined") {
            return "transitionend";
        } else if(typeof WebKitTransitionEvent !== "undefined") {
            return "webkitTransitionEnd";
        }
    }

    function getAnimationEvent(type) {
        if(/^Animation(Start|Iteration|End)$/.test(type)) {
            if(typeof AnimationEvent !== "undefined") {
                return type.toLowerCase();
            } else if(typeof WebKitAnimationEvent !== "undefined") {
                return "webkit" + type;
            }
        }
    }

    // 是否支持Touch事件
    var isSupportedTouch = (function() {
        var is = false;
        try {
            var type = document.createEvent("TouchEvent");
            type.initEvent("touchstart");
            is = true;
        } catch (e) {}
        return is;
    }());

    var isSupportedAnimationEvent = (function() {
        return !!(typeof AnimationEvent !== "undefined" || typeof WebKitAnimationEvent !== "undefined");
    }());

    // 是否支持Transition事件
    var isSupportedTranstionEvent = (function () {
        return !!(typeof TransitionEvent !== "undefined" || typeof WebKitTransitionEvent !== "undefined");
    }());


    function pullRefresh() {
        var changeRatio = 2.1,     // 滑动距离和下拉距离差比
            maxDistance = 110,     // 最大下拉距离
            triggerDistance = 70;  // 触发时间距离

        var triggerColor = "rgb(66, 133, 244)";

        var rgb = triggerColor.substring(4, triggerColor.length - 1).split(","),
            R = parseInt(rgb[0]),
            G = parseInt(rgb[1]),
            B = parseInt(rgb[2]);

        var readyState = "complete";

        var onList = [],
            doneList = [],
            failList = [];

        var body = document.body,
            iconNode = document.getElementById("pullRefresh");

        if(null === iconNode) {
            iconNode = document.createElement("div");
            iconNode.id = "pullRefresh";
            body.appendChild(iconNode);
        }

        var iconStyle = iconNode.style;

        var transitionEnd = getTransitionEndEvent(),
            transform = getCssPrefix("transform"),
            transition = getCssPrefix("transition");

        var touchStartScreenY = {},   // 记录touchStart屏幕点Y坐标,identifier记录screenY
            isTop,               // 判断触摸触发的时候页面滚动条是否在顶部
            touchIdentifier;     // 记录第一次touchStart触发点identifier,touchEnd时候需要判断是否为同一个触摸点

        var transitionStatus = 0;  // 记录过渡动画状态

        var translateY,   // icon滑动Y轴值
            rotate;       // icon旋转角度

        window.addEventListener("touchstart", function(event) {
            var changedTouches = event.changedTouches,
                touches = event.touches,
                changedTouch = changedTouches[0],
                touch = touches[0];

            touchStartScreenY[changedTouch.identifier] = changedTouch.screenY;

            if(touches.length === 1) {
                touchIdentifier = touch.identifier;

                isTop = body.scrollTop === 0;
            }
        }, false);

        window.addEventListener("touchmove", function(event) {
            var touches = event.touches,
                touch = touches[0];

            if(touch.identifier === touchIdentifier) {
                var moveY = touch.screenY - touchStartScreenY[touchIdentifier],
                    changeY = moveY / changeRatio,
                    range = Math.min(1, changeY / triggerDistance);

                if(body.scrollTop === 0 && moveY >= 0) {
                    event.preventDefault();
                }

                if(isTop && moveY >= 0 && !transitionStatus) {
                    translateY = Math.min(maxDistance, changeY);
                    rotate = moveY * 2;

                    iconStyle[transform] = "translateY(" + translateY + "px) rotate(" + rotate + "deg)";
                    iconStyle.backgroundColor = "rgb(" + parseInt(255 - (255 - R) * range) + ", " + parseInt(255 - (255 - G) * range) +
                        ", " + parseInt(255 - (255 - B) * range) + ")";
                }
            }

        }, false);

        window.addEventListener("touchend", function(event) {
            var changedTouches = event.changedTouches,
                changedTouch = changedTouches[0],
                touches = event.touches;

            if(changedTouch.identifier === touchIdentifier || touches.length === 0) {
                var moveY = changedTouch.screenY - touchStartScreenY[touchIdentifier],
                    changeY = moveY / changeRatio;

                if(isTop && moveY > 0 && !transitionStatus) {
                    if(changeY >= triggerDistance) {  // 触发刷新,第一步动画到触发距离
                        transitionStatus = 1;

                        readyState = "pending";

                        iconStyle[transition] = "all .2s ease-in";
                        iconStyle[transform] = "translateY(" + (triggerDistance + 0.01) + "px) rotate(" + rotate + "deg)";
                    } else {  // 未触发刷新,回到初始状态
                        transitionStatus = -1;

                        readyState = "cancel";

                        iconStyle[transition] = "all .3s ease-out";
                        iconStyle[transform] = "translateY(0px) rotate(" + rotate + "deg)";
                        iconStyle.backgroundColor = "rgb(255, 255, 255)";
                    }
                }
            }

            if(touches.length === 0) {
                touchStartScreenY = {};
            }
        }, false);

        window.addEventListener("touchcancel", function() {
            if(readyState === "complete") {
                _reset();
            }
        }, false);

        function _reset() {  // 复原函数
            iconNode.removeAttribute("style");

            readyState = "complete";

            transitionStatus = 0;
            touchIdentifier = undefined;
        }


        var requestID;

        function rotateAnimation() {
            iconStyle.removeProperty(transition);
            function f() {
                iconStyle[transform] = "translateY(" + triggerDistance + "px) rotate(" + (rotate += 14) + "deg)";
                requestID = requestAnimationFrame(f);
            }

            f();
        }

        iconNode.addEventListener(transitionEnd, function(event) {
            if(transitionStatus === -1) {  // 未能触发刷新动作
                _reset();
            } else if(transitionStatus === 1) {  // 回到触发刷新距离,开始旋转动画,执行on方法传递函数
                rotateAnimation();

                for(var i = 0; i < onList.length; i++) {
                    onList[i]();
                }
            } else if(transitionStatus === 2) {  // 刷新完成,执行done方法传递函数
                _reset();

                for(var m = 0; m < doneList.length; m++) {
                    doneList[m]();
                }
            } else if(transitionStatus === 3) {  // 刷新失败,执行fail方法传递函数
                _reset();

                for(var j = 0; j < failList.length; j++) {
                    failList[j]();
                }
            }
        }, false);

        function on(callback) {
            if("function" === typeof callback) {
                onList.push(callback);
            }

            return object;
        }

        function done(callback) {
            if("function" === typeof callback) {
                doneList.push(callback);
            }

            return object;
        }

        function fail(callback) {
            if("function" === typeof callback) {
                failList.push(callback);
            }

            return object;
        }

        function resolve() {
            if(transitionStatus === 1) {

                transitionStatus = 0;

                readyState = "resolve";

                setTimeout(function() {
                    cancelAnimationFrame(requestID);

                    iconStyle[transition] = "all .3s ease-out";
                    iconStyle[transform] = "translateY(" + triggerDistance + "px) rotate(" + (720 + rotate) + "deg) scale(0.1)";
                    iconStyle.opacity = 0;

                    transitionStatus = 2;
                }, 300);
            }
        }

        function reject() {
            if(transitionStatus === 1) {

                transitionStatus = 0;

                readyState = "reject";

                setTimeout(function() {
                    cancelAnimationFrame(requestID);

                    iconStyle[transition] = "all .3s ease-out";
                    iconStyle[transform] = "translateY(0px) rotate(" + rotate + "deg)";
                    iconStyle.backgroundColor = "rgb(255, 255, 255)";

                    transitionStatus = 3;
                }, 300);
            }
        }

        function off() {
            doneList.length = 0;
            failList.length = 0;

            return object;
        }

        var object = {
            on: on,
            done: done,
            fail: fail,
            off: off,
            reject: reject,
            resolve: resolve
        };

        return object;

    }

    return pullRefresh;
}));
