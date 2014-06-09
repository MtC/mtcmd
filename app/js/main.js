/**
* Created with mtcmd.
* User: MtC
* Date: 2014-05-06
* Time: 09:27 PM
*/
require.config({
    baseUrl: '/vendor/',
    paths: {
        'jquery':   'jquery/dist/jquery.min',
        'angular':  'angular/angular.min',
        'uiRouter': 'angular-ui-router/release/angular-ui-router.min',
        'domReady': 'requirejs-domready/domReady',
        'mtcmd':    '/app/js/mtc/mtcmd/0.1/mtcmd'
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        'uiRouter': {
            deps: ['angular']
        },
        'app': {
            deps: ['angular','uiRouter'],
        }
    },
    deps: ['../app/js/bootstrap']
});

require.onResourceLoad = function (context, map, depMaps) {

    var loadingStatusEl = document.getElementById('requirejs-loading-status'),
        loadingModuleNameEl = document.getElementById('requirejs-loading-module-name');
    var panel = document.getElementById('requirejs-loading-panel');

    if (loadingStatusEl && loadingModuleNameEl) {


        if (!context) { // we well call onResourceLoad(false) by ourselves when requirejs is not loading anything => hide the indicator and exit

            panel.style.display = "none";
            return;
        }

        panel.style.display = ""; // show indicator when any module is loaded and shedule requirejs status (loading/idle) check
        clearTimeout(panel.ttimer); 
        panel.ttimer = setTimeout(function () {


            var context = require.s.contexts._;
            var inited = true;
            for (var name in context.registry) {
                var m = context.registry[name];

                if (inited !== true) {
                    inited = false;
                    break;
                }

            } // here the "inited" variable will be true, if requirejs is "idle", false if "loading"

            if (inited) {
                require.onResourceLoad(false);
            }

        }, 400);
        if (map && map.name) { // we will add one dot ('.') and a currently loaded module name to the indicator

            loadingStatusEl.innerHTML = loadingStatusEl.innerHTML += '.'; //add one more dot character
            //loadingModuleNameEl.innerHTML = map.name + (map.url ? ' at ' + map.url : '');
        }
    } else {


    }


};

require(['jquery'],function($) {
    $('.saveMdLocal').on('click',function(){
        var text = $('#md').val();
        
        localStorage.setItem('tekst', text);
    });
});

/*
Markdown
========
Met *Markdown* kun je op een eenvoudige manier teksten opmaken. Het vraagt in het begin een klein beetje aanpassing, zoals met alle nieuwe manieren. Je vermijdt echter de frustratie zoals die bij andere systemen regelmatig opkomt. 

###WYSIWYG
Vaak zie je bij _c_ontent _m_anagement _s_ystems (=cms{content management system}=) een variant op wat men _w_hat _y_ou _s_ee _i_s _w_hat _y_ou _g_et (=wysiwyg{what you see is what you get}=) noemt. Er zijn meerdere velden, vaak één voor /titels/ en /subtitels/ en daarbij een tekstveld met tal van knoppen. Je selecteert een stuk tekst en drukt op de knop die een specifiek effect moet hebben.
Dit werkt meestal goed, maar soms raken er codes op de achtergrond in de war en werkt het niet zoals je zou willen. Ook kun je de teksten niet voorbereiden, aangezien alle opmaak in het systeem moet worden ingevoegd.
Voordelen van:
* Het werkt zoals /Word/;
* Je gebruikt het dus waarschijnlijk al een hele tijd;
* Dit is de variant die bijna iedereen gebruikt.

Nadelen van:
* Code kan in de war raken. Het is dan moeilijk om de fout te achterhalen zonder kennis van =html=.
* Je kunt geen complete teksten voorbereiden;
* Je kunt vaak je tekstblokken niet zelf aanpassen.

###Markdown
Mark
*/
