'use strict';

require('angular');
require('jquery');
require('underscore');

var app = angular.module('sampleApp', ['ngRoute']);

app.controller('SampleController', ['$scope', require('./scripts/controllers/SampleController')]);

app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/sample.html',
            controller: 'SampleController'
        });
});

