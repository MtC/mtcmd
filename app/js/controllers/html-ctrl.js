/**
* Created with mtcmd.
* User: MtC
* Date: 2014-05-26
* Time: 08:05 PM
*/
define(['./module','mtcmd'], function (controllers,mtcmd) {
    'use strict';
    controllers.controller('HtmlCtrl', ['$scope','$sce',function ($scope,$sce) {
        $scope.html = mtcmd.getHTML(mtcmd.aLines);
    }]);
});