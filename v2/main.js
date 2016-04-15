/**
 * Created by wangcy on 2015/6/9.
 */
require(["./src/pull-refresh.min"], function(refresh) {
    var refreshMethod = refresh();
    refreshMethod.on(function() {
        console.log("开始刷新动画", performance.now());

        /*setTimeout(function() {
         refreshMethod.reject();

         refreshMethod.resolve();

         }, 0);*/


        setTimeout(function() {
            refreshMethod.resolve();

            //refreshMethod.reject();
        }, 3000);
    }).on(function() {
        console.log("开始刷新动画", performance.now());
    }).done(function() {
        console.log("刷新完成");
    }).fail(function() {
        console.log("加载失败");
    });

    refreshMethod.fail(function() {
        document.body.firstElementChild.insertAdjacentText("beforebegin", "refresh fail ");
    });

    refreshMethod.done(function() {
        document.body.firstElementChild.insertAdjacentText("beforebegin", "refresh done ");
    });

    var btnOff = document.getElementById("btnOff"),
        listNode = document.getElementById("list"),
        listStyle = listNode.style;

    btnOff.addEventListener("click", function() {
        refreshMethod.off();
    }, false);

    listNode.addEventListener("click", function() {
        setTimeout(function() {
            console.log("listNode click", performance.now());
        }, 0);

        for(var i = 0; i < 5; i++) {
            console.log(i);
        }
    }, false);

    function toHex(num) {
        var string = num.toString(16);

        if(string.length < 2) {
            string = string + string;
        }

        return string;
    }
});