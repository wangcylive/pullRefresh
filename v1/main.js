/**
 * Created by wangcy on 2015/6/9.
 */

require(["./src/pull-refresh"], function(refresh) {
    var refreshMethod = refresh();

    refreshMethod.done(function() {
        document.body.firstElementChild.insertAdjacentText("beforebegin", "refresh  ");

        console.log(1);
    }).done(function() {
        console.log(2);
    });

    var btnOff = document.getElementById("btnOff"),
        listNode = document.getElementById("list"),
        listStyle = listNode.style;

    btnOff.addEventListener("click", function() {
        refreshMethod.off();
    }, false);

    function toHex(num) {
        var string = num.toString(16);

        if(string.length < 2) {
            string = string + string;
        }

        return string;
    }
});
