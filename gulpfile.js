// Dependencies
const gulp = require ('gulp');
const clean = require ('gulp-clean');
const eslint = require ('gulp-eslint');
const lab = require ('gulp-lab');
const ts = require ('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');

const tsProject = ts.createProject ('tsconfig.json');

// Constants
const LAB_CONFIG =
	'--verbose ' +
	'--sourcemaps ' +
	'--colors ' +
	'--leaks';

// Tasks
gulp.task ('clean', () => gulp
	.src ('dist', { read: false, allowEmpty: true })
	.pipe (clean ()));

gulp.task ('lint', () => gulp
	.src ('src/**/*.ts')
	.pipe(eslint())
	.pipe(eslint.format())
	.pipe(eslint.failAfterError()));

gulp.task ('compile', () => gulp
	.src ('src/**/*.ts')
	.pipe(sourcemaps.init())
	.pipe (tsProject())
	.pipe(sourcemaps.write('.', { sourceRoot: '../src', includeContent: false }))
	.pipe (gulp.dest ('dist')));

gulp.task ('test', () => gulp
	.src ('dist/test')
	.pipe (lab (LAB_CONFIG)));

gulp.task ('build', gulp.series (gulp.parallel ('clean', 'lint'), 'compile'));

gulp.task ('default', gulp.series ('build', 'test'));
