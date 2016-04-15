# pullRefresh
pull refresh

## instruction

*supported promised style*
*supported AMD*

### v1 version
    var refresh = window.pullRefresh();

    refresh.done(function() {
        // done function
    });


### v2 version
    var refresh = window.pullRefresh();

    refresh.on(function() {
        // start function
    }).done(function() {
        // done function
    }).fail(function() {
        // fail function
    })

    // trigger fail
    refresh.reject();

    // trigger done
    refresh.resolve();