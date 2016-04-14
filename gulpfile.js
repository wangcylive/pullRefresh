/**
 * Created by wangcy on 2016/1/9.
 */
var gulp = require("gulp");

var uglify = require("gulp-uglify");
var cssnano = require("gulp-cssnano");


gulp.task("default", function() {
    gulp.src("./v2/src/pull-refresh.js")
        .pipe(uglify())
        .pipe(gulp.dest("./dist"))
});