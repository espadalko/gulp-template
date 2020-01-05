const { task, src, dest, series, parallel, watch } = require('gulp')
const del = require('del')
const browserSync = require('browser-sync').create()
const GulpMem = require('gulp-mem')
const gulpMem = new GulpMem()
const ncp = require('ncp').ncp;
const gif = require('gulp-if');

//templates
const rigger = require('gulp-rigger')
const replace = require('gulp-replace')

//css
const less = require('gulp-less')



const APP_NAME = 'defaults'
const APP_BUILD = './build'
const APP_SRC = './src'
const APP_DIR = APP_SRC + '/' + APP_NAME

let isDev = false



gulpMem.serveBasePath = APP_BUILD 



const templates = function() {
	return src(APP_SRC + '/index.html')
		.pipe(replace('var_app_name', APP_NAME))
		.pipe(rigger())
		.pipe(gif(isDev, gulpMem.dest(APP_BUILD)))
		.pipe(gif(!isDev, dest(APP_BUILD)))
		.pipe(browserSync.stream())
}

const styles = function() {
	return src(APP_DIR + '/style.less')
		.pipe(less())
		.pipe(gif(isDev, gulpMem.dest(APP_BUILD)))
		.pipe(gif(!isDev, dest(APP_BUILD)))
		.pipe(browserSync.stream())
}

const scripts = function() {
	return src(APP_DIR + '/script.js')
		.pipe(gif(isDev, gulpMem.dest(APP_BUILD)))
		.pipe(gif(!isDev, dest(APP_BUILD)))
		.pipe(browserSync.stream())
}

const clear = function(cb) {
	return del(APP_BUILD + '/*')
}

const dev = function(cb) {
	isDev = true
	cb()
}

const build = parallel(templates, styles, scripts)

const sync = function(cb) {
 	browserSync.init({
		server: APP_BUILD,
		middleware: gulpMem.middleware,
	});
	watch(APP_DIR + '/*.html', templates)
	watch(APP_DIR + '/*.less', styles)
	watch(APP_DIR + '/*.js', scripts)
	cb()
}

const add = function(cb){
	if(APP_NAME != 'defaults'){
		ncp(APP_SRC + '/defaults', APP_DIR,
			series(build, sync)
		)
	}
	cb()
}


task('dev', series(dev, build, sync))
task('build', series(clear, build))
task('clear', clear)
task('add', add)
task('test', function(cb){console.log('test'); cb()})
