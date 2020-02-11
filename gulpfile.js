(() => {
'use-strict';
const

  // development or production
  devBuild = ((process.env.NODE_ENV || 'development').trim().toLowerCase() === 'development'),

  // directory locations
  dir = {
    src    : './',
    dev    : './',
    build  : './_site/',
    node   : './node_modules/'
  },

  // modules
  gulp              =  require('gulp'),
  autoprefixer      =  require('autoprefixer'),
  del               =  require('del'),
  noop              =  require('gulp-noop'),
  newer             =  require('gulp-newer'),
  size              =  require('gulp-size'),
  imagemin          =  require('gulp-imagemin'),
  sass              =  require('gulp-sass'),
  postcss           =  require('gulp-postcss'),
  cssnano           =  require('cssnano'),
  header            =  require('gulp-header'),
  pkg               =  require('./package.json'),
  clean             =  require('gulp-clean'),
  pngquant          =  require('imagemin-pngquant'),
  mozjpeg           =  require ('imagemin-mozjpeg'),
  scaleImages       =  require('gulp-scale-images'),
  flatMap           =  require('flat-map').default,
  path              =  require('path'),
  cp                =  require('child_process'),
  sourcemaps        =  devBuild ? require('gulp-sourcemaps') : null,

  // Set the banner content
  banner = ['/*!\n',
  ' * <%= pkg.name %> <%=(pkg.url) %> | v<%= pkg.version %>\n',
  ' * Copyright 2008-2020 | <%= pkg.name %>\n',
  ' * Licensed under <%= pkg.license %> | (<%= pkg.licenseUrl %>)\n',
  ' */\n',
  ''
  ].join('');

  console.log('Gulp', devBuild ? 'development' : 'production', 'build');

  /*
  ** clean task
  */
  gulp.task('clean', (done) => {
    del.sync([ dir.build ]);

    done();
  });

  const cssConfig = {

    dev         : dir.dev + 'styles/**/*.scss',
    watch       : dir.src + 'styles/**/*.scss',
    build       : dir.src + '_site/assets',

    sassOpts: {
      sourceMap       : devBuild,
      outputStyle     : 'compressed',
      precision       : 3,
      errLogToConsole : true,
      includePaths    : ['node_modules']
    }
  };

  if (!devBuild) {
    cssConfig.postCSS.push(
      require('usedcss')({ html: ['index.html'] }),
      require('cssnano')
    );
  }

  // Task to watch changes to source files and rebuild
  // function watchSass(cb) {
  //  gulp.watch('./styles/**/*.{scss,css}', buildSass);
  // }
  // Configure the browserSync task
  // gulp.task('browserSync', (done) => {
  //   browserSync.init({
  //     server: {
  //       baseDir: ''
  //     },
  //     ui: {
  //       port: 8001 // customize port for browserSync UI
  //     },
  //     port: 8080, // use 8080 to prevent conflicts with other localhosts
  //     reloadOnRestart: true,
  //     notify: false // prevent the browserSync notification from appearing
  //   });

  //   done();
  // });

  sass.compiler = require('node-sass');

  //
  // This function is only to be used by the deployment script,
  // used by the automated build processes
  //
  function buildSass(cb) {
    return gulp.src([
      '!./styles/rhdp.scss', // ignore the rhdp.scss file due to filepath errors in automated builds
      './styles/partials/*.scss', // include the partial files for main.scss
      './styles/main.scss' // include the customized site file
    ])
    .pipe(sass(cssConfig.sassOpts).on('error', sass.logError)) // sets the configuration options for building SCSS files
    .pipe(sourcemaps.init())
    .pipe(postcss([ autoprefixer(), cssnano() ]))
    .pipe(sourcemaps.write('.'))
    .pipe(size({ showFiles:true }))
    .pipe(gulp.dest(cssConfig.build));
  }

  // convert custom scss files to css using PostCSS
  // @ts-ignore
  function cssDev(cb){
    return gulp.src(cssConfig.dev) // sets director to return as './styles/**/*.scss'
    .pipe(sourcemaps.init())
    .pipe(sass(cssConfig.sassOpts).on('error', sass.logError)) // sets the configuration options for building SCSS files
    .pipe(postcss([ autoprefixer() ]))
    .pipe(sourcemaps.write('.'))
    .pipe(size({ showFiles:true }))
    .pipe(gulp.dest(cssConfig.build)); // dump compiled SCSS files to './_site/assets/'
  }

  function watchSass(cb) {
    gulp.watch(cssConfig.dev, cssDev);
  }

  // Image resizing using gulp-scale-images and
  // optimization using imagemin with non-default plugins

  var exec = require('child_process').exec;

  const retinaVersions = (file, cb) => {
    const normalVersion = file.clone();
    normalVersion.scale = { maxWidth: 576, maxHeight: 500, fit: 'inside' };
    const retinaVersion = file.clone();
    retinaVersion.scale = { maxWidth: 576*2, maxHeight: 500*2, suffix: '@2x', fit: 'inside' };

    cb(null, [normalVersion, retinaVersion]);
  };

  // By default, gulp-scale-images names files with dimensions
  const imageFileName = (output, scale, cb) => {
    const fileName = [
      path.basename(output.path, output.extname),
      scale.suffix || "",
      output.extname
    ].join('');

    cb(null, fileName);
  };

  // Minimize all of the images located under './assets/img/'
  // Only touches .jpg, .jpeg, .png, and .svg files
  function minimizeImages(cb) {
    return gulp.src('./assets/img/**/*.{jpg,jpeg,png,svg,ico}')
      .pipe(newer('./_site/assets/img/'))
      .pipe(flatMap(retinaVersions))
      .pipe(scaleImages(imageFileName))
      .pipe(imagemin([mozjpeg(), pngquant()]))
      .pipe(gulp.dest('./_site/assets/img/'));
  }

  // Copy font assets
  function copyFonts(cb) {
    gulp.src('./assets/themes/custom/rhdp2/fonts/patternfly/**/*.*')
    .pipe(gulp.dest('./_site/themes/custom/rhdp2/fonts/patternfly/'));
    cb();
  }

  // Copy Prism.js assets
  function copyPrism(cb) {
    gulp.src('./assets/prism/*.*')
    .pipe(gulp.dest('./_site/assets/prism/'));
    cb();
  }

  // Task to clean _site/ and other Jekyll caches
  function cleanJekyll(cb) {
    cp.exec('bundle exec jekyll clean', function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  }

  // Task to build Jekyll
  // Note that here Bundler is used to manage the Ruby gems
  // If you are not using Bundler, just call jekyll build
  function buildJekyll(cb) {
    cp.exec('bundle exec jekyll build', function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  }

  // Task to serve the website locally
  function serveJekyll(cb) {
    cp.exec('bundle exec jekyll serve --livereload', function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  }

  // ---- WIP ---- //
  // Install submodule dependencies
  // ---- WIP ---- //

  // gulp.task('buildSubmodule', function (cb) {
  //   exec('ping localhost', function(err, stdout, stderr) {
  //     console.log(stdout);
  //     console.log(stderr);
  //     cb(err);
  //   });
  // });
  exports.cssDev   =  cssDev;
  exports.sass     =  buildSass;
  exports.watch    =  watchSass;
  exports.jekyll   =  buildJekyll;
  exports.serve    =  serveJekyll;
  exports.clean    =  cleanJekyll;
  exports.prism    =  copyPrism;
  exports.imagemin =  minimizeImages;

  exports.build = gulp.series(
    cleanJekyll,
    gulp.parallel(copyFonts, copyPrism, minimizeImages),
    cssDev,
    buildJekyll
  );

  exports.development = gulp.series(
    gulp.parallel(copyFonts, copyPrism, minimizeImages),
    cssDev,
    gulp.parallel(watchSass, serveJekyll)
  );

  exports.deploy = gulp.series(
    copyFonts,
    copyPrism,
    minimizeImages,
    buildSass,
    buildJekyll
  );
})();
