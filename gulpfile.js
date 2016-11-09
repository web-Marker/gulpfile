/*
* @Author: Mark
* @Date:   2015-09-29 16:42:16
* @Last Modified by:   mark
* @Last Modified time: 2016-11-09 15:00:28
*/

var gulp = require('gulp');
var $ = {
        size: require('gulp-size'),
        less: require('gulp-less'),
        concat: require('gulp-concat'),
        clean :  require('gulp-clean'),
        cssmin: require('gulp-minify-css'),
        notify: require('gulp-notify'),
        plumber: require('gulp-plumber'),
        imagemin: require('gulp-imagemin'),
        htmlmin: require('gulp-htmlmin'),
        uglify: require('gulp-uglify'),
        cache: require('gulp-cache'),
        pngquant: require('imagemin-pngquant'),
        rev: require('gulp-rev'),
        if: require('gulp-if'),
        collector: require('gulp-rev-collector'),
        del: require('del'),
        livereload: require('gulp-livereload'),
        sprite: require('gulp.spritesmith'),
        merge: require('merge-stream'),
        argv:  require('yargs').argv.f,
        babel:  require('gulp-babel'),
    };

    //config 配置
    var root = {
        src: 'src/',
        dest: 'dist/',
        rt: 'qd/'
    };

    var tasks = {
        Images: {
            src: 'images',
            dest: 'images',
            exclude: 'images/vectors',
            extensions: ['png','jpg','gif'],
            plugins: {
                imageMin: {
                    use:[$.pngquant()],
                    progressive: true
                }
            }
        },

        spriteImg: {
            src: 'images',
            dest: 'images',
            exclude: [
                'bimg.png',
                'bg1.png'
            ],
            outPut: {
                imgName: '../images/sprite.png',
                LessName: 'sprite.less',
                imgUrl: 'src/images/',
                LessUrl: 'src/css/'

            },
            padding: 10

        },

        Js: {
            src: 'js',
            dest: 'js',
            extensions: [
                'js'
            ],
            plugins: {
                Uglify: {
                    mangle:true,
                    compress:true
                },
                maniFest: {
                    base: 'src',
                    merge: true
                }
            }
        },

        excludeJs: {
            src: 'js',
            dest: 'js',
            name: [
                'hammer.min.js',
                'require.js'
            ]
        },

        Css: {
            src: 'css',
            dest: 'css',
            name: [
                'style.less'
            ],
            plugins: {
                maniFest: {
                    base: 'src',
                    merge: true
                }
            }
        },

        excludeCss: {
            src: 'css',
            dest: 'css',
            name: [
                'reset.css'
            ]
        },

        Html: {
            extensions: 'html',
            plugins: {
                htmlMin: {
                    minifyJS: true,
                    minifyCSS: true
                }
            }
        },

        concatStyle: {
            src: 'css',
            dest: 'css',
            name: [
                'reset.css',
                'style.css'
            ]
        },

        concatScript: {
            src: 'js',
            dest: 'js',
            exclude: 'js/vectors',
            name: [
                'reset.css',
                'style.css'
            ]
        }
    };

    //开发模式和生成模式 开发模式不需要压缩和增加版本号
    taskArr = [],
    taskRun = ['testHtml','testLess','testImagemin','testJs'];

    if( $.argv ){

        for (var i = 0; i < taskRun.length; i++) {

            taskArr[i] = taskRun.slice(i,i+1);
            taskArr[i].push('testRev');
        };

    } else {

        for (var i = 0; i < taskRun.length; i++) {

            taskArr[i] = taskRun.slice(i,i+1);
        };

    }

    /** Html 生成压缩页面JS+CSS
     * @return {[type]}
     */
    gulp.task('testHtml', function(){

        return gulp.src(root.src + '*.' + tasks.Html.extensions)
            .pipe($.plumber({errorHandler: $.notify.onError('Error: <%= error.message %>')}))
            .pipe($.if($.argv,$.htmlmin(tasks.Html.htmlMin)))
            .pipe($.size({
                showFiles: true
            }))
            .pipe(gulp.dest(root.dest))
            .pipe($.livereload())

    })

    /**LESS 生成
     * @return {[type]}
     */
    gulp.task('testLess', function(){

        return gulp.src(root.src + tasks.Css.src + '/' + tasks.Css.name)
            .pipe($.plumber({errorHandler: $.notify.onError('Error: <%= error.message %>')}))
            .pipe($.less())
            .pipe($.if($.argv,$.cssmin()))
            .pipe($.if($.argv,$.rev()))
            .pipe($.size({
                showFiles: true
            }))
            .pipe(gulp.dest(root.dest + tasks.Css.dest))
            .pipe($.if($.argv,$.rev.manifest(tasks.Css.plugins.maniFest)))
            .pipe($.if($.argv,gulp.dest(root.rt)))
            .pipe($.livereload())

    })

    /**
     * *合并压缩加上MD5时间戳
     * @param  {Array}  ){                     var name [description]
     * @return {[type]}     [description]
     */
    gulp.task('concatCss', function(){

        $.del(root.dest + tasks.concatStyle.src + '/style-*.min.css');

        return gulp.src(root.dest + tasks.concatStyle.src + '/*')
                .pipe($.concat('style.min.css'))
                .pipe($.cssmin())
                .pipe($.rev())
                .pipe(gulp.dest(root.dest + tasks.concatStyle.dest))
                .pipe($.rev.manifest(tasks.Css.plugins.maniFest))
                .pipe(gulp.dest(root.rt))
    })

    /**
     * *合并JS
     * @param  {[type]} ){ } [description]
     * @return {[type]}     [description]
     */
    gulp.task('concatJs', function(){

        $.del(root.dest + tasks.concatScript.src + '/build-*.min.js');

        return gulp.src(root.dest + tasks.concatScript.src + '/*')
                .pipe($.concat('build.min.js'))
                .pipe($.uglify(tasks.Js.plugins.Uglify))
                .pipe($.rev())
                .pipe(gulp.dest(root.dest + tasks.concatScript.dest))
                .pipe($.rev.manifest(tasks.Js.plugins.maniFest))
                .pipe(gulp.dest(root.rt))
    })

    /**
     * *替换HTML文件名(合并压缩)
     */
    gulp.task('concats', ['concatCss', 'concatJs', 'testRev']);

    /**移动不需要修改的CSS(类似reset.css,框架自带的样式)
     * @return {[type]}
    */
    gulp.task('moveCSS', function(){

        var NameArr = [],
            name = tasks.excludeCss.name;

        for (var i = 0; i < name.length; i++){

            NameArr.push(root.src + tasks.excludeCss.src + '/' + name[i])

        }

        return gulp.src(NameArr)
            .pipe(gulp.dest(root.dest + tasks.excludeCss.dest))
    })

    /**移动不需要修改的JS(类似JS,react框架等min.js)
     * @return {[type]}
    */
    gulp.task('moveJS', function(){

        var NameArr = [],
            name = tasks.excludeJs.name;

        for (var i = 0; i < name.length; i++){

            NameArr.push(root.src + tasks.excludeJs.src + '/' + name[i])

        }

        return gulp.src(NameArr)
            .pipe(gulp.dest(root.dest + tasks.excludeJs.dest))
    })

    /**
     * *图片压缩，一般开发过程中使用https://tinypng.com/比较多
     * @return {[type]} [description]
     */
    gulp.task('testImagemin', function(){

        return gulp.src(root.src + tasks.Images.src + '/*')
            .pipe($.if($.argv,$.cache($.imagemin(tasks.Images.plugins.imageMin))))
            .pipe($.size({
                showFiles: true
            }))
            .pipe(gulp.dest(root.dest + tasks.Images.dest))
            .pipe($.livereload())

    })

    /**
     * *JS压缩实现
     * @return {[type]} [description]
     */
    gulp.task('testJs', function(){

        var name = [];

        for (var i = 0; i < tasks.excludeJs.name.length; i++){

            name.push('!' + root.src + tasks.Js.src + '/' + tasks.excludeJs.name[i])

        }

        return gulp.src([
                root.src + tasks.Js.src + '/*.js'
            ].concat(name))
            .pipe($.if($.argv,$.uglify(tasks.Js.plugins.Uglify)))
            .pipe($.if($.argv,$.rev()))
            .pipe($.size({
                showFiles: true
            }))
            .pipe(gulp.dest(root.dest + tasks.Js.dest))
            .pipe($.if($.argv,$.rev.manifest(tasks.Js.plugins.maniFest)))
            .pipe($.if($.argv,gulp.dest(root.rt)))
            .pipe($.livereload())

    })

    /**
     * *清理生产目录
     * @param  {[type]} 
     * @return {[type]}     [description]
     */
    gulp.task('clean',function(){

        gulp.src([root.dest + '*','rev-manifest.json'])
        .pipe($.clean());

    })

    /**
     * *默认任务
     * @param  {[type]} ) 
     * @return {[type]}     [description]
     */
    gulp.task('default',['clean'],function(){

        gulp.start('testLess','testHtml','testImagemin','testJs');
    })

    /**
     * *替换版本号
     * @param  {[type]} 
     * @return {[type]}     [description]
     */
    gulp.task('testRev',function(){

        gulp.src(['rev-manifest.json','src/*.html'])
        .pipe($.collector())
        .pipe(gulp.dest(root.dest))
    })

    //生产文件
    gulp.task('testWatch',function(){

        $.livereload.listen();
        gulp.watch(root.src + tasks.Css.src + '/' + tasks.Css.name,taskArr[1].concat(['moveCSS']));
        gulp.watch(root.src + tasks.Images.src + '/*.{jpg,png,gif,ico}',taskArr[2]);
        gulp.watch(root.src + tasks.Js.src + '/*.js',taskArr[3].concat(['moveJS']));
        gulp.watch(root.src + '*.' + tasks.Html.extensions,taskArr[0]);
        gulp.watch(root.src + tasks.Js.src + '/*.es6', ['ES6']);

    });


    /**
     * 
     * *压缩合并精灵图
     * @param  {Array}  ) {
     * @return {[type]}   [description]
     */
    gulp.task('sprite', function () {

        var name = [];

        for (var i = 0; i < tasks.spriteImg.exclude.length; i++){

            name.push('!' + root.src + tasks.spriteImg.src + '/' + tasks.spriteImg.exclude[i])
        }

        var spriteData = gulp.src([root.src + tasks.spriteImg.src + '/*'].concat(name))
        .pipe($.sprite({
            imgName: tasks.spriteImg.outPut.imgName,
            cssName: tasks.spriteImg.outPut.LessName,
            cssFormat: 'less',
            padding: tasks.spriteImg.padding
        }));

        var imgStream = spriteData.img
        .pipe(gulp.dest(tasks.spriteImg.outPut.imgUrl));

        var cssStream = spriteData.css
        .pipe(gulp.dest(tasks.spriteImg.outPut.LessUrl));

        // Return a merged stream to handle both `end` events
        return $.merge(imgStream, cssStream);
    });

    /**删除合并的图片 [description]
     * @return {[type]}     [description]
     */
    gulp.task('delSprite', function(){

        $.del([root.src + tasks.spriteImg.src +'/' +tasks.spriteImg.outPut.imgName,tasks.spriteImg.outPut.LessUrl + tasks.spriteImg.outPut.LessName]);

    })

  





