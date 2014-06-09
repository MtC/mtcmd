/**
* Created with mtcmd.
* User: MtC
* Date: 2014-05-26
* Time: 08:07 PM
*/
define(['./module','mtcmd'], function (controllers,mtcmd) {
    'use strict';
    controllers.controller('MarkdownCtrl', ['$scope',function ($scope) {
        $scope.markdown = mtcmd.rememberMD;
        mtcmd.setMDLines($scope.markdown).getJSON();
        //mtcmd.expandTextarea('md');

        $('#md').on('input', function () {
            mtcmd.setMDLines($(this).val()).getJSON();
            mtcmd.rememberMD = $(this).val();
            //$scope.selectionView();
        });

        $scope.selectionView = function (sStartTag, sEndTag, type) {
            var bDouble = arguments.length > 1, oMsgInput = document.getElementById('md'), nSelStart = oMsgInput.selectionStart, nSelEnd = oMsgInput.selectionEnd, sOldText = oMsgInput.value, errorMsg = [];
            if (nSelStart === 0 || sOldText[nSelStart -1] === '\n') {
                if (type === 'inlineEscape') {
                    sStartTag = '\\' + sStartTag;
                } else if (type === 'list') {
                    var tada = sOldText.substring(nSelStart,nSelEnd), i, addr = nSelStart, baddr = nSelEnd;
                    var tidi = tada.split('\n');
                    for (i = 0; i < tidi.length; i = i + 1) {
                        oMsgInput.value = sOldText.substring(0, addr) + (bDouble ? sStartTag + sOldText.substring(addr, baddr) + sEndTag : sStartTag) + sOldText.substring(baddr);
                        oMsgInput.setSelectionRange(bDouble || addr === baddr ? addr + sStartTag.length : addr, (bDouble ? baddr : addr) + sStartTag.length);
                        addr += tidi[i].length + 2;
                        baddr += tidi[i].length;
                        sOldText = oMsgInput.value;
                        oMsgInput.focus();
                        mtcmd.setMDLines(oMsgInput.value).getJSON();
                        mtcmd.rememberMD = oMsgInput.value;
                    }
                    return;
                }
            } else {
                if (type === 'line') {
                    errorMsg.push('Je mag alleen een regel starten met deze knop.');
                }
            }
            if (errorMsg.length > 0) {
                $scope.showSelection = errorMsg[0];
            } else {
                oMsgInput.value = sOldText.substring(0, nSelStart) + (bDouble ? sStartTag + sOldText.substring(nSelStart, nSelEnd) + sEndTag : sStartTag) + sOldText.substring(nSelEnd);
                oMsgInput.setSelectionRange(bDouble || nSelStart === nSelEnd ? nSelStart + sStartTag.length : nSelStart, (bDouble ? nSelEnd : nSelStart) + sStartTag.length);
                oMsgInput.focus();
                mtcmd.setMDLines(oMsgInput.value).getJSON();
                mtcmd.rememberMD = oMsgInput.value;
            }
        };

        $scope.innerMarkdown = function (option) {
            console.log(option);
        };
    }]);
});