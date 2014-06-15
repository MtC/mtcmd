/**
* Created with mtcmd.
* User: MtC
* Date: 2014-05-06
* Time: 08:56 PM
*/
define('mtcmd',['jquery'], function($) {
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
    
    
    
    md.remembered = function () {
        if (typeof(localStorage.getItem('tekst')) !== 'undefined') {
            var text = localStorage.getItem('tekst');
            return text;
        } else {
            return '';
        }
    };
    
    md.rememberMD = md.remembered();

    /**
     * set markdown text
     * this divides the text in lines
     *
     * @param  {string} text
     * @return {object} self
     */
    md.setMDLines = function (text) {
        var i;
        text = text || '';
        md.lines = text.replace(/\n\r|\r/g,'\n').split('\n');
        md.aLines  = [];
        md.notes   = [];
        md.abbreviations = {abbr:[],title:[]};
        for (i = 0; i < md.lines.length; i = i + 1) {
            md.readLine(md.lines[i]);
        }
        if (md.notes.length > 0) md.footerNotes();
        return this;
    };
    
    //md.abbreviations = {abbr:[],title:[]};
    //md.notes = [];
    
    md.footerNotes = function () {
        console.log(md.notes);
        var i, oTemp, oOl, oLi;
        oOl = [];
        for (i = 0; i < md.notes.length; i = i + 1) {
            console.log(md.notes[i]);
            oLi = {e:'li',c:md.notes[i],a:[md.notes[i][0].a[0]]};
            oOl.push(oLi);
        }
        oTemp = {e:'footer',c:[{e:'ol',c:oOl}]};
        md.aLines.push(oTemp);
    };

    /**
     * line options (regex expressions)
     */
    md.lineOptions = [
        {type: 'h',          expression: /^#{1,6}\s/},
        {type: 'blockquote', expression: /^>+\s/},
        {type: 'pre',        expression: /^\s{4}/},
        {type: 'hr',         expression: /^(-\s?){3,}$/},
        {type: 'hr',         expression: /^(\*\s?){3,}$/},
        {type: 'ul',         expression: /^-+\s/},
        {type: 'ul',         expression: /^\*+\s/},
        {type: 'ol',         expression: /^(\d{0,2}|\s{0,2})\.+\s/},// for now only one level
        {type: 'table',      expression: /^\|/},
        {type: 'abbrDef',    expression: /^=:/},
        {type: 'p',          expression: /^¶\s/}
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
        lineTags:     ['h1','h2','h3','h4','h5','h6','hr'],
        titleTags:    ['abbr','em']
    };

    /**
     * analyses the line, main element and text elements
     *
     * @param  {string} line
     * @return {object} json
     */
    md.readLine = function (sLine) {
        var i, check, tag, oTemp = {}, sAbbr, aTitle, sTitle, oldTag, oldTagIndex;
        if ((check = md.expressionCheck(sLine, md.lineOptions))) {// variable declaration in if statement

            // the line starts with one of the basic options
            if (check.type === 'abbrDef') {
                aTitle = sLine.match(/{([^}]*)}/);
                sAbbr  = sLine.match(/^~:\s*([^{]*)/)[1].replace(/\s$/g,'');
                if (aTitle !== null) {
                    sTitle = aTitle[1];
                    if (md.abbreviations.abbr.indexOf(sAbbr) === -1) {
                        md.abbreviations.abbr.push(sAbbr);
                        md.abbreviations.title.push(sTitle);
                    } else {
                        md.abbreviations.title[md.abbreviations.abbr.indexOf(sAbbr)] = sTitle;
                    }
                }
                return;
            } else if (check.type === 'table') {
                var lastLine = md.aLines.length > 0 ? md.aLines[md.aLines.length - 1] : false,
                    tabled, oTh;
                tabled = sLine.split('|');
                if (lastLine && lastLine.e === 'table') {
                    if (lastLine.c[lastLine.c.length - 1].e === 'thead') {
                        for (i = 1; i < tabled.length; i = i + 1) {
                            if (i > lastLine.c[0].c[0].c.length) break;
                            if (tabled[i].length > 1 && tabled[i][0] === ':' && tabled[i][tabled[i].length - 1] === ':') {
                                lastLine.c[0].c[0].c[i - 1].a = [{class: 'textCenter'}];
                            } else if (tabled[i].length > 0 && tabled[i][0] === ':') {
                                lastLine.c[0].c[0].c[i - 1].a = [{class: 'textLeft'}];
                            } else if (tabled[i].length > 0 && tabled[i][tabled[i].length - 1] === ':') {
                                lastLine.c[0].c[0].c[i - 1].a = [{class: 'textRight'}];
                            } else {
                                lastLine.c[0].c[0].c[i - 1].a = [];
                            }
                        }
                        oTemp = {e:'tbody',c:[]};
                        lastLine.c.push(oTemp);
                        console.log(md.aLines);
                    } else {
                        oTemp = {e:'tr',c:[]};
                        for (i = 1; i < tabled.length; i = i + 1) {
                            if (i > lastLine.c[0].c[0].c.length) break;
                            oTb = {e:'td',c:md.splitInlineElement(tabled[i]),a:lastLine.c[0].c[0].c[i - 1].a};
                            oTemp.c.push(oTb);
                        }
                        lastLine.c[1].c.push(oTemp);
                    }
                } else {
                    oTemp = [];
                    for (i = 1; i < tabled.length; i = i + 1) {
                        oTh = {e:'th',c:md.splitInlineElement(tabled[i])};
                        oTemp.push(oTh);
                    }
                    oTemp  = {e:'table',c:[{e:'thead',c:[{e:'tr',c:oTemp}]}]};
                    md.aLines.push(oTemp);
                    return;
                }
                return;
            }

            oldTagIndex = md.aLines.length - 1;
            oldTag = oldTagIndex > -1 ? md.aLines[oldTagIndex].e : '';
            if (oldTag === 'undetermined') {
                md.aLines.pop();
            }

            sLine = sLine.replace(check.expression,'').replace(/^\s*/,'').replace(/\s{2,}/g,' ');
            tag   = check.type === 'h' ? check.type + (check.symbol - 1) : check.type;
            if (check.type === 'h') sLine = sLine.replace(/#*$/,'');
            if (md.lineTags.listTags.indexOf(tag) !== -1) {// ul or ol
                md.processListLine(sLine, tag, check);
            } else if (tag === 'blockquote') {
                md.processBlockquote(sLine, check);
            } else {
                oldTagIndex = md.aLines.length - 1;
                oldTag = oldTagIndex > -1 ? md.aLines[oldTagIndex].e : '';
                if (oldTag === tag) {
                    element = {e:"br",c:null};
                    md.aLines[oldTagIndex].c.push(element);
                    aTag = md.lineTags.textlessTags.indexOf(tag) !== -1 ? null : md.splitInlineElement(sLine);
                    iiLength = aTag.length;
                    for (ii = 0; ii < iiLength; ii = ii + 1){
                        md.aLines[oldTagIndex].c.push(aTag[ii]);
                    }
                } else if (tag === 'pre' && oldTag === 'ul') {
                    md.processTaglessLine(sLine);
                } else {
                    if (oldTag === 'undetermined'/* && tag === 'p'*/) {
                        md.aLines.pop();
                    }
                    oTemp = {
                        e: tag,
                        c: md.lineTags.textlessTags.indexOf(tag) !== -1 ? null : md.splitInlineElement(sLine)
                    };
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

    
    md.inlineElement = [
        {element: 'strong',  regexMatch: /([*])((?:(?!\1)[^\\]|(?:\\\\)*\\[^\\])*)\1/},
        {element: 'em',      regexMatch: /([/])((?:(?!\1)[^\\]|(?:\\\\)*\\[^\\])*)\1/},
        {element: 'b',       regexMatch: /([_])((?:(?!\1)[^\\]|(?:\\\\)*\\[^\\])*)\1/},
        {element: 'mark',    regexMatch: /([$])((?:(?!\1)[^\\]|(?:\\\\)*\\[^\\])*)\1/},
        {element: 'sup',     regexMatch: /([+])((?:(?!\1)[^\\]|(?:\\\\)*\\[^\\])*)\1/},
        {element: 'sub',     regexMatch: /([-])((?:(?!\1)[^\\]|(?:\\\\)*\\[^\\])*)\1/},
        {element: 'del',     regexMatch: /([~])((?:(?!\1)[^\\]|(?:\\\\)*\\[^\\])*)\1/},
        {element: 'abbr',    regexMatch: /([=])((?:(?!\1)[^\\]|(?:\\\\)*\\[^\\])*)\1/},
        {element: 'code',    regexMatch: /([`])((?:(?!\1)[^\\]|(?:\\\\)*\\[^\\])*)\1/},
        {element: 'small',   regexMatch: /([<])((?:(?!\1)[^\\]|(?:\\\\)*\\[^\\])*)\1/},
        {element: 'q',       regexMatch: /([>])((?:(?!\1)[^\\]|(?:\\\\)*\\[^\\])*)\1/},
        {element: 'a',       regexMatch: /\[([^\)]*)\)/, innerSplit: /\]\s?\(/},
        {element: 'img',     regexMatch: /\!\[([^\]]*)\]/},
        {element: 'iStack',  regexMatch: /\[\{([^\}\]]*)\}\]/}, // doesn't work
        {element: 'i',       regexMatch: /\{([^\}]*)\}/},
        {element: 'md-note', regexMatch: /\[([^\]]*)\]/}
    ];

    /**
     * getFirstInlineElement
     * traverses the inline elements and finds the first inline element
     *
     * @returns {object} {location:..., inlineElement: ...}
     */
    md.getFirstInlineElement = function (sLine) {
        var iLength = md.inlineElement.length, urlPattern,
            i, ii, aSplitted, oFirstSplit = {location: -1, inlineElement: {}}, oSplitted, sTempLine, aRem = [];
        urlPattern = /\b(?:(?:https?):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.‌\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[‌6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1‌,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00‌a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u‌00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?[^\.\s]/i;
        oSplitted = urlPattern.exec(sLine);
        if (oSplitted !== null && (oSplitted.index === 0 || sLine[oSplitted.index - 1] !== '(')) {
            oFirstSplit.location = oSplitted.index;
            oFirstSplit.pattern  = urlPattern;
        }
        for (i = 0; i < iLength; i = i + 1) {
            aRem      = [];
            var elMatch, innerSplit;
            elMatch = sLine.match(md.inlineElement[i].regexMatch);
            if (elMatch !== null && md.inlineElement[i].element === 'a') {
                innerSplit = elMatch[1].split(md.inlineElement[i].innerSplit);
                if (innerSplit.length === 2 && (oFirstSplit.location === -1 || oFirstSplit.location > elMatch.index)) {
                    oFirstSplit.location      = elMatch.index;
                    oFirstSplit.inlineElement = md.inlineElement[i];
                }
            } else if (elMatch !== null && (elMatch.index === 0 || elMatch.input[elMatch.index - 1]) !== '\\' && (oFirstSplit.location === -1 || oFirstSplit.location > elMatch.index)) {
                oFirstSplit.location      = elMatch.index;
                oFirstSplit.inlineElement = md.inlineElement[i];
            }
        }
        return oFirstSplit;
    };

    md.splitInlineElement = function (sLine) {
        var i, ii, aSplitted, aLine = [], aTemp, oTemp, sTemp, sAbbr, aTitle,
            oFirstSplit = md.getFirstInlineElement(sLine), aRem = [], oSplitted, sTempLine;
        if (oFirstSplit.location === -1) {
            aLine.push({e:"#text",c:md.safeEncoding(sLine)});
        } else if (typeof(oFirstSplit.pattern) !== 'undefined') {
            oSplitted = oFirstSplit.pattern.exec(sLine);
            if (oSplitted.index > 0) {
                aLine.push({e:'#text',c:md.safeEncoding(sLine.substring(0,oSplitted.index))});
            }
            aLine.push({e:'a',c:[{e:'#text',c:oSplitted[0]}],a:[{href:oSplitted[0]}]});
            sTemp = sLine.substring(oSplitted.index + oSplitted[0].length);
            if (sTemp.length > 0) {
                aTemp = md.splitInlineElement(sTemp);
                for (ii = 0; ii < aTemp.length; ii = ii + 1) {
                    aLine.push(aTemp[ii]);
                }
            }
        } else {
            var regexMatch, innerSplit;
            regexMatch = sLine.match(oFirstSplit.inlineElement.regexMatch);
            sTempLine  = sLine.substring(0,regexMatch.index);
            if (sTempLine.length > 0) aLine.push({e:"#text",c:md.safeEncoding(sTempLine)});
            if (oFirstSplit.inlineElement.element === 'a') {
                innerSplit = regexMatch[1].split(oFirstSplit.inlineElement.innerSplit);
                aTitle     = innerSplit[1].match(/"([^"]*)"/);
                aRem       = sLine.substring(regexMatch.index + regexMatch[0].length);
                oTemp      = {e:'a',a:[],c:md.splitInlineElement(innerSplit[0])};
                if (aTitle !== null) {
                    innerSplit[1] = innerSplit[1].substring(0,aTitle.index);
                    oTemp.a.push({title:aTitle[1]});
                }
                oTemp.a.unshift({href:innerSplit[1]});
            } else if (oFirstSplit.inlineElement.element === 'img') {
                var imgLength;
                console.log(regexMatch);
                aTitle = regexMatch[1].match(/"([^"]*)"/);
                aRem       = sLine.substring(regexMatch.index + regexMatch[0].length);
                oTemp      = {e:'img',a:[{class:[]}],c:null};
                if (aTitle !== null) {
                    regexMatch[1] = regexMatch[1].substring(0,aTitle.index).replace(/\s*$/,'');
                    oTemp.a.push({alt:aTitle[1]});
                }
                imgLength = regexMatch[1].length;
                if (imgLength > 4) {
                    if (regexMatch[1][0] === ':' && regexMatch[1][1] === ':') {
                        oTemp.a[0].class.push('imageCenter');
                        regexMatch[1] = regexMatch[1].substring(2);
                    } else if (regexMatch[1][0] === ':') {
						oTemp.a[0].class.push('imageLeft');
                        regexMatch[1] = regexMatch[1].substring(1);
                    } else if (regexMatch[1][0] === '-' && regexMatch[1][1] === ':') {
						oTemp.a[0].class.push('imageRight');
                        regexMatch[1] = regexMatch[1].substring(2);
                    }
                }
                oTemp.a.unshift({src:regexMatch[1]});
            } else if (oFirstSplit.inlineElement.element === 'i') {
                oTemp = {e:'i',c:'',a:[{class:regexMatch[1].split(' ')}]};
            } else if (oFirstSplit.inlineElement.element === 'md-note') {
                // notes
            } else {
                oTemp = {e:oFirstSplit.inlineElement.element,a:[]};
                if (md.lineTags.titleTags.indexOf(oFirstSplit.inlineElement.element) !== -1) {
                    aTitle = regexMatch[2].match(/"([^"]*)"/);
                    // abbreviations (once for all)
                    if (aTitle !== null) {
                        regexMatch[2] = regexMatch[2].substring(0,aTitle.index);
                        oTemp.a.push({title:aTitle[1]});
                    }
                }
                oTemp.c = md.splitInlineElement(regexMatch[2]);
                aRem    = sLine.substring(regexMatch.index + regexMatch[0].length);
            }
            aLine.push(oTemp);
            if (aRem.length > 0) {
                aTemp = md.splitInlineElement(aRem);
                for (ii = 0; ii < aTemp.length; ii = ii + 1) {
                    aLine.push(aTemp[ii]);
                }
            }
        } /*else {
            oSplitted = oFirstSplit.inlineElement.regexStart.exec(sLine);
            if (sLine[0] === '\\') sLine = sLine.substring(1);
            sTempLine = oSplitted.index === 0 && sLine[0] !== ' ' ? '' : sLine.substring(0,oSplitted.index + 1);
            aRem.push(sTempLine);
            sTempLine = oSplitted.index === 0 && sLine[0] !== ' ' ? sLine : sLine.substring(oSplitted.index + 1);
            oSplitted = oFirstSplit.inlineElement.regexEnd.exec(sTempLine);
            if (aRem[0].length > 0) aLine.push({e:"#text",c:md.safeEncoding(aRem[0])});
            aRem.push(sTempLine.substring(1,oSplitted.index + 1));
            aRem.push(sTempLine.substring(oSplitted.index + 2));
            if (oFirstSplit.inlineElement.simple) {
                oTemp = {e:oFirstSplit.inlineElement.element};
                if (md.lineTags.titleTags.indexOf(oFirstSplit.inlineElement.element) !== -1) {
                    //console.log(aRem[1], oFirstSplit);
                    aTitle   = aRem[1].match(/"([^"]*)"/);
                    aRem[1]  = aRem[1].replace(/\s?".*?"$/,'').replace(/\s+$/,'');
                    if (aTitle !== null) {
                        if (aTitle[1].length > 0) {
                            oTemp.a = [{title:aTitle[1]}];
                            if (md.abbreviations.abbr.indexOf(aRem[1]) === -1) {
                                md.abbreviations.abbr.push(aRem[1]);
                                md.abbreviations.title.push(aTitle[1]);
                            }
                        }
                    } else if (md.abbreviations.abbr.indexOf(aRem[1]) !== -1) {
                        oTemp.a = [{title:md.abbreviations.title[md.abbreviations.abbr.indexOf(aRem[1])]}];
                    }
                }
                aTemp   = md.splitInlineElement(aRem[1]);
                oTemp.c = aTemp;
            } else {
                if (oFirstSplit.inlineElement.element === 'a') {
                    console.log(aRem, sLine);
                    
                    aTemp    = aRem[1].split('](').length === 2 ? aRem[1].split('](') : aRem[1].split('] (');
                    /*
                    aTitle   = aTemp[1].match(/"([^"]*)"/);
                    aTemp[1] = aTemp[1].substring(0,aTitle.index).replace(/\s/g,'');
                    console.log(aTitle, aTemp);
                    if (aTemp[1].length === 0) {
                        // note
                        //oTemp.note = md.splitInlineElement(aTemp[0]);
                        oTemp = {e:'a',a:[{href:''}],note:md.splitInlineElement(aTemp[0])};
                        console.log(oTemp);
                        /*
                        oTemp = md.splitInlineElement(aTemp[0]);
                        console.log(oTemp);
                        oTemp[0].a = [{id:'note' + (md.notes.length + 1)}];
                        md.notes.push(oTemp);
                        oTemp = {e:'sup',c:[{e:'a',a:[{href:'#show/#note' + md.notes.length}],c:[{e:'#text',c:md.notes.length}]}]};
                        
                    } else {
                    console.log(aTemp[0]);
                    oTemp = {e:'a',a:[],c:md.splitInlineElement(aTemp[0])};
                    aTitle = aTemp[1].match(/"([^"]*)"/);
                    if (aTitle !== null) {
                        aTemp[1] = aTemp[1].substring(0,aTitle.index);
                        oTemp.a.push({title:aTitle[1]});
                    }
                    oTemp.a.unshift({href:aTemp[1]});
                    //}
                } else if (oFirstSplit.inlineElement.element === 'img') {
                    oTemp = {e:'img'};
                    oA    = [];
                    aRem[1] = aRem[1].substring(1);
                    aTitle  = aRem[1].match(/{([^}]*)}/);
                    aRem[1] = aRem[1].replace(/{.*?}$/,'').replace(/\s+$/,'');
                    oA.push({alt:''});
                    if (aTitle !== null) {
                        oA[0].alt = aTitle[1];
                    }
                    oA.push({class: []});
                    if (aRem[1].length > 2 && aRem[1][0] === ':' && aRem[1][aRem[1].length - 1] === ':') {
                        oA[1].class.push('centerImage');
                    } else if (aRem[1].length > 1 && aRem[1][0] === ':') {
                        oA[1].class.push('leftImage');
                    } else if (aRem[1].length > 1 && aRem[1][aRem[1].length - 1] === ':') {
                        oA[1].class.push('rightImage');
                    }
                    aRem[1] = aRem[1].replace(/:/g,'');
                    oA.unshift({href:aRem[1]});
                    console.log(oA);
                    oTemp.a = oA;
                } else if (oFirstSplit.inlineElement.element === 'iStack') {
                    aRem[2] = aRem[2].substring(1);
                    oTemp   = {e:'span',c:[],a:[{class:["fa-stack","fa-lg"]}]};
                    aTemp   = aRem[1].substring(1).split('}{');
                    for (i = 0; i < aTemp.length; i = i + 1) {
                        oT = {e:'i',a:[{class:md.faClass(aTemp[i], true)}],c:{'#text':null}};
                        oTemp.c.push(oT);
                    }
                } else if (oFirstSplit.inlineElement.element === 'i') {
                    oTemp = {e:'i',a:[{class:aRem[1].split(' ')}],c:{'#text':null}};
                }
            }
            aLine.push(oTemp);
            if (aRem[2].length > 0) {
                aTemp = md.splitInlineElement(aRem[2]);
                for (ii = 0; ii < aTemp.length; ii = ii + 1) {
                    aLine.push(aTemp[ii]);
                }
            }
        }*/
        return aLine;
    };

    /**
     * 
     */
    md.faClass = function (text, stack) {
        var i, aTemp, bStack = stack || false;
        aTemp = text.split(' ');
        for (i = 0; i < aTemp.length; i = i + 1) {
            if (aTemp[i].substring(0,1) !== 'fa') aTemp[i] = 'fa-' + aTemp[i];
        }
        if (aTemp.indexOf('fa') === -1) aTemp.push('fa');
        if (bStack) {
            if (aTemp.indexOf('fa-1x') !== -1) aTemp[aTemp.indexOf('fa-1x')] = 'fa-stack-1x';
            if (aTemp.indexOf('fa-2x') !== -1) aTemp[aTemp.indexOf('fa-2x')] = 'fa-stack-2x';
            if (aTemp.indexOf('fa-3x') !== -1) aTemp[aTemp.indexOf('fa-3x')] = 'fa-stack-3x';
            if (aTemp.indexOf('fa-4x') !== -1) aTemp[aTemp.indexOf('fa-4x')] = 'fa-stack-4x';
            if (aTemp.indexOf('fa-5x') !== -1) aTemp[aTemp.indexOf('fa-5x')] = 'fa-stack-5x';
        } else {
            if (aTemp.indexOf('fa-fw') === -1) aTemp.push('fa-fw');
        }
        return aTemp;
    };

    /**
     * processes a list line (ul or ol)
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
    
    md.processBlockquote = function (sLine, oCheck) {
        var i, ii, oldTag, oldTagIndex, oTemp;
        oldTagIndex = md.aLines.length - 1;
        oldTag      = oldTagIndex > -1 ? md.aLines[oldTagIndex].e : '';
        if (oldTag !== 'blockquote') {
            oTemp = {e:'blockquote',c:[]};
            oTemp.depth = 1;
            oTemp.used  = oCheck.symbol;
            oTemp.c = md.splitInlineElement(sLine).length ? md.splitInlineElement(sLine) : [{e:"#text",c:""}];
            md.aLines.push(oTemp);
        } else {
            md.loop(md.aLines[oldTagIndex], oCheck, sLine);
        }
    };

    md.loop = function (oTag, oCheck, sLine) {
        var iNewDepth = oCheck.symbol,
            oLine, oTemp;
        if (oTag.used === iNewDepth) {
            if (oCheck.type === 'blockquote') {
                //console.log('zelfde laag', oCheck);
                oLine = md.splitInlineElement(sLine).length ? md.splitInlineElement(sLine) : [{e:"#text",c:""}];
                //console.log(oTag, oLine[0]);
                md.loopBlockquote(oTag, oLine);
            } else {
                oLine = md.splitInlineElement(sLine).length ? {e:'li',c:md.splitInlineElement(sLine)} : [{e:"#text",c:""}];
                md.loopChildList(oTag, oLine);
            }
        } else if (oTag.used < iNewDepth) {
            oTag.depth++;
            oTag.used = iNewDepth;
            oLine     = md.splitInlineElement(sLine).length ? md.splitInlineElement(sLine) : [{e:"#text",c:""}];
            if (oCheck.type === 'blockquote') {
                console.log('dieper', oLine);
                oTemp = {e:'blockquote',c:oLine};
                md.loopBlockquote(oTag, oTemp);
            } else {
                oTemp     = {e:oCheck.type,c:[{e:'li',c:oLine}]};
                md.loopChildList(oTag, oTemp);
            }
        } else {
            if (oTag.depth - (oTag.used - iNewDepth) <= 1) {
                oTag.depth = 1;
                oTag.used  = oCheck.symbol;
                oLine      = md.splitInlineElement(sLine).length ? md.splitInlineElement(sLine) : [{e:"#text",c:""}];
                if (oCheck.type === 'blockquote') {
                    for (i = 0; i < oLine.length; i = i + 1) {
                        oTag.c.push(oLine[i]);
                    }
                } else {
                    oTemp      = {e:'li',c:oLine};
                    oTag.c.push(oTemp);
                }
            } else {
                oTag.depth = oTag.depth - (oTag.used - iNewDepth);
                oTag.used  = oCheck.symbol;
                oLine      = md.splitInlineElement(sLine).length ? md.splitInlineElement(sLine) : [{e:"#text",c:""}];
                if (oCheck.type === 'blockquote') {
                    for (i = 0; i < oLine.length; i = i + 1) {
                        md.loopChildListUntil(oTag, oLine[i], oTag.depth, 1);
                    }
                } else {
                    oTemp      = {e:'li',c:oLine};
                    md.loopChildListUntil(oTag, oTemp, oTag.depth, 1);
                }
            }
        }
    };

    md.loopBlockquote = function (oTemp, oLine) {
        //console.log(oTemp);
        if (oTemp.c.length > 0 && oTemp.c[oTemp.c.length - 1].e === oTemp.e) {
            console.log('tiefer');
            oTemp.c[oTemp.c.length -1] = md.loopBlockquote(oTemp.c[oTemp.c.length - 1], oLine);
        } else {
            //console.log(oTemp.c, oLine);
            //console.log(oLine);
            oTemp.c.push({e:'br',c:null});
            if (typeof(oLine.e) !== 'undefined') {
                console.log('gewoon');
                oTemp.c.push(oLine);
            } else {
                for (i = 0; i < oLine.length; i = i + 1) {
                    //console.log('array', oLine[i]);
                    oTemp.c.push(oLine[i]);
                }
            }
        }
        return oTemp;
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

    md.processTaglessLine = function (sLine) {
        var i, ii, oldTag, tag, element, aTag, iiLength, oTemp, tagLength, breakTags = ['p','ul','ol','code','blockquote'];
        i      = md.aLines.length - 1;
        // only the special lines are encapsulated in a div, thus ignored
        oldTag = i > -1 && md.aLines[i].e !== 'div' ? md.aLines[i].e : '';

        sLine  = sLine.replace(/^\s*/,'').replace(/\s{2,}/g,' ');

        // when sLine is empty and the previous tag doesn't allow for breaks, return
        if (sLine.length === 0 && breakTags.indexOf(oldTag) === -1) return;

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

        oTemp  = /^::/.exec(sLine);
        if (oTemp !== null) {
            sLine = oTemp.input.replace(/^::/,'');
            oTemp = {
                e: 'p',
                a: [{class:['capitalP']}],
                c: md.splitInlineElement(sLine)
            };
            md.aLines.push(oTemp);
        } else if (md.lineTags.lineTags.indexOf(oldTag) !== -1 || oldTag === '') {
            oTemp   = {
                e: 'p',
                c: md.splitInlineElement(sLine)
            };
            md.aLines.push(oTemp);
        } else if (md.lineTags.lineTags.indexOf(oldTag) === -1 && sLine.length > 0) {
            tag = oldTag;
            element = {e:"br",c:null};
            if (tag !== 'ul' && tag !== 'ol') {
                md.aLines[i].c.push(element);
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
                    if (aTag[ii].e === '#text' && aTag[ii].c.replace(/\s/g,'') === '\\') {
                        return;
                    }
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

    md.safeEncoding = function (text) {
        text = text.replace(/\\/g,'');
                   //.replace(/&/g,'&amp;')
                   //.replace(/</g,'&lt;');
        return text;
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
                    var att, aClass;
                    if (aJSON[i].e === 'i') {
                        att = document.createAttribute('class');
                        aClass = JSON.parse(JSON.stringify(aJSON[i].a[0].class));
                        for (ii = 0; ii < aClass.length; ii = ii + 1) {
                            aClass[ii] = aClass[ii].substring(0,1) !== 'fa' ? 'fa-' + aClass[ii] : aClass[ii];
                        }
                        if (aClass.indexOf('fa') === -1) aClass.unshift('fa');
                        if (aClass.indexOf('fa-fw') === -1) aClass.push('fa-fw');
                        att.value = aClass.join(' ');
                        tempElement.setAttributeNode(att);
                    } else if (aJSON[i].e === 'a' && aJSON[i].a[0].href === '') {
                        tempELement = document.createElement('sup');
                        subTempElement = document.createElement('a');
                        md.notes.push(aJSON[i].c);
                        console.log(md.notes);
                        subSubTempELement = document.createTextNode(md.notes.length);
                        subTempElement.appendChild(subSubTempELement);
                        
                        //att = document.createAttribute('X')
                        
                        tempElement.appendChild(subTempElement);
                        console.log(aJSON[i]);
                    } else {
                        for (var key in aJSON[i].a) {
                            var obj = aJSON[i].a[key];
                            for (var prop in obj) {
                                if(obj.hasOwnProperty(prop)) {
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
        element.style.height = md.rememberMDheight;
        /*
        element.addEventListener('keyup', function() {
            this.style.overflow = 'hidden';
            this.style.height = 0;
            this.style.height = this.scrollHeight + 'px';
            md.rememberMDheight = this.style.height;
        }, false);
        */
    };

    md.fromJsonToMd = function (beautify) {
        var i, jsonLength = md.aLines.length, mdText = '', bBeautify = beautify || true;
        if (jsonLength > 0) {
            for (i = 0; i < jsonLength; i = i + 1) {
                mdText += md.readJson(md.aLines[i]) + '\n';
            }
        } else {
            return '';
        }
        return mdText;
    };
    
    md.jsonLineElements = {
        h: {element: '#', type: 'count'},
        blockquote: {element: '>', type: 'regular'},
        pre: {element: '    ', type: 'regular'},
        hr: {element: '---', type: 'stop'},
        ul: {element: '-', type: 'list'},
        ol: {element: '.', type: 'list'},
        li: {element: '', type: 'list'},
        table: {element: '|', type: 'table'},
        p: {element: '¶', type: 'regular'}
    };
    
    md.jsonInlineElements = {
        strong: {before: '*',  after: '*'},
        em:     {before: '/',  after: '/'},
        b:      {before: '_',  after: '_'},
        mark:   {before: '$',  after: '$'},
        sup:    {before: '+',  after: '+'},
        sub:    {before: '-',  after: '-'},
        del:    {before: '~',  after: '~'},
        abbr:   {before: '=',  after: '='},
        code:   {before: '`',  after: '`'},
        q:      {before: '>',  after: '>'},
        small:  {before: '<',  after: '<'},
        a:      {before: '[',  after: ')'},
        img:    {before: '![', after: ']'},
        iStack: {before: '[{', after: '}]'},
        i:      {before: '{',  after: '}'}
    };
    
    md.readJson = function (oElement, depth) {
        var lineE   = ['h1','h2','h3','h4','h5','h6','p','hr','ul','ol','li','blockquote','pre','table'],
            inlineE = ['a','b','i','em','strong','mark','code'],
            sTemp = '', sTemp2 = '', i, oEl, iDepth, sDepth = depth || '', bBeautify = true;
        if (lineE.indexOf(oElement.e) !== -1) {
            oEl = oElement.e[0] === 'h' && oElement.e[1] !== 'r' ? md.jsonLineElements[oElement.e[0]] : md.jsonLineElements[oElement.e];
            if (oEl.type === 'count') {
                if ((oElement.e === 'h1' || oElement.e === 'h2') && bBeautify) {
                    for (i = 0; i < oElement.c.length; i = i + 1) {
                        sTemp2 += md.readJson(oElement.c[i]);
                    }
                    sTemp += sTemp2 + '\n';
                    for (i = 0; i < sTemp2.length; i = i + 1) {
                        sTemp += oElement.e === 'h1' ? '=' : '-';
                    }
                } else {
                    for (i = 0; i < oElement.e[1]; i = i + 1) {
                        sTemp += oEl.element;
                    }
                    sTemp += ' ';
                    for (i = 0; i < oElement.c.length; i = i + 1) {
                        //console.log(oElement.c[i]);
                        sTemp += md.readJson(oElement.c[i]);
                    }
                }
                sTemp += '\n';
            } else if (oEl.type === 'regular') {
                sTemp += !bBeautify && oElement.e === 'p' ? '' : oEl.element;
                if (oElement.e !== 'pre' && !(!bBeautify && oElement.e === 'p')) sTemp += ' ';
                for (i = 0; i < oElement.c.length; i = i + 1) {
                    sTemp2 = md.readJson(oElement.c[i]);
                    sTemp += sTemp2;
                    if (sTemp2 === '\n' && !(!bBeautify && oElement.e === 'p')) sTemp += oEl.element;
                    if (sTemp2 === '\n' && oElement.e !== 'pre' && !(!bBeautify && oElement.e === 'p')) sTemp += ' ';
                }
                sTemp += '\n';
            } else if (oEl.type === 'stop') {
                sTemp += bBeautify ? '* * * * *\n' : oEl.element + '\n';
            } else if (oEl.type === 'list') {
                if (oElement.e === 'ol') {
                    sTemp += oElement.a[0].start;
                    sDepth = oElement.a[0].start < 10 ? ' ' : '  ';
                    for (i = 0; i < oElement.c.length; i = i + 1) {
                        if (i > 0 && bBeautify) sTemp += sDepth;
                        sTemp += '. ' + md.readJson(oElement.c[i]) + '\n';
                    }
                } else if (oElement.e === 'ul') {
                    sDepth += '-';
                    for (i = 0; i < oElement.c.length; i = i + 1) {
                        if (oElement.c[i].e === 'ul') {
                            sTemp += md.readJson(oElement.c[i], sDepth);
                        } else {
                            sTemp += sDepth + ' ' + md.readJson(oElement.c[i], sDepth) + '\n';
                        }
                    }
                } else {
                    for (i = 0; i < oElement.c.length; i = i + 1) {
                        sTemp += md.readJson(oElement.c[i], sDepth);
                    }
                }
            }
        } else if (typeof(md.jsonInlineElements[oElement.e]) !== 'undefined') {
            oEl = md.jsonInlineElements[oElement.e];
            sTemp += oEl.before;
            if (typeof(oElement.c) !== 'undefined') {
                for (i = 0; i < oElement.c.length; i = i + 1) {
                    sTemp += md.readJson(oElement.c[i]);
                }
            }
            if (oElement.e === 'abbr' && typeof(oElement.a) !== 'undefined') {
                sTemp += '{' + oElement.a[0].title + '}';
            } else if (oElement.e === 'a') {
                sTemp += '](' + oElement.a[0].href;
            } else if (oElement.e === 'i') {
                sTemp += oElement.a[0].class.join(' ');
            } else if (oElement.e === 'img') {
                if (oElement.a[2].class[0] === 'centerImage' || oElement.a[2].class[0] === 'leftImage') {
                    sTemp += ':';
                }
                sTemp += oElement.a[0].href;
                if (oElement.a[2].class[0] === 'centerImage' || oElement.a[2].class[0] === 'rightImage') {
                    sTemp += ':';
                }
                sTemp += '{' + oElement.a[1].alt + '}';
            }
            sTemp += oEl.after;
        } else if (oElement.e === 'br') {
            sTemp += '\n';
            if (sDepth.length > 0 && bBeautify) sTemp += sDepth.replace(/-/g,' ') + ' ';
        } else {
            if (sDepth.length > 0 && oElement.c.length === 0) sTemp += '\\';
            sTemp +=  oElement.c;
        }
        return sTemp;
    };

    return md;
});
