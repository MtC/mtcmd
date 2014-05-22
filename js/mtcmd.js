/**
* Created with mtcmd.
* User: MtC
* Date: 2014-05-06
* Time: 08:56 PM
*/
define('mtcmd',['jquery','mdaddon'], function(jquery, mdaddon) {
    var md     = {};

    /**
     * most functions should be turned protected, but for now this works
     */

    // no idea, was recommended, hehe
    md.amd     = {};
    // here all json lines will be gathered
    md.aLines  = [];

    // for now only to stop direct rendering of the special cases (only when loading real page)
    md.configuration = {
        directRendering: false
    };

    /**
     * init loads additional special options and configuration
     */
    md.init = function (args) {
        if (typeof(mdaddon) !== 'undefined') {
            var i;
            for (i = 0; i < mdaddon.aLineOptions.length; i = i + 1) {
                md.specialLineOptions.push(mdaddon.aLineOptions[i]);
                md[mdaddon.aLineOptions[i].type] = mdaddon[mdaddon.aLineOptions[i].type];
            }
        }
        if (typeof(args) !== 'undefined' && typeof(args) === 'object') {
            for (var prop in args) {
                if (typeof(md.configuration[prop]) !== 'undefined') {
                    md.configuration[prop] = args[prop];
                }
            }
        }
    };

    /**
     * set markdown text
     * this divides the text in lines
     *
     * @param  {string} text
     * @return {object} self
     */
    md.setMDLines = function (text) {
        var i;
        md.lines = text.replace(/\n\r|\r/g,'\n').split('\n');
        md.aLines  = [];
        for (i = 0; i < md.lines.length; i = i + 1) {
            md.readLine(md.lines[i]);
        }
        return this;
    };

    /**
     * line options (regex expressions)
     */
    md.lineOptions = [
        {type: 'h',          expression: /^#{1,6}/},
        {type: 'blockquote', expression: /^>/},
        {type: 'pre',        expression: /^`/},
        {type: 'hr',         expression: /^_{3,}$/},
        {type: 'hr',         expression: /^\*{3,}$/},
        {type: 'ul',         expression: /^\++/},// for now only one level
        {type: 'ul',         expression: /^\*+/},// for now only one level
        {type: 'ol',         expression: /^\d{0,2}\./},// for now only one level
    ];

    /**
     * special line options (regex expressions)
     */
    md.specialLineOptions = [
        {type: 'createYoutube',   expression: /^\[youtube:/},
        {type: 'createImage',     expression: /^\[image:/}
    ];

    md.createYoutube = function (text) {
        return {e:'div',c:[{e:'iframe',a:[{src:'//www.youtube.com/embed/' + text},{allowfullscreen:true},{class:['embeddedYoutube']}]}],abbr:'[youtube:' + text + ']'};
    };

    md.createImage = function (text) {
        return {e:'div',c:[{e:'i',a:[{src:/* eh */ text},{class:['embeddedImage']}]}],abbr:'[image:' + text + ']'};
    };

    /**
     * checks whether expressions are found (at least twice)
     *
     * @param  {string}       the line that must be evaluated
     * @param  {array}        the list with regex expressions that will be valued
     * @return {object|bool}  if true an object with location et cetera, else false
     */
    md.expressionCheck = function (sLine, aExpressions, bEndTag) {
        var i, respons, regexInfo, regexEndTag;
        if (typeof(bEndTag) !== 'undefined' && bEndTag) {
            regexEndTag = /\]$/;
            for (i = 0; i < aExpressions.length; i = i + 1) {
                if (aExpressions[i].expression.exec(sLine) && regexEndTag.exec(sLine)) {
                    respons        = aExpressions[i];
                    regexInfo      = sLine.replace(aExpressions[i].expression,'').slice(0,-1);
                    respons.oEmbed = md[respons.type](regexInfo);
                    return respons;
                }
            }
        } else {
            for (i = 0; i < aExpressions.length; i = i + 1) {
                if (aExpressions[i].expression.exec(sLine)) {
                    respons = aExpressions[i];
                    regexInfo = aExpressions[i].expression.exec(sLine);
                    respons.symbol = regexInfo[0].length;
                    respons.info   = regexInfo;
                    return respons;
                }
            }
        }
        return false;
    };

    /**
     * html encode options (regex expressions)
     * at this point not used
     */
    md.htmlEncode = [
        {expression: /'/g, encoded: '&#039;'},
        {expression: /"/g, encoded: '&quot;'}
        //...
    ];

    /**
     * html decode options (regex expressions)
     * at this point not used
     */
    md.htmlDecode = [
        {expression: /&#039;/g, encoded: "'"},
        {expression: /&quot;/g, encoded: '"'}
    ];

    /**
     * html en/de-coder
     * at this point not used
     *
     * @param  {string} this line which must be evaluated
     * @param  {string} which options should be used
     * @return {string} evaluated line
     */
    md.htmlEncoder = function (sLine, coder) {
        var i, options = typeof(coder) !== 'undefined' && coder === 'decode' ? md.htmlDecode : md.htmlEncode;
        for (i = 0; i < options.length; i = i + 1) {
            sLine = sLine.replace(options[i].expression, options[i].encoded);
        }
        return sLine;
    };

    /**
     * line tags with different behaviour
     */
    md.lineTags = {
        listTags:     ['ul','ol'],
        textlessTags: ['hr'],
        lineTags:     ['h1','h2','h3','h4','h5','h6','hr']
    };

    /**
     * analyses the line, main element and text elements
     *
     * @param  {string} line
     * @return {object} json
     */
    md.readLine = function (sLine) {
        //line = line.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        var i, check, tag, oTemp = {};
        //var tester = [{element:'p',content:md.splitInlineElement(sLine)}];
        //console.log(tester);
        //$('#show2').text(JSON.stringify(tester));
        if ((check = md.expressionCheck(sLine, md.lineOptions))) {// variable declaration in if statement
            // the line starts with one of the basic options
            sLine = sLine.replace(check.expression,'').replace(/^\s*/,'').replace(/\s{2,}/g,' ');
            tag   = check.type === 'h' ? check.type + check.symbol : check.type;
            if (check.type === 'h') sLine = sLine.replace(/#*$/,'');
            if (md.lineTags.listTags.indexOf(tag) !== -1) {// ul or ol
                md.processListLine(sLine, tag, check);
            } else {
                oldTagIndex = md.aLines.length - 1;
                oldTag = oldTagIndex > -1 ? md.aLines[oldTagIndex].e : '';
                if (oldTag === tag) {
                    element = {e:"br",c:null};
                    md.aLines[oldTagIndex].c.push(element);
                    //aTag = md.lineTags.textlessTags.indexOf(tag) !== -1 ? null : md.traverseLine(sLine);
                    aTag = md.lineTags.textlessTags.indexOf(tag) !== -1 ? null : md.splitInlineElement(sLine);
                    iiLength = aTag.length;
                    for (ii = 0; ii < iiLength; ii = ii + 1){
                        md.aLines[oldTagIndex].c.push(aTag[ii]);
                    }
                } else {
                    oTemp = {
                        e: tag,
                        //content: md.lineTags.textlessTags.indexOf(tag) !== -1 ? null : md.traverseLine(sLine)
                        c: md.lineTags.textlessTags.indexOf(tag) !== -1 ? null : md.splitInlineElement(sLine)
                    };
                    //console.log(oTemp);
                    md.aLines.push(oTemp);
                }
            }
        } else if ((check = md.expressionCheck(sLine, md.specialLineOptions, true))) {// variable declaration in if statement
            // the line starts with one of the special options
            md.aLines.push(check.oEmbed);
            //console.log(md.aLines);
        } else {
            // the line doesn't have a tag / element set.
            // this could mean it is a p or an additional line for an earlier element
            md.processTaglessLine(sLine);
        }
    };

    /**
     * processes a list line (ul or ol)
     * for now only one level
     *
     * @param  {string} the line to be processed
     * @param  {string} the specific element (tag)
     * @param  {object} the object from expressionCheck
     * @return {object} the list object (indirect at times)
     */
    md.processListLine = function (sLine, sTag, oCheck) {
        var i, ii, oldTag, oldTagIndex, oTemp,
            li = {e: 'li', c: []},
            options = {
                ul: {e: 'ul', c: []},
                ol: {e: 'ol', c: []}
            };
        oldTagIndex = md.aLines.length - 1;
        oldTag      = oldTagIndex > -1 ? md.aLines[oldTagIndex].e : '';
        if (oldTag !== sTag) {
            oTemp = options[sTag];
            oTemp.depth = 1;
            oTemp.used  = oCheck.symbol;
            if (sTag === 'ol') {
                oTemp.start = parseInt(oCheck.info[0].replace('.',''), 10);
                oTemp.start = isNaN(oTemp.start) ? 1 : oTemp.start;
                oTemp.a = [{start: oTemp.start}];
                delete oTemp.start;
            }
            oTemp.c.push(li);
            oTemp.c[0].c = md.splitInlineElement(sLine).length ? md.splitInlineElement(sLine) : [{e:"#text",c:""}];
            md.aLines.push(oTemp);
        } else {
            md.loop(md.aLines[oldTagIndex], oCheck, sLine);
        }
    };

    md.loopChildList = function (oTemp, oLine, isLi) {
        isLi = isLi || false;
        if (oTemp.c.length > 0 && oTemp.c[oTemp.c.length - 1].e === oTemp.e) {
            oTemp.c[oTemp.c.length -1] = md.loopChildList(oTemp.c[oTemp.c.length - 1], oLine, isLi);
        } else {
            if (isLi) {
                if (oTemp.e === 'li') {
                    // this option is for the first element
                    oTemp.c.push(oLine);
                } else {
                    // this option is for all other ul/ol elements
                    oTemp.c[oTemp.c.length - 1].c.push(oLine);
                }
            } else {
                oTemp.c.push(oLine);
            }
        }
        return oTemp;
    };

    md.loopChildListUntil = function (oTemp, oLine, iDepth, iCounter) {
        if (iDepth === iCounter) {
            oTemp.c.push(oLine);
        } else {
            iCounter++;
            oTemp.c[oTemp.c.length -1] = md.loopChildListUntil(oTemp.c[oTemp.c.length - 1], oLine, iDepth, iCounter);
        }
        return oTemp;
    };

    md.loop = function (oTag, oCheck, sLine) {
        var iNewDepth = oCheck.symbol,
            oLine;
        if (oTag.used === iNewDepth) {
            oLine = md.splitInlineElement(sLine).length ? {e:'li',c:md.splitInlineElement(sLine)} : [{e:"#text",c:""}];
            md.loopChildList(oTag, oLine);
        } else if (oTag.used < iNewDepth) {
            oTag.depth++;
            oTag.used = iNewDepth;
            oLine     = md.splitInlineElement(sLine).length ? md.splitInlineElement(sLine) : [{e:"#text",c:""}];
            oTemp     = {e:oCheck.type,c:[{e:'li',c:oLine}]};
            md.loopChildList(oTag, oTemp);
        } else {
            if (oTag.depth - (oTag.used - iNewDepth) <= 1) {
                oTag.depth = 1;
                oTag.used  = oCheck.symbol;
                oLine      = md.splitInlineElement(sLine).length ? md.splitInlineElement(sLine) : [{e:"#text",c:""}];
                oTemp      = {e:'li',c:oLine};
                oTag.c.push(oTemp);
            } else {
                oTag.depth = oTag.depth - (oTag.used - iNewDepth);
                oTag.used  = oCheck.symbol;
                oLine      = md.splitInlineElement(sLine).length ? md.splitInlineElement(sLine) : [{e:"#text",c:""}];
                oTemp      = {e:'li',c:oLine};
                md.loopChildListUntil(oTag, oTemp, oTag.depth, 1);
            }
        }
    };

    md.processTaglessLine = function (sLine) {
        var i, ii, oldTag, tag, element, aTag, iiLength, oTemp, tagLength;
        i      = md.aLines.length - 1;
        // only the special lines are encapsulated in a div, thus ignored
        oldTag = i > -1 && md.aLines[i].e !== 'div' ? md.aLines[i].e : '';
        sLine  = sLine.replace(/^\s*/,'').replace(/\s{2,}/g,' ');

        if (oldTag === 'undetermined') {

            // last line was empty, that line must be removed, this line will be new 'p'
            oldTag = '';
            md.aLines.pop();

        } else if (oldTag === 'p' && md.aLines[i].c.length === 1 && /^={1,}$/.exec(sLine) !== null) {

            // cosmetic h1-version, last line must be 'h1', this line should be discarded
            md.aLines[i].a = [];
            md.aLines[i].e = 'h1';
            return;

        } else if (oldTag === 'p' && md.aLines[i].c.length === 1 && /^-{1,}$/.exec(sLine) !== null) {

            // cosmetic h2-version, last line must be 'h2', this line should be discarded
            md.aLines[i].a = [];
            md.aLines[i].e = 'h2';
            return;

        }
        if (md.lineTags.lineTags.indexOf(oldTag) !== -1 || oldTag === '') {
            oTemp   = {
                e: 'p',
                //content: md.traverseLine(sLine)
                c: md.splitInlineElement(sLine)
            };
            var tester = /^::/;
            var pizza  = tester.exec(sLine);
            console.log(pizza);
            if (pizza !== null) {
                sLine = sLine.replace(/^::/,'');
                oTemp.a = [{class:['capitalP']}];
                oTemp.c = md.splitInlineElement(sLine);
            }
            md.aLines.push(oTemp);
        } else if (md.lineTags.lineTags.indexOf(oldTag) === -1 && sLine.length > 0) {
            tag = oldTag;
            element = {e:"br",c:null};
            if (tag !== 'ul' && tag !== 'ol') {
                md.aLines[i].c.push(element);
                //aTag = md.lineTags.textlessTags.indexOf(tag) !== -1 ? null : md.traverseLine(sLine);
                aTag = md.lineTags.textlessTags.indexOf(tag) !== -1 ? null : md.splitInlineElement(sLine);
                iiLength = aTag.length;
                for (ii = 0; ii < iiLength; ii = ii + 1){
                    md.aLines[i].c.push(aTag[ii]);
                }
            } else {
                tagLength = md.aLines[i].c.length - 1;
                md.loopChildList(md.aLines[i].c[tagLength], element, true);
                aTag = md.lineTags.textlessTags.indexOf(tag) !== -1 ? null : md.splitInlineElement(sLine);
                iiLength = aTag.length;
                for (ii = 0; ii < iiLength; ii = ii + 1){
                    md.loopChildList(md.aLines[i].c[tagLength], aTag[ii], true);
                }
            }
        } else {
            oTemp = {
                e: 'undetermined',
                c: null
            };
            md.aLines.push(oTemp);
        }
        iiLength = md.aLines.length - 1;
        if (iiLength > -1 &&
            typeof(md.aLines[iiLength].c) !== 'undefined' &&
            md.aLines[iiLength].c !== null &&
            md.aLines[iiLength].c.length > 0 &&
            md.aLines[iiLength].c[0].e === 'br') {
            md.aLines[iiLength].c.shift();
        }
    };

    md.inlineElement = [
        {element: 'em',     splitStart: '//', isStartEnd: true},
        {element: 'mark',   splitStart: '__', isStartEnd: true},
        {element: 'strong', splitStart: '**', isStartEnd: true},
        {element: 'sup',    splitStart: '^^', isStartEnd: true},
        {element: 'sub',    splitStart: '--', isStartEnd: true},
        {element: 'abbr',   splitStart: '~~', isStartEnd: true},
        {element: 'code',   splitStart: '``', isStartEnd: true},
        {element: 'span',   splitStart: '::', isStartEnd: true},
        {element: 'small',  splitStart: '<<', isStartEnd: false, splitEnd: '>>'},
        {element: 'a',      splitStart: '[',  isStartEnd: false, splitEnd: ')'},
        {element: 'img',    splitStart: '[',  isStartEnd: false, splitEnd: ']'}
    ];

    /**
     * getFirstInlineElement
     * traverses the inline elements and finds the first inline element
     *
     * @returns {object} {location:..., inlineElement: ...}
     */
    md.getFirstInlineElement = function (sLine) {
        var iLength = md.inlineElement.length,
            i, ii, aSplitted, oFirstSplit = {location: -1, inlineElement: {}};
        for (i = 0; i < iLength; i = i + 1) {
            aSplitted = sLine.split(md.inlineElement[i].splitStart);
            if (aSplitted.length > 2 && md.inlineElement[i].isStartEnd && (oFirstSplit.location === -1 || aSplitted[0].length < oFirstSplit.location)) {
                oFirstSplit.location      = aSplitted[0].length;
                oFirstSplit.inlineElement = md.inlineElement[i];
            } else if (aSplitted.length > 1 && !md.inlineElement[i].isStartEnd) {
                ii        = aSplitted.shift().length;
                aSplitted = aSplitted.join().split(md.inlineElement[i].splitEnd);
                if (aSplitted.length > 1 && (oFirstSplit.location === -1 || ii < oFirstSplit.location)) {
                    // first check a-element: otherwise img will fire too early
                    if (md.inlineElement[i].element === 'a') {
                        aSplitted = aSplitted.shift().split('](');
                        if (aSplitted.length === 2) {
                            oFirstSplit.location      = ii;
                            oFirstSplit.inlineElement = md.inlineElement[i];
                        }
                    } else { // other checks can be build here
                        oFirstSplit.location      = ii;
                        oFirstSplit.inlineElement = md.inlineElement[i];
                    }
                }
            }
        }
        return oFirstSplit;
    };

    md.splitInlineElement = function (sLine) {
        var i, ii, aSplitted, aLine = [], aTemp, oTemp, sTemp, oFirstSplit = md.getFirstInlineElement(sLine);
        if (oFirstSplit.location === -1) {
            aLine.push({e:"#text",c:sLine});
        } else {
            aSplitted = sLine.split(oFirstSplit.inlineElement.splitStart);
            if (aSplitted.length > 2 && oFirstSplit.inlineElement.isStartEnd) {
                sTemp = aSplitted.shift();
                ii    = sTemp.length;
                if (sTemp.length > 0) aLine.push({e:"#text",c:sTemp});
                sTemp = aSplitted.shift();
                ii   += sTemp.length + 4;
                aTemp = md.splitInlineElement(sTemp);
                aLine.push({e:oFirstSplit.inlineElement.element,c:aTemp});
                sTemp = sLine.substring(ii);
                if (sTemp.length > 0) {
                    console.log(sTemp);
                    aTemp = md.splitInlineElement(sTemp);
                    console.log(aTemp);
                    for (ii = 0; ii < aTemp.length; ii = ii + 1) {
                        aLine.push(aTemp[ii]);
                    }
                }
                return aLine;
            } else if (aSplitted.length > 1 && !oFirstSplit.inlineElement.isStartEnd) {
                sTemp     = aSplitted.shift();
                ii        = sTemp.length;
                if (sTemp.length > 0) aLine.push({e:"#text",c:sTemp});
                aSplitted = aSplitted.join().split(oFirstSplit.inlineElement.splitEnd);
                sTemp     = aSplitted.shift();
                ii       += sTemp.length + oFirstSplit.inlineElement.splitStart.length + oFirstSplit.inlineElement.splitEnd.length;
                if (oFirstSplit.inlineElement.element === 'a') {
                    aTemp = sTemp.split('](');
                    oTemp = {e:'a',a:[{href:aTemp[1]}],c:md.splitInlineElement(aTemp[0])};
                    aLine.push(oTemp);
                } else if (oFirstSplit.inlineElement.element === 'img') {
                    oTemp = {e:'img',a:[]};
                    if (sTemp.length > 2 && sTemp[0] === ':' && sTemp[sTemp.length - 1] === ':') {
                        oTemp.a.push({class:['centerImage']});
                    } else if (sTemp.length > 1 && sTemp[0] === ':') {
                        oTemp.a.push({class:['leftImage']});
                    } else if (sTemp.length > 1 && sTemp[sTemp.length - 1] === ':') {
                        oTemp.a.push({class:['rightImage']});
                    }
                    sTemp = sTemp.replace(/:/g,'');
                    oTemp.a.push({href:sTemp});
                    aLine.push(oTemp);
                } else {
                    oTemp = {e:oFirstSplit.inlineElement.element,c:md.splitInlineElement(sTemp)};
                    aLine.push(oTemp);
                }
                sTemp = sLine.substring(ii);
                if (sTemp.length > 0) {
                    aTemp = md.splitInlineElement(sTemp);
                    for (ii = 0; ii < aTemp.length; ii = ii + 1) {
                        aLine.push(aTemp[ii]);
                    }
                }
                return aLine;
            }
        }
        return aLine;
    };

    md.getHTML = function (aJSON) {
        var iJSON = aJSON.length,
            i, ii, tempElement, subTempElement, oHTML = document.createElement('div');
        for (i = 0; i < iJSON; i = i + 1) {
            if (aJSON[i].e === "#text") {
                tempElement = document.createTextNode(aJSON[i].c);
                oHTML.appendChild(tempElement);
            } else {
                tempElement = document.createElement(aJSON[i].e);
                if (typeof(aJSON[i].a) !== 'undefined') {
                    for (var key in aJSON[i].a) {
                        var obj = aJSON[i].a[key];
                        for (var prop in obj) {
                            if(obj.hasOwnProperty(prop)) {
                                var att;
                                att = document.createAttribute(prop);
                                if (typeof(obj[prop]) === 'object') {
                                    var attr = [];
                                    for (var innerProp in obj[prop]) {
                                        if (obj[prop].hasOwnProperty(innerProp)) {
                                            attr.push(obj[prop][innerProp]);
                                        }
                                    }
                                    att.value = attr.join(' ');
                                } else {
                                    att = document.createAttribute(prop);
                                    att.value = obj[prop];
                                }
                                tempElement.setAttributeNode(att);
                            }
                        }
                    }
                }
                if (typeof(aJSON[i].c) !== 'undefined' && aJSON[i].c !== null) {
                    for (ii = 0; ii < aJSON[i].c.length; ii = ii + 1) {
                        subTempElement = md.getHTML([aJSON[i].c[ii]]);
                        tempElement.innerHTML += subTempElement;
                    }
                }
                oHTML.appendChild(tempElement);
            }
            oHTML.appendChild(tempElement);
        }
        return oHTML.innerHTML;
    };

    /**
     * temp return JSON
     */
    md.getJSON = function () {
        $('#showMd').html(md.getHTML(md.aLines));
        $('#showJson').text(JSON.stringify(md.aLines));
        return this;
    };

    md.expandTextarea = function (id) {
        var element = document.getElementById(id);
        element.addEventListener('keyup', function() {
            this.style.overflow = 'hidden';
            this.style.height = 0;
            this.style.height = this.scrollHeight + 'px';
        }, false);
    };

    return md;
});