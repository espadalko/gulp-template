const // modules
	{src, dest, watch, series, parallel} = require('gulp'),
	fs = require('fs'),
	gif = require('gulp-if'),
	del = require('del'),
	ncp = require('ncp').ncp,
	mem = new (require("gulp-mem")),
	exec = require('child_process').exec,
	less = require('gulp-less'),
	gcmq = require('gulp-group-css-media-queries'),
	path = require('path'),
	sync = require('browser-sync').create(),
	touch = require('touch'),
	include = require('gulp-include'),
	cleancss = require('gulp-clean-css'),
	replace = require('gulp-replace'),
	webpack = require('webpack-stream'),
	autoprefixer = require('gulp-autoprefixer')

const config = {
	src: './src',
	build: './build/',
	style: 'style.less',
	script: 'script.js',
	bundle: 'bundle.js',
	template: 'template.html',
	appNameCurent: 'slider',
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



// key('-a', addApp)
// key('-o', openFolder)
// key('-m', function(){mem.serveBasePath = config.build })



function pathApp(fileName = ''){

	return config.src + '/' + config.appNameCurent + '/' + fileName
}

function pathBuild(fileName = ''){

	return config.build + '/' + fileName
}

function pathSrc(fileName = ''){

	return config.src + '/' + fileName
}

function openBuild(){
	let pathBuild = path.resolve(config.build)
	let command = (pathBuild.indexOf('\\') > -1) ? 'start' : 'open'
	return exec(command + ' "" ' + pathBuild)
}

function taskClean(){

	return del(config.build + '**')
}

function taskScripts1(){
	return src( pathApp(config.script) )
				.pipe( include() )
				.pipe( dest( pathBuild() ))
}

function taskScripts2(){
	return src( pathBuild(config.script) )
		.pipe(webpack({
			output: { filename: config.bundle },
			optimization: { minimize: false },
			mode: true ? 'development' : 'production',
			devtool: true ? 'eval-source-map' : 'none'	
		}))
		.pipe( dest(pathBuild()) )
}

function taskScripts3(){

	return del( pathBuild(config.script) )
}

function taskTemplates(){
	return src( pathSrc('index.html') )
		.pipe( replace('var_app_name', config.appNameCurent) )
		.pipe( include() )
		.pipe( dest( pathBuild() ))
}

function taskStyles(){
	return src( pathApp(config.style) )
		.pipe( less() )
		.pipe( gcmq() )
		.pipe( autoprefixer() )
		.pipe( dest( pathBuild() ))
}

function taskImages(){
	return src( pathApp('img/**/*') )
		.pipe( dest( pathBuild('img') ) )
}

function taskWatch(){
	// watch( './src/slider/*.less', taskStyles)
	watch( pathApp('*.less'), taskStyles)
	// watch( [pathSrc('index.html'), pathApp('*.html') ], taskTemplates);
	// watch( pathApp('*.less'), taskStyles );
	// watch( pathApp('*.js'), 
	// 	series(taskScripts1, taskScripts2, taskScripts3) 
	// );
}

function taskTest(done){
	done()
}

function taskSync(){
	sync.init({
		server: {
			baseDir: config.build,
			// middleware: isKey('-m') ? mem.middleware : undefined,
		}
	});
}



exports.default = series(
	taskClean, 
	parallel(
		taskTemplates,
		taskImages,
		taskStyles,
		series(
			taskScripts1, 
			taskScripts2, 
			taskScripts3, 
		),
	),
	openBuild,
	taskSync,
	taskWatch
)

exports.test = taskTest