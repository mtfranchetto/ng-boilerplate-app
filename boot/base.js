"use strict";

require('jquery');
require('angular');
require('angular-route');
require('lodash');

var common = require('ng-common'),
    BaseBootstrapper = common.BaseBootstrapper,
    app = new BaseBootstrapper();

app.controller('SampleController', ['$scope', require('../scripts/controllers/SampleController')]);
app.config('$routeProvider', ['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/sample.html',
            controller: 'SampleController'
        });
}]);

module.exports = app;
