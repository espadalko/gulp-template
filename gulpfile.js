const mod = {
	gulp: require('gulp'),
	del: require('del'),
	sync: require('browser-sync').create(),
	// Mem: require('gulp-mem'),
	mem: new (function(){require('gulp-mem')})(),
	cp: require('ncp').ncp,
	if: require('gulp-if'),
	//templates
	rigger: require('gulp-rigger'),
	replace: require('gulp-replace'),
	//css
	less: require('gulp-less'),
	gcmq: require('gulp-group-css-media-queries'),
	cleanCSS: require('gulp-clean-css'),
}

const app = {
	name: 'defaults',
	build: './build',
	src: './src',
	isDev: false,
}

app.dir = app.src + '/' + app.name
mod.mem.serveBasePath = app.build 






const templates = function() {
	return mod.gulp.src(app.src + '/index.html')
		.pipe(mod.replace('var_app_name', app.name))
		.pipe(mod.rigger())
		.pipe(mod.if(app.isDev, mod.mem.dest(app.build)))
		.pipe(mod.if(!app.isDev, mod.gulp.dest(app.build)))
		.pipe(mod.sync.stream())
}

const styles = function() {
	return mod.gulp.src(app.dir + '/style.less')
		.pipe(mod.less())
	   	.pipe(mod.gcmq())
	   	.pipe(mod.if(!app.isDev, mod.cleanCSS({level:2})))
		.pipe(mod.if(app.isDev, mod.mem.dest(app.build)))
		.pipe(mod.if(!app.isDev, mod.gulp.dest(app.build)))
		.pipe(mod.sync.stream())
}

const scripts = function() {
	return mod.gulp.src(app.dir + '/script.js')
		.pipe(mod.if(app.isDev, mod.mem.dest(app.build)))
		.pipe(mod.if(!app.isDev, mod.gulp.dest(app.build)))
		.pipe(mod.sync.stream())
}

const clear = function(cb) {
	return mod.del(app.build + '/*')
}

const dev = function(cb) {
	app.isDev = true
	cb()
}

const build = mod.gulp.parallel(templates, styles, scripts)

const watch = function(cb) {
 	mod.sync.init({
		server: app.build,
		middleware: mod.mem.middleware,
	});
	mod.gulp.watch(app.dir + '/*.html', templates)
	mod.gulp.watch(app.dir + '/*.less', styles)
	mod.gulp.watch(app.dir + '/*.js', scripts)
	cb()
}

const add = function(cb){
	if(app.name != 'defaults'){
		mod.cp(app.src + '/defaults', app.dir,
			mod.gulp.series(build, watch)
		)
	}
	cb()
}


mod.gulp.task('dev', mod.gulp.series(dev, build, watch))
mod.gulp.task('build', mod.gulp.series(clear, build))
mod.gulp.task('clear', clear)
mod.gulp.task('add', add)
mod.gulp.task('test', function(cb){console.log('ok'); cb()})
