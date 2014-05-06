/**
* Created with mtcmd.
* User: MtC
* Date: 2014-05-06
* Time: 09:27 PM
*/

require(["mtcmd"], function(mtcmd) {
    //This function is called when scripts/helper/util.js is loaded.
    //If util.js calls define(), then this function is not fired until
    //util's dependencies have loaded, and the util argument will hold
    //the module value for "helper/util".
    mtcmd.pizza();
});