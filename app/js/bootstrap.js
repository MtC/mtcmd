/**
* Created with mtcmd.
* User: MtC
* Date: 2014-05-26
* Time: 07:48 PM
*/
define([
        'require',
        'angular',
        '../js/app',
        '../js/routes'
    ], function (require, ng) {
        'use strict';

        require(['domReady!'], function (document) {
            try {
                ng.bootstrap(document, ['app']);
            } catch (e) {
                console.error(e.stack || e.message || e);
            }
    });
});