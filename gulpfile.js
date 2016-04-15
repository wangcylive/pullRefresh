/**
 * Created by wangcy on 2016/1/9.
 */
var gulp = require("gulp");
var uglify = require("gulp-uglify");
var cssnano = require("gulp-cssnano");
var rename = require("gulp-rename");


gulp.task("default", function() {
    gulp.src("./v2/src/pull-refresh.js")
        .pipe(uglify())
        .pipe(rename(function(path) {
            path.basename += ".min"
        }))
        .pipe(gulp.dest("./v2/src"));

    gulp.src("./v1/src/pull-refresh.js")
        .pipe(uglify())
        .pipe(rename(function(path) {
            path.basename += ".min"
        }))
        .pipe(gulp.dest("./v1/src"));
});