/**
* Created with mtcmd.
* User: MtC
* Date: 2014-05-13
* Time: 05:19 PM
*/
define('mdaddon',[], function() {
    var md = {};

    /**
     * 
     */
    md.aLineOptions = [
        {type: 'createPrezi',     expression: /^\[prezi:/},
        {type: 'createApp',       expression: /^\[app:/}
    ];

    /**
     * 
     */
    md.createPrezi = function (text) {
        return {element:'div',content:[],abbr:'[prezi:' + text + ']'};
    };

    /**
     * 
     */
    md.createApp = function (text) {
        return {element:'div',content:[],abbr:'[app:' + text + ']'};
    };

    return md;
});