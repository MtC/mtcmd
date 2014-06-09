define(['./app'], function (app) {
     'use strict';
     return app.config(['$stateProvider','$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
         $urlRouterProvider.otherwise("/show");

         $stateProvider
             .state('intro', {
                 url: '/intro',
                 templateUrl: 'app/html/intro.html',
                 controller: 'IntroCtrl'
             })
             .state('show', {
                 url: '/show',
                 templateUrl: 'app/html/show.html',
                 controller: 'ShowCtrl'
             })
             .state('example', {
                 url: '/example',
                 templateUrl: 'app/html/example.html',
                 controller: 'ExampleCtrl'
             })
             .state('html', {
                 url: '/html',
                 templateUrl: 'app/html/html.html',
                 controller: 'HtmlCtrl'
             })
             .state('json', {
                 url: '/json',
                 templateUrl: 'app/html/json.html',
                 controller: 'JsonCtrl'
             })
             .state('markdown', {
                 url: '/markdown',
                 templateUrl: 'app/html/markdown.html',
                 controller: 'MarkdownCtrl'
             });

     }]);
 });