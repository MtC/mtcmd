/**
* Created with mtcmd.
* User: MtC
* Date: 2014-05-26
* Time: 08:06 PM
*/
define(['./module','mtcmd'], function (controllers,mtcmd) {
    'use strict';
    controllers.controller('JsonCtrl', ['$scope','$sce', function ($scope,$sce) {
        if (mtcmd.aLines.length > 0) {
            $scope.json = $sce.trustAsHtml(JSON.stringify(mtcmd.aLines));
        } else if (typeof(localStorage.getItem('tekst')) !== 'undefined') {
            mtcmd.setMDLines(localStorage.getItem('tekst'));
            $scope.json = $sce.trustAsHtml(JSON.stringify(mtcmd.aLines));
            //$scope.show = $sce.trustAsHtml(mtcmd.getHTML(mtcmd.aLines));
        } else {
            $scope.json = $sce.trustAsHtml('<em>geen input</em>');
        }
    }]);
});