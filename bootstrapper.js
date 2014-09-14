'use strict';

require('browserify-angular');
require('jquery');
require('underscore');

var app = angular.module('sampleApp', []);

app.controller('SampleController', ['$scope', require('./scripts/controllers/SampleController')]);

