const { task, src, dest, series, parallel, watch } = require('gulp')
const del = require('del')
const browserSync = require('browser-sync').create()
const gulpMem = new require('gulp-mem')
const ncp = require('ncp').ncp;

//templates
const rigger = require('gulp-rigger')
const replace = require('gulp-replace')

//css
const less = require('gulp-less')

//js


const
APP_NAME = 'defaults',
APP_BUILD = './build',
APP_SRC = './src',
APP_DIR = APP_SRC + '/' + APP_NAME



const templates = function() {
	return src(APP_SRC + '/index.html')
		.pipe(replace('var_app_name', APP_NAME))
		.pipe(rigger())
		.pipe(dest(APP_BUILD))
		.pipe(browserSync.stream())
}

const styles = function() {
	return src(APP_DIR + '/style.less')
		.pipe(less())
		.pipe(dest(APP_BUILD))
		.pipe(browserSync.stream())
}

const scripts = function() {
	return src(APP_DIR + '/script.js')
		.pipe(dest(APP_BUILD))
		.pipe(browserSync.stream())
}

const clear = function() {
	return del(APP_BUILD + '/*')
}

const build = series(clear, parallel(templates, styles, scripts) )

const sync = function(cb) {
 	browserSync.init({
		server: APP_BUILD,
		middleware: gulpMem.middleware,
	});
	watch(APP_DIR + '/template.html', templates)
	watch(APP_DIR + '/style.less', styles)
	watch(APP_DIR + '/script.js', scripts)
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


task('dev', series(build, sync))
task('build', series(build))
task('add', add)
task('test', function(cb){console.log('test'); cb()})
