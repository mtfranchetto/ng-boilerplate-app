"use strict";

require('angular');
require('angular-route');
require('jquery');
require('lodash');

var common = require('ng-common'),
    BaseBootstrapper = common.BaseBootstrapper,
    ProviderTypes = common.angular.ProviderTypes,
    app = new BaseBootstrapper();

app.register('SampleController', ProviderTypes.CONTROLLER, ['$scope', require('../scripts/controllers/SampleController')]);

app.register('$routeProvider', ProviderTypes.CONFIG, ['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/sample.html',
            controller: 'SampleController'
        });
}]);

module.exports = app;
