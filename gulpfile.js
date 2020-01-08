
const modules = {
    fs: require('fs'),
    gulp: require('gulp')
	// if: 		require('gulp-if'),
	// del: 		require('del'),
	// ncp: 		require('ncp').ncp,
	// sync: 		require('browser-sync').create(),
	// rigger: 	require('gulp-rigger'),
	// replace: 	require('gulp-replace'),
	// webpack: 	require('webpack-stream'),
	// css: {
	// 	less: 	require('gulp-less'),
	// 	gcmq: 	require('gulp-group-css-media-queries')
	// 	clean: 	require('gulp-clean-css'),
	// },
	// mem: new (require("gulp-mem")),
}



let appNameDefaults = 'defaults/'
let appName = appNameDefaults


const   dirs = {}
        dirs.src = 	'./src/'
        dirs.build = './build/'


const flags = {
	dev: true,
	sync: true
}

const argso = {
    app(valAppName){
        appName = valAppName || appName
    }
}

const tasks = {
    common(done){
        if(flags.app){
            let isNewApp = !modules.fs.existsSync(dirs.src + appName)
            if(isNewApp){
                modules.gulp.src(dirs.src + appNameDefaults + '**')
                        .pipe(modules.gulp.dest(dirs.src + appName))
            }else{
                console.log('noNewApp')
            }

        }
        done()
    },
	default(done){
		done()
	},
    test(done){
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
                    console.log(flags)
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

util.processArguments(argso)

for(key in tasks){
    exports[key] = modules.gulp.series(tasks.common, tasks[key])
}



