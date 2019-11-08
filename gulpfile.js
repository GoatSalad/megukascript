// Builds userscript JS.
'use strict'

const gulp = require('gulp'),
	ts = require('gulp-typescript'),
	us = require('gulp-userscript')

// Dependency tasks for the default tasks.
const tasks = []

// Userscript JS files.
createTask("userscript", `src/**/*.ts`, src =>
	src.pipe(ts.createProject("src/tsconfig.json", {
			typescript: require("typescript")
		})())
		.on('error', handleError)
		.pipe(us({
			name: "megucascript",
			namespace: "megucasoft",
			author: "medukasthegucas",
			version: "4.0.0",
			description: "Does a lot of stuff",
			icon: "icon.jpg",
			require: "almond.js",
			match: [
				"*://127.0.0.1:8000/*",
				"*://meguca.org/*",
				"*://chiru.no/*",
				"*://megu.ca/*",
				"*://kirara.cafe/*"
			],
			exclude: [
				"/^.*://127\.0\.0\.1:8000/(api|assets|html|json)/.*$/",
				"/^.*://meguca\.org/(api|assets|html|json)/.*$/",
				"/^.*://chiru\.no/(api|assets|html|json)/.*$/",
				"/^.*://megu\.ca/(api|assets|html|json)/.*$/",
				"/^.*://kirara\.cafe/(api|assets|html|json)/.*$/"
			]
		}))
		.pipe(gulp.dest('.'))
)

gulp.task('default', gulp.series(tasks))

// Fail the build and exit with an error status.
// This way we can use failure to build the client to not pass Travis CL tests.
function handleError(err) {
	throw err
}

// Create a new gulp task and set it to execute on default and incrementally.
function createTask(name, path, task) {
	tasks.push(name)
	gulp.task(name, () =>
		task(gulp.src(path))
	)
}
