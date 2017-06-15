const gulp = require('gulp');
const babel = require('gulp-babel');
const UglifyJS = require('uglify-js');
const concat = require('gulp-concat-util');
const less = require('gulp-less');
const prefix = require('gulp-autoprefixer');
const fs = require('fs');

gulp.task('es2015', function() {
  return gulp
    .src('datepicker.js')
    .pipe(babel({presets: [
      ['es2015', {modules: false}] // https://goo.gl/SnO01g
    ]}))
    .on('error', onError)
    .pipe(concat('datepicker-es5.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('uglify-js', function(done) {
  // Followed the example here - https://goo.gl/AZD4r8
  let code = fs.readFileSync('./datepicker-es5.js', 'utf-8').split('\n');

  // Because babel puts the `_typeof` function in the global scope :/
  let _typeof = code[0];
  code.shift();
  code.splice(2, 0 , _typeof);
  code = code.join('\n');

  let toplevel = (function() {
    try {
      // UglifyJS parse errors are horrendously vague.
      // Try / catch will give us insight when errors are thrown.
      return UglifyJS.parse(code);
    } catch (error) {
      console.log('ERROR:', error);
    }
  })();
  let compressor = UglifyJS.Compressor({
    sequences: 400,
    dead_code: true,
    conditionals: true,
    booleans: true,
    unused: true,
    if_return: true,
    join_vars: true,
    drop_console: false
  });

  toplevel.figure_out_scope();

  let compressed_ast = toplevel.transform(compressor);

  // According to the docs, this will usually break your code.
  // That's EXACTLY the results we keep getting.
  // compressed_ast = UglifyJS.mangle_properties(compressed_ast);

  compressed_ast.figure_out_scope();
  compressed_ast.compute_char_frequency();
  compressed_ast.mangle_names();

  fs.writeFileSync('datepicker.min.js', compressed_ast.print_to_string());
  // fs.unlinkSync('./datepicker-es5.js'); // Delete file.
  return done(); // Async completion.
});

gulp.task('less', function() {
  return gulp.src('less/datepicker.less')
    .pipe(less()) // datepicker.less > datepicker.css
    .on('error', onError)
    .pipe(prefix({browsers: ['last 2 versions']})) // browserslist: https://github.com/ai/browserslist
    .on('error', onError)
    .pipe(concat('datepicker.css'))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function(done) {
  gulp.watch('./datepicker.js', gulp.series('es2015', 'uglify-js'));
  gulp.watch('./less/datepicker.less', gulp.series('less'));
  return done(); // Async completion.
});

gulp.task('default', gulp.series(/*'es2015', 'uglify-js', */'less', 'watch'));

// http://goo.gl/SboRZI
// Prevents gulp from crashing on errors.
function onError(err) {
  console.log(err);
  this.emit('end');
}
