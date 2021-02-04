import autoprefixer from "autoprefixer";
import gulp from "gulp";
import babel from "gulp-babel";
import sass from "gulp-sass";
import postcss from "gulp-postcss";
import postcssimport from "postcss-import";
import replace from "gulp-replace";
import terser from "gulp-terser";
import sourcemaps from "gulp-sourcemaps";
import htmlmin from "gulp-htmlmin";
import csso from "postcss-csso";
import browsersync from "browser-sync";
import rename from "gulp-rename";
import imagemin from "gulp-imagemin";
import imageminwebp from "gulp-webp";
import del from "del";
// * 10.01.21 функция mozjpeg объявлена в d.ts imagemin, но не поставляется вместе с ней, ставим отдельно
import imageminmozjpeg from "imagemin-mozjpeg";

// HTML
const html = () => {
  return gulp
    .src("src/*.html")
    .pipe(
      htmlmin({
        removeComments: true,
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest("dist"))
    .pipe(browsersync.stream());
};

// CSS
const styles = () => {
  return gulp
    .src("src/sass/index.scss")
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([postcssimport, autoprefixer, csso({ comments: false })]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemaps.write("sourcemaps"))
    .pipe(gulp.dest("dist/css"))
    .pipe(browsersync.stream());
};

// JS
const scripts = () => {
  return gulp
    .src("src/scripts/index.js")
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(terser())
    .pipe(gulp.dest("dist/scripts"))
    .pipe(browsersync.stream());
};

// Images
export const images = () => {
  return gulp
    .src("src/images/**/*.{png,jpg,svg}")
    .pipe(
      imagemin(
        [
          imagemin.optipng({
            optimizationLevel: 3,
          }),
          imageminmozjpeg({
            quality: 75,
            progressive: true,
          }),
          imagemin.svgo(),
        ],
        {
          verbose: true,
        }
      )
    )
    .pipe(gulp.dest("dist/images"));
};

export const webp = () => {
  return gulp
    .src("src/images/**/*.{png,jpg}")
    .pipe(imageminwebp({ quality: 75 }))
    .pipe(gulp.dest("dist/images"));
};

// Copy
const copy = () => {
  return gulp
    .src("src/fonts/**/*", { base: "src" })
    .pipe(gulp.dest("dist"))
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
    .src("dist/*.html")
    .pipe(
      replace(/(<link rel="stylesheet" href=")styles\/(index.css">)/, "$1$2")
    )
    .pipe(replace(/(<script src=")scripts\/(index.js">)/, "$1$2"))
    .pipe(gulp.dest("dist"));
};

// Server
const server = () => {
  browsersync.init({
    ui: false,
    notify: false,
    server: {
      baseDir: "dist",
    },
  });
};

// Utility
const clean = () => del("dist");

// Watch
const watch = () => {
  gulp.watch("src/*.html", gulp.series(html));
  gulp.watch("src/sass/**/*.scss", gulp.series(styles));
  gulp.watch("src/scripts/**/*.js", gulp.series(scripts));
  gulp.watch("src/fonts/**/*", gulp.series(copy));
  gulp.watch("src/images/**/*", gulp.series(webp, images));
};

// Default
export default gulp.series(
  clean,
  gulp.parallel(html, styles, scripts, webp, images, copy),
  gulp.parallel(watch, server)
);
