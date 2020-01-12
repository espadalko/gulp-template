const // modules
	fs = require('fs'),
	gif = require('gulp-if'),
	del = require('del'),
	ncp = require('ncp').ncp,
	mem = new (require("gulp-mem")),
	gulp = require('gulp'),
	exec = require('child_process').exec,
	less = require('gulp-less'),
	gcmq = require('gulp-group-css-media-queries'),
	sync = require('browser-sync').create(),
	touch = require('touch'),
	rigger = require('gulp-rigger'),
	include = require('gulp-include'),
	cleancss = require('gulp-clean-css'),
	resolve = require('path').resolve,
	replace = require('gulp-replace'),
	webpack = require('webpack-stream'),
	autoprefixer = require('gulp-autoprefixer')

const config = {
	src: './src/',
	build: './build/',
	appNameCurent: 'default',
	appNameDefault: 'default',
	keys: getKeys()
}

function key(keyName, cb, keys = config.keys){
	if( keyName in keys ) {
		if( /[a-z0-9]+/.test(keys[keyName]) ) {
			cb(keys[keyName])
		}else{
			cb()
		}
	}
}
function isKey(keyName){
	return keyName in config.keys
}
function addApp(appName){
	if(appName){
		config.appNameCurent = appName
		let isNewApp = !fs.existsSync(config.src + appName)
		if(isNewApp){
			let source = config.src + config.appNameDefault
			let dest = config.src + appName
			ncp(source, dest, function (err) {
				if (err) {return console.error(err); }
			})
		}else{
			console.log('WARN: An application with the same name already exists.')
		}
	}
}
function getKeys(){
	let keys = {}
	let argv = process.argv.slice(2)
	argv.unshift('--task')
	// -a slider => -a=slider
	argv = combiningArrayElements(argv, elem => {
		return elem.substr(0,1) != '-'
	})
	// -a=slider => -a: slider
	for(arg of argv){
		keyVal = arg.split('=')
		keys[keyVal[0]] = keyVal[1] || ''  
	}
	function combiningArrayElements(array, cb){
		let newArray =[]
		for(let i=0; i<array.length; i++){
			let cbRes = cb(array[i])
			if(cbRes && i > 0){
				let indexPrev = newArray.length - 1
				newArray[indexPrev] = newArray[indexPrev] + '=' + array[i]
			}else{
				newArray.push(array[i])
			}
		}
		return newArray 
	}
	return keys
}
function openFolder(){
	let path = resolve(config.build)
	let command = (path.indexOf('\\') > -1) ? 'start' : 'open'
	exec(command + ' "" ' + path)
}
function dest(data){

}


function clean(done){
	del(config.build + '**')
	done()
}
function templates(done){
	gulp.src(config.src + 'index.html')
		.pipe( replace('var_app_name', config.appNameCurent) )
		.pipe( rigger() )
		.pipe( gif(!isKey('-m'), gulp.dest(config.build)) )
		.pipe( gif( isKey('-m'), mem.dest(config.build)) )
		.pipe( gif( isKey('-s'), sync.stream()) )

		// .pipe(gif(flags.mem, mem.dest(config.build)))
		// .pipe(gif(!app.isSync, modules.gulp.dest(app.build)))
	done()
}
function styles(done){
	gulp.src(config.src + config.appNameCurent + '/style.less')
		.pipe(less())
		.pipe(gcmq())
		.pipe(autoprefixer())
		.pipe( gif(!isKey('-m'), gulp.dest(config.build)) )
		.pipe( gif( isKey('-m'), mem.dest(config.build)) )
		.pipe( gif( isKey('-s'), sync.stream()) )
		// .pipe(gif(flags.min, cleancss({level:2})))
		// .pipe(gif(!flags.mem, gulp.dest(config.build)))
		// .pipe(gif(flags.mem, mem.dest(config.build)))
		// .pipe(gif(flags.sync, sync.stream()))
		// .pipe(gif(app.isSync, gmem.dest(app.build)))
		// .pipe(gif(!app.isSync, gulp.dest(app.build)))
		// .pipe(gif(app.isSync, bsync.stream()))
	done()
}
function scripts(done){
	if(!fs.existsSync(config.build + '/tmp')){
		fs.mkdirSync(config.build + '/tmp')
		touch(config.build + '/tmp/script.js')
	}
	gulp.src(config.src + config.appNameCurent + '/script.js')
		.pipe(include())
			.on('error', console.log)
		.pipe( gif(!config.keys['-s'], gulp.dest(config.build + '/tmp') ))
		.pipe( gif(!isKey('-m'), gulp.dest(config.build + '/tmp')) )
		.pipe( gif( isKey('-m'), mem.dest(config.build + '/tmp')) )
		.pipe( gif( isKey('-s'), sync.stream()) )
		
	done()
}
function scriptsWebpack(done){
			gulp.src(config.build + 'tmp/script.js')
				.pipe(webpack({
					output: { filename: 'script.js' },
					optimization: { minimize: false },
					mode: true ? 'development' : 'production',
					devtool: true ? 'eval-source-map' : 'none'	
				}))
				.pipe( gif(!isKey('-m'), gulp.dest(config.build)) )
				.pipe( gif( isKey('-m'), mem.dest(config.build)) )
				.pipe( gif( isKey('-s'), sync.stream()) )

		// del(config.build + 'tmp')
		// .pipe(modules.if(!flags.mem, modules.dest(dirs.build)))
		// .pipe(modules.if(flags.mem, modules.mem.dest(dirs.build)))
		// .pipe(modules.if(flags.sync, modules.sync.stream()))
	done()	
}
function images(done){
	gulp.src(config.src + config.appNameCurent + '/img/**/*')
		.pipe( gif(!isKey('-m'), gulp.dest(config.build + '/img/')) )
		.pipe( gif( isKey('-m'), mem.dest(config.build + '/img/')) )
		.pipe( gif( isKey('-s'), sync.stream()) )
	done()
}
function watch(){
	console.log('watch')
	if(isKey('-s')){
		console.log('sync')
		sync.init({
			server: {
				baseDir: config.build,
				middleware: isKey('-m') ? mem.middleware : undefined,
			}
		});
		gulp.watch(config.src + config.appNameCurent + '/*.less', styles);
		gulp.watch([config.src + 'index.html', config.src + config.appNameCurent + '/*.html'], templates);
		gulp.watch(config.src + config.appNameCurent + '/*.js', scripts);
	}

	
	// modules.watch('./smartgrid.js', grid);
}
function test(done){
	console.log('test')
	done()
}
















//
// process
//

gulp.task('dev', gulp.series(clean, templates, styles, scripts, scriptsWebpack, images, watch) )

// gulp.task('default', gulp.series(clean, templates))

key('-a', addApp)
key('-o', openFolder)
key('-m', function(){mem.serveBasePath = config.build })
