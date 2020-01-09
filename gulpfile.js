
const modules = {
		fs: require('fs'),
		if: require('gulp-if'),
		del: require('del'),
		mem: new (require("gulp-mem")),
		src: require('gulp').src,
		dest: require('gulp').dest,
		exec: require('child_process').exec,
		less: require('gulp-less'),
		gcmq: require('gulp-group-css-media-queries'),
		sync:	require('browser-sync').create(),
		watch: require('gulp').watch,
		series: require('gulp').series,
		rigger: require('gulp-rigger'),
		parallel: require('gulp').parallel,
		cleancss: require('gulp-clean-css'),
		resolve: require('path').resolve,
		replace: require('gulp-replace'),
		webpack:	require('webpack-stream'),
		autoprefixer: require('gulp-autoprefixer')
}



let appNameDefaults = 'defaults'
let appName = 'defaults'


const dirs = {}
		dirs.src = 	'./src/'
		dirs.build = './build/'
		dirs.app = dirs.src + appName + '/'


const flags = {
	dev: true,
}

const args = {
	app(valAppName){
		appName = valAppName || appName
	},
	open(){
		// откруть папку build
		
	},
	mem()	{ /* оперативная память */	
		modules.mem.serveBasePath = dirs.build
	},
	min()	{ /* оптимизация */ },
	sync(){ /* синхронизация с браузером*/ },
	map()	{ /* sourcemap */ },
	dev()	{ flags.prod = false },
	prod(){ flags.dev = false }
}



const tasks = {
	initial(done){
		console.log('APP: ', [appName.slice(0,-1)])
		console.log('ARG: ', process.argv.slice(2))
		if(flags.app){
			let isNewApp = !modules.fs.existsSync(dirs.src + appName)
			if(isNewApp){
				modules.src(dirs.src + appNameDefaults + '/**')
						.pipe(modules.dest(dirs.src + appName))
			}
		}
		modules.del(dirs.build + '**')
		done()
	},
	default(done){
		done()
		return this
	},
	templates(done){
		modules.src(dirs.src + 'index.html')
			.pipe(modules.replace('var_app_name', appName))
			.pipe(modules.rigger())
			.pipe(modules.if(!flags.mem, modules.dest(dirs.build)))
			.pipe(modules.if(flags.mem, modules.mem.dest(dirs.build)))
			.pipe(modules.if(flags.sync, modules.sync.stream()))
		// .pipe(gif(!app.isSync, modules.gulp.dest(app.build)))
		done()
	},
	styles(done){
		modules.src(dirs.app + '/style.less')
			.pipe(modules.less())
			.pipe(modules.gcmq())
			.pipe(modules.autoprefixer())
			.pipe(modules.if(flags.min, modules.cleancss({level:2})))
			.pipe(modules.if(!flags.mem, modules.dest(dirs.build)))
			.pipe(modules.if(flags.mem, modules.mem.dest(dirs.build)))
			.pipe(modules.if(flags.sync, modules.sync.stream()))
		  // .pipe(gif(app.isSync, gmem.dest(app.build)))
		  // .pipe(gif(!app.isSync, gulp.dest(app.build)))
		  // .pipe(gif(app.isSync, bsync.stream()))
		done()
	},
	scripts(done){
		modules.src(dirs.app + '/script.js')
			.pipe(modules.webpack({
				output: { filename: 'script.js' },
				optimization: { minimize: flags.min },
				mode: flags.dev ? 'development' : 'production',
				devtool: flags.map ? 'eval-source-map' : 'none'	
			}))
			.pipe(modules.if(!flags.mem, modules.dest(dirs.build)))
			.pipe(modules.if(flags.mem, modules.mem.dest(dirs.build)))
			.pipe(modules.if(flags.sync, modules.sync.stream()))
		  // .pipe(gif(app.isSync, gmem.dest(app.build)))
		  // .pipe(gif(!app.isSync, gulp.dest(app.build)))
		  // .pipe(gif(app.isSync, bsync.stream()))
		  done()
	},
	images(done){
		modules.src(dirs.app + '/img/**/*')
			.pipe(modules.if(!flags.mem, modules.dest(dirs.build + 'img/')))
			.pipe(modules.if(flags.mem, modules.mem.dest(dirs.build + 'img/')))
			.pipe(modules.if(flags.sync, modules.sync.stream()))
		done()
	},
	watch(){
		if(flags.sync){
			modules.sync.init({
				server: {
					baseDir: dirs.build,
					middleware: flags.mem ? modules.mem.middleware : undefined,
				}
			});
		}

		modules.watch(dirs.app + '*.less', tasks.styles);
		modules.watch([dirs.src + 'index.html', dirs.app + '*.html'], tasks.templates);
		modules.watch(dirs.app + '*.js', tasks.scripts);
		// modules.watch('./smartgrid.js', grid);
	},
	test(done){
		done()
	},
	final(done){
		if(flags.open && !flags.sync){
			let path = modules.resolve(dirs.build)
			let command = path.indexOf('\\') ? 'start' : 'open'
			modules.exec(command + ' "" ' + path)
		}
		if(flags.sync){
			tasks.watch()
		}
		done()
	}
}

tasks.default.description = "Default task"


const util = {
	processArguments(opt){
		let argv = process.argv.slice(2)
		let index = argv.findIndex((arg)=>{
			return isFlagName(arg) 
		})
		if(index > -1){
			let flagArgs = argv.slice(index)
			for(let i=0; i < flagArgs.length; i++){
				let flagName = flagArgs[i].replace(/[-]+/g,'')
				if(opt[flagName]){
					flags[flagName] = true
					let nextFlag = flagArgs[i+1]
					let isFlagVal = nextFlag ? !isFlagName(nextFlag) : false
					opt[flagName](isFlagVal ? nextFlag : undefined)
				}
			}
		}
		function isFlagName(key){
			return key.substr(0, 1) === '-'
		}
	},
	addApp(valAppName){

	}
}

util.processArguments(args)

// for(key in tasks){
// 	exports[key] = modules.series(tasks.common, tasks[key], tasks.final)
// }

exports.default = modules.series(tasks.initial, 
	modules.parallel(tasks.templates, tasks.styles, tasks.scripts, tasks.images), 
		tasks.final) 

exports.test = tasks.images

// modules.serries(tasks.initial, 
// 	modules.parallel(tasks.templates, tasks.styles, tasks.scripts), 
// 		tasks.final)


