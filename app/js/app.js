/**
* Created with mtcmd.
* User: MtC
* Date: 2014-05-26
* Time: 07:53 PM
*/
define([
        'angular',
        'uiRouter',
        //'mtcmd',
        './controllers/index.js'
        //'./directives/index',
        //'./filters/index',
        //'./services/index'
    ], function (ng) {
        'use strict';

        return ng.module('app', [
            //'app.services',
            'app.controllers',
            //'app.filters',
            //'app.directives'
            'ui.router',
            //'mtcmd'
         ]);
 });