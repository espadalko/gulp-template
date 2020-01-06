const gulp = require('gulp')
const cleanCss = require('gulp-clean-css')
const ncp = require('ncp').ncp
const del = require('del')
const gcmq = require('gulp-group-css-media-queries')
const gif = require('gulp-if')
const gless = require('gulp-less')
const gmem = new (require("gulp-mem"))
const greplace = require('gulp-replace')
const grigger = require('gulp-rigger')
const bsync = require('browser-sync').create()


const app = {
	name: 'defaults',
	build: './build',
	src: './src',
	isDev: false,
}

app.dir = app.src + '/' + app.name
gmem.serveBasePath = app.build 




const templates = function() {
	return gulp.src(app.src + '/index.html')
		.pipe(greplace('var_app_name', app.name))
		.pipe(grigger())
		.pipe(gif(app.isDev, gmem.dest(app.build)))
		.pipe(gif(!app.isDev, gulp.dest(app.build)))
		.pipe(bsync.stream())
}

const styles = function() {
	return gulp.src(app.dir + '/style.less')
		.pipe(gless())
	   	.pipe(gcmq())
	   	.pipe(gif(!app.isDev, cleanCss({level:2})))
		.pipe(gif(app.isDev, gmem.dest(app.build)))
		.pipe(gif(!app.isDev, gulp.dest(app.build)))
		.pipe(bsync.stream())
}

const scripts = function() {
	return gulp.src(app.dir + '/script.js')
		.pipe(gif(app.isDev, gmem.dest(app.build)))
		.pipe(gif(!app.isDev, gulp.dest(app.build)))
		.pipe(bsync.stream())
}

const clear = function(cb) {
	return gulp.del(app.build + '/*')
}

const dev = function(cb) {
	app.isDev = true
	cb()
}

const build = gulp.parallel(templates, styles, scripts)

const watch = function(cb) {
 	bsync.init({
		server: app.build,
		middleware: gmem.middleware,
	});
	gulp.watch(app.dir + '/*.html', templates)
	gulp.watch(app.dir + '/*.less', styles)
	gulp.watch(app.dir + '/*.js', scripts)
	cb()
}

const add = function(cb){
	if(app.name != 'defaults'){
		ncp(app.src + '/defaults', app.dir,
			gulp.series(build, watch)
		)
	}
	cb()
}


gulp.task('dev', gulp.series(dev, build, watch))
gulp.task('build', gulp.series(clear, build))
gulp.task('clear', clear)
gulp.task('add', add)
gulp.task('test', function(cb){console.log('test'); cb()})
