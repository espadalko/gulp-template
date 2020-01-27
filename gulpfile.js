const 
	{src, dest, watch, series, parallel} = require('gulp'),
	autoprefixer = require('gulp-autoprefixer'),
	cleancss = require('gulp-clean-css'),
	include = require('gulp-include'),
	replace = require('gulp-replace'),
	webpack = require('webpack-stream'),
	{exec} = require('child_process'),
	{ncp} = require('ncp').ncp,
	less = require('gulp-less'),
	gcmq = require('gulp-group-css-media-queries'),
	path = require('path'),
	sync = require('browser-sync').create(),
	gif = require('gulp-if'),
	del = require('del')

const config = {
	src: './src',
	build: './build/',
	style: 'style.less',
	script: 'script.js',
	bundle: 'bundle.js',
	template: 'template.html',

	appNameCurent: 'hw1',
	appNameDefault: 'default',
	mode: 0,
	// keys: getKeys()
}

const argv = process.argv.slice(2)
const isProd = argv.indexOf('--prod') > -1 ? true : false 
const isDev = !isProd
const isOpen = argv.indexOf('--open') > -1 ? true : false
const isSync = !isOpen


// function key(keyName, cb, keys = config.keys){
// 	if( keyName in keys ) {
// 		if( /[a-z0-9]+/.test(keys[keyName]) ) {
// 			cb(keys[keyName])
// 		}else{
// 			cb()
// 		}
// 	}
// }

// function isKey(keyName){

// 	return keyName in config.keys
// }



// function getKeys(){
// 	let keys = {}
// 	let argv = process.argv.slice(2)
// 	argv.unshift('--task')
// 	// -a slider => -a=slider
// 	argv = combiningArrayElements(argv, elem => {
// 		return elem.substr(0,1) != '-'
// 	})
// 	// -a=slider => -a: slider
// 	for(arg of argv){
// 		keyVal = arg.split('=')
// 		keys[keyVal[0]] = keyVal[1] || ''  
// 	}
// 	function combiningArrayElements(array, cb){
// 		let newArray =[]
// 		for(let i=0; i<array.length; i++){
// 			let cbRes = cb(array[i])
// 			if(cbRes && i > 0){
// 				let indexPrev = newArray.length - 1
// 				newArray[indexPrev] = newArray[indexPrev] + '=' + array[i]
// 			}else{
// 				newArray.push(array[i])
// 			}
// 		}
// 		return newArray 
// 	}
// 	return keys
// }



// key('-a', addApp)
// key('-o', openFolder)



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
			optimization: { minimize: isProd },
			mode: isDev ? 'development' : 'production',
			devtool: isDev ? 'eval-source-map' : 'none'	
		}))
		.pipe( dest(pathBuild()) )
		.pipe( sync.stream() )

}

function taskScripts3(){
	return del( pathBuild(config.script) )
}

function taskScripts4(){
	return src( pathApp(config.script) )
		.pipe(webpack({
			output: { filename: config.bundle },
			optimization: { minimize: isProd },
			mode: isDev ? 'development' : 'production',
			devtool: isDev ? 'eval-source-map' : 'none'	
		}))
		.pipe( dest(pathBuild()) )
		.pipe( sync.stream() )
}
function taskPublic(){
	return src( pathApp('public/**') )
		.pipe( dest( pathBuild() ) )
}

function taskTemplates(){
	return src( pathApp('index.html') )
		.pipe( replace('var_app_name', config.appNameCurent) )
		.pipe( include() )
		 	.on('error', console.log)
		.pipe( dest( pathBuild() ))
		.pipe( sync.stream() )
}

function taskStyles(){
	return src( pathApp(config.style) )
		.pipe( less() )
		.pipe( gcmq() )
		.pipe( autoprefixer() )
		.pipe(gif(isProd, cleancss({level:2})))
		.pipe( dest( pathBuild() ))
		.pipe( sync.stream() )
}

function taskImages(){
	return src( pathApp('img/**/*') )
		.pipe( dest( pathBuild('img') ) )
}

function taskWatch(){
	let mode = [
		series(taskScripts1, taskScripts2, taskScripts3),
		series(taskScripts4),
	]
	watch( pathApp('*.html'), taskTemplates);
	watch( pathApp('*.less'), taskStyles)
	watch( pathApp('*.js'), mode[config.mode] );
}

function taskSync(){
	return sync.init({
		server: {
			baseDir: config.build,
		}
	});
}

function taskTest(done){
	done()
}


exports.mode = []

exports.mode[0] = series(
	taskClean, 
	parallel(
		taskTemplates,
		taskImages,
		taskStyles,
		taskPublic,
		series(
			taskScripts1, 
			taskScripts2, 
			taskScripts3
		),
	),
	(function(){
		if(isOpen){
			return openBuild
		}else{
			return parallel(taskSync, taskWatch)
		}
	})()
	// gif(isProd, openBuild),
	// // openBuild,
	// gif(isDev, 	parallel( taskSync, taskWatch ) )
)
exports.mode[1] = series(
	taskClean, 
	parallel(
		taskTemplates,
		taskImages,
		taskStyles,
		taskScripts4, 
		taskPublic
	),
	parallel(
		taskSync,
		taskWatch
	)
)

exports.test = series(taskTest)
exports.default = exports.mode[config.mode]

