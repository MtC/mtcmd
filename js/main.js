/**
* Created with mtcmd.
* User: MtC
* Date: 2014-05-06
* Time: 09:27 PM
*/

require(["mtcmd"], function(mtcmd) {
    $('#md').on('input', function () {
        mtcmd.setMDLines($(this).val()).getJSON();
    });
    //console.log(JSON.stringify(mtcmd.traverseLine('vier __test **bleh** eh__ **gekkigheid** fiets //driehoek __vierkant__ zot//')));

});