import autoprefixer from 'autoprefixer';
import gulp from 'gulp';
import babel from 'gulp-babel';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import postcssimport from 'postcss-import';
import replace from 'gulp-replace';
import terser from 'gulp-terser';
import sourcemaps from 'gulp-sourcemaps';
import htmlmin from 'gulp-htmlmin';
import csso from 'postcss-csso';
import browsersync from 'browser-sync';
import rename from 'gulp-rename';

// HTML
const html = () => {
  return gulp
    .src('src/*.html')
    .pipe(
      htmlmin({
        removeComments: true,
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest('dist'))
    .pipe(browsersync.stream());
};

// CSS
// TODO: проверить сорсмапы
const styles = () => {
  return gulp
    .src('src/sass/index.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(postcss([postcssimport, autoprefixer, csso({ comments: false })]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(browsersync.stream());
};

// JS
const scripts = () => {
  return gulp
    .src('src/scripts/index.js')
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      })
    )
    .pipe(terser())
    .pipe(gulp.dest('dist/scripts'))
    .pipe(browsersync.stream());
};

// Images
// TODO: реализовать

// SVG
// TODO: реализовать

// Copy
const copy = () => {
  return gulp
    .src(['src/fonts/**/*', 'src/images/**/*'], { base: 'src' })
    .pipe(gulp.dest('dist/images'))
    .pipe(
      browsersync.stream({
        once: true,
      })
    );
};

// Paths
// TODO: проверить как работает и что делает
const paths = () => {
  return gulp
    .src('dist/*.html')
    .pipe(
      replace(/(<link rel="stylesheet" href=")styles\/(index.css">)/, '$1$2')
    )
    .pipe(replace(/(<script src=")scripts\/(index.js">)/, '$1$2'))
    .pipe(gulp.dest('dist'));
};

// Server
const server = () => {
  browsersync.init({
    ui: false,
    notify: false,
    server: {
      baseDir: 'dist',
    },
  });
};

// Watch
const watch = () => {
  gulp.watch('src/*.html', gulp.series(html, paths));
  gulp.watch('src/sass/**/*.scss', gulp.series(styles));
  gulp.watch('src/scripts/**/*.js', gulp.series(scripts));
  gulp.watch(['src/fonts/**/*', 'src/images/**/*'], gulp.series(copy));
};

// Default
export default gulp.series(
  gulp.parallel(html, styles, scripts, copy),
  paths,
  gulp.parallel(watch, server)
);
