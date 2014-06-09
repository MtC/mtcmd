/**
* Created with mtcmd.
* User: MtC
* Date: 2014-05-26
* Time: 08:04 PM
*/
define(['./module','mtcmd'], function (controllers, mtcmd) {
    'use strict';
    controllers.controller('ShowCtrl', ['$scope','$sce',function ($scope,$sce) {
        if (mtcmd.aLines.length > 0) {
            $scope.html = mtcmd.getHTML(mtcmd.aLines);
            $scope.show = $sce.trustAsHtml(mtcmd.getHTML(mtcmd.aLines));
        } else if (typeof(localStorage.getItem('tekst')) !== 'undefined') {
            mtcmd.setMDLines(localStorage.getItem('tekst'));
            $scope.html = mtcmd.getHTML(mtcmd.aLines);
            $scope.show = $sce.trustAsHtml(mtcmd.getHTML(mtcmd.aLines));
        } else {
            $scope.show = $sce.trustAsHtml('<em>geen input</em>');
        }
    }]);
});