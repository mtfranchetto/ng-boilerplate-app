'use strict';

require('angular');
require('jquery');
require('underscore');

var SampleController = require('./scripts/controllers/SampleController'),
    app = angular.module('sampleApp', []);

app.controller('SampleController', ['$scope', SampleController]);
