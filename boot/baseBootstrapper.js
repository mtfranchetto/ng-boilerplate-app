"use strict";

require('angular');
require('jquery');
require('underscore');

var common = require('ng-common'),
    BaseBootstrapper = common.BaseBootstrapper,
    ProviderTypes = common.angular.ProviderTypes,
    app = new BaseBootstrapper();

app.register('SampleController', ProviderTypes.CONTROLLER, ['$scope', require('../scripts/controllers/SampleController')]);

/*app.register('$routeProvider', ProviderTypes.CONFIG, ['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/sample.html',
            controller: 'SampleController'
        });
}]);*/

module.exports = app;
