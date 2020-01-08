
const modules = {
    fs: require('fs')
	// if: 		require('gulp-if'),
	// del: 		require('del'),
	// ncp: 		require('ncp').ncp,
	// gulp: 		require('gulp'),
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

const dirs = {
    defaults: 'defaults',
	app: 	'defaults',
	src: 	'./src',
	build: 	'./build',
}

const flags = {
	dev: true,
	sync: true
}

const argso = {
    app(val = dirs.defaults){
    }
}

const tasks = {
	default(done){
		// console.log('app', 'default')
        // if (modules.fs.existsSync('./src/less/')) {
        //     console.log('file', 'ok')
        // }else{
        //     console.log('file', 'no')
        // }
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
        let index = argv.findIndex((elem)=>{
            return isKey(elem) 
        })
        if(index > -1){
            argv = argv.slice(index)
            for(let i=0; i < argv.length; i++){
                let val = argv[i].replace(/[-]+/g,'')
                if(opt[val]){
                    let nextVal = argv[i+1]
                    let isVal = nextVal ? !isKey(nextVal) : false
                    opt[val](isVal ? nextVal : undefined)
                }
            }
        }
        function isKey(key){
            return key.substr(0, 1) === '-'
        }
    }
}

util.processArguments(argso)

for(key in tasks){
    exports[key] = tasks[key]
}



