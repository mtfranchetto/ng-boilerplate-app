#ng-boilerplate-app

###Why
The idea behind it's simple: enable **code reuse** and maximize **efficiency**.

By using a set of tools the build system can improve code reusing by requiring external modules using a package manager and build the app continuously using files watchers.

To wrap up, here's a list of the things available:

* JavaScript bundle
* Files watchers
* Live reloading
* CSS automatic vendor prefixes
* Compass support
* Build variants
* Code uglify
* Source maps
* TDD/BDD support
* Code coverage
* JSHint support

###CLI reference:

`$ gulp build --variant=[variant|all]`

Default task, used to package JS, Compass (CSS) files, images and templates.

Optional: specify a custom variant to build (e.g. release-main).

`$ gulp watch`

Runs the build task every time a dependency change is detected. [Watchify](https://github.com/substack/watchify) is used in this case.

`$ gulp test`

Run tests with **[Karma](https://github.com/karma-runner/karma)** and **[Jasmine](http://jasmine.github.io/2.0/introduction.html)**.

`$ gulp watch-test`

Runs the build and test tasks every time a dependency change is detected.

`$ gulp serve`

Exposes the build through an [Express](http://expressjs.com/) application.

`$ gulp lint`

Run [JSHint](http://www.jshint.com/).

`$ gulp browserify`

Packages JavaScript files with Browserify.

`$ gulp styles`

Packages Compass files.

`$ gulp images`

Packages images.

###Modules
External NPM modules are based on **[ng-boilerplate-module](https://github.com/mtfranchetto/ng-boilerplate-module)**.

##Contribute

I am using [Git Flow](https://github.com/nvie/gitflow).