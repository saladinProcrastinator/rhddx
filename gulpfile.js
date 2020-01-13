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
  header            =  require('gulp-header'),
  pkg               =  require('./package.json'),
  clean             =  require('gulp-clean'),
  sourcemaps        =  devBuild ? require('gulp-sourcemaps') : null,
  browserSync       =  devBuild ? require('browser-sync') : null,

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

    dev         : dir.dev + 'styles/**/**/*.scss',
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
  gulp.task('browserSync', (done) => {
    browserSync.init({
      server: {
        baseDir: ''
      },
      ui: {
        port: 8001 // customize port for browserSync UI
      },
      port: 8080, // use 8080 to prevent conflicts with other localhosts
      reloadOnRestart: true,
      notify: false // prevent the browserSync notification from appearing
    });

    done();
  });

  // convert custom scss files to css using PostCSS
  // @ts-ignore
  gulp.task('cssProd', (done) => {
    return gulp.src([
      '!./styles/rhdp.scss', // ignore the rhdp.scss file - only for automated builds
      './styles/**/*.scss' // sets director to return as './styles/**/*.scss'
    ])
    .pipe(sourcemaps ? sourcemaps.init() : noop())
    .pipe(sass(cssConfig.sassOpts).on('error', sass.logError)) // sets the configuration options for building SCSS files
    .pipe(postcss([ autoprefixer() ]))
    .pipe(sourcemaps ? sourcemaps.write() : noop())
    .pipe(size({ showFiles:true }))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest(cssConfig.build)) // dump compiled SCSS files to './_site/assets/'
    .pipe(browserSync ? browserSync.reload({ stream: true }) : noop());
  });

  // convert custom scss files to css using PostCSS
  // @ts-ignore
  gulp.task('cssDev', (done) => {
    return gulp.src(cssConfig.dev) // sets director to return as './styles/**/*.scss'
    .pipe(sourcemaps ? sourcemaps.init() : noop())
    .pipe(sass(cssConfig.sassOpts).on('error', sass.logError)) // sets the configuration options for building SCSS files
    .pipe(postcss([ autoprefixer() ]))
    .pipe(sourcemaps ? sourcemaps.write() : noop())
    .pipe(size({ showFiles:true }))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest(cssConfig.build)) // dump compiled SCSS files to './_site/assets/'
    .pipe(browserSync ? browserSync.reload({ stream: true }) : noop());
  });

  // @ts-ignore
  gulp.task('sass-watch', gulp.series('cssDev'), (done) => {
    browserSync.reload();
    done();
  });

  // Image resizing using gulp-scale-images and
  // optimization using imagemin with non-default plugins

  // This function makes two variants of each source image
  const cp = require('child_process');
  const scaleImages = require('gulp-scale-images');
  const flatMap = require('flat-map').default;
  const pngquant = require('imagemin-pngquant');
  const mozjpeg = require ('imagemin-mozjpeg');
  const path = require('path');

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
  gulp.task('minimize-images', (done) => {
    return gulp.src('./assets/img/**/*.{jpg,jpeg,png,svg}')
      .pipe(newer('./_site/assets/img/'))
      .pipe(flatMap(retinaVersions))
      .pipe(scaleImages(imageFileName))
      .pipe(imagemin([mozjpeg(), pngquant()]))
      .pipe(gulp.dest('./_site/assets/img/'));
  });

  // Copy font assets
  gulp.task('copyFonts', (done) => {
    gulp.src('./assets/themes/custom/rhdp2/fonts/patternfly/**/*.*').pipe(gulp.dest('./_site/themes/custom/rhdp2/fonts/patternfly/'));

    done();
  });

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
  gulp.task('serve-jekyll', (done) => {
    cp.exec('bundle exec jekyll serve --livereload', function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      done(err);
    });
  });

  // Install submodule dependencies
  gulp.task('buildSubmodule', function (cb) {
    exec('ping localhost', function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
    // exec('npm install', function(err, stdout, stderr) {
    //   console.log(stdout);
    //   console.log(stderr);
    //   cb(err);
    // });
  });

  // exports.submodule = buildSubmodule;

  // exports.build = gulp.series(
  //   buildSubmodule
  // );

  // @ts-ignore
  gulp.task('development', gulp.series('minimize-images', 'cssDev', gulp.parallel('sass-watch', 'serve-jekyll', (done) => {
    done();
  })));

  // @ts-ignore
  gulp.task('prod', gulp.series('copyFonts', 'minimize-images', 'copyFonts', buildJekyll, (done) => {
    done();
  }));
})();
