/**
* Created with mtcmd.
* User: MtC
* Date: 2014-05-06
* Time: 08:56 PM
*/
define('mtcmd',['jquery'], function(jquery) {
    var md     = {};
    md.amd     = {};
    md.aLines  = [];
    md.listArchive = {};

    /**
     * set markdown text
     * this divides the text in lines
     *
     * @param  {string} text
     * @return {self}
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
        {type: 'hr',         expression: /^_{1,}$/},
        {type: 'ul',         expression: /^\+/},// for now only one level
        {type: 'ol',         expression: /^\d{0,2}\./},// for now only one level
    ];

    /**
     * special line options (regex expressions)
     */
    md.specialLineOptions = [
        {type: 'prezi',     expression: /^\[prezi:/},
        {type: 'youtube',   expression: /^\[youtube:/},
        {type: 'app',       expression: /^\[app:/},
        {type: 'image',     expression: /^\[image:/}
    ];

    md.expressionCheck = function (sLine, aExpressions) {
        var i, respons, regexInfo;
        for (i = 0; i < aExpressions.length; i = i + 1) {
            if (aExpressions[i].expression.exec(sLine)) {
                respons = aExpressions[i];
                regexInfo = aExpressions[i].expression.exec(sLine);
                respons.symbol = regexInfo[0].length;
                respons.info   = regexInfo;
                return respons;
            }
        }
        return false;
    };

    /**
     * html encode options (regex expressions)
     */
    md.htmlEncode = [
        {expression: /'/g, encoded: '&#039;'},
        {expression: /"/g, encoded: '&quot;'}
        //...
    ];

    md.htmlDecode = [
        {expression: /&#039;/g, encoded: "'"},
        {expression: /&quot;/g, encoded: '"'}
    ];

    md.htmlEncoder = function (sLine, coder) {
        var i, options = typeof(coder) !== 'undefined' && coder === 'decode' ? md.htmlDecode : md.htmlEncode;
        for (i = 0; i < options.length; i = i + 1) {
            sLine = sLine.replace(options[i].expression, options[i].encoded);
        }
        return sLine;
    };

    md.lineTags = {
        listTags:     ['ul','ol'],
        textlessTags: ['hr'],
        lineTags:     ['h1','h2','h3','h4','h5','h6','hr']
    };

    /**
     * analyse the line, main element and text elements
     *
     * @param  {string} line
     * @return {object} json
     */
    md.readLine = function (sLine) {
        //line = line.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        var i, check, tag, oTemp = {};
        if ((check = md.expressionCheck(sLine, md.lineOptions))) {// variable declaration in if statement
            sLine = sLine.replace(check.expression,'').replace(/^\s*/,'').replace(/\s{2,}/g,' ');
            tag   = check.type === 'h' ? check.type + check.symbol : check.type;
            if (md.lineTags.listTags.indexOf(tag) !== -1) {// ul or ol
                md.processListLine(sLine, tag, check);
            } else {
                oldTagIndex = md.aLines.length - 1;
                oldTag = oldTagIndex > -1 ? md.aLines[oldTagIndex].element : '';
                if (oldTag === tag) {
                    element = {element:"br",content:null};
                    md.aLines[oldTagIndex].content.push(element);
                    aTag = md.lineTags.textlessTags.indexOf(tag) !== -1 ? null : md.traverseLine(sLine);
                    iiLength = aTag.length;
                    for (ii = 0; ii < iiLength; ii = ii + 1){
                        md.aLines[oldTagIndex].content.push(aTag[ii]);
                    }
                } else {
                    oTemp = {
                        element: tag,
                        content: md.lineTags.textlessTags.indexOf(tag) !== -1 ? null :
                            md.traverseLine(sLine)
                    };
                    md.aLines.push(oTemp);
                }
            }
        } else if ((check = md.expressionCheck(sLine, md.specialLineOptions))) {// variable declaration in if statement
            console.log(check);
        } else {
            md.processTaglessLine(sLine);
        }
    };

    md.processListLine = function (sLine, sTag, oCheck) {
        var i, ii, oldTag, oldTagIndex, oTemp,
            li = {element: 'li', content: []},
            options = {
                ul: {element: 'ul', content: []},
                ol: {element: 'ol', content: []}
            };
        console.log(oCheck);
        oldTagIndex = md.aLines.length - 1;
        oldTag      = oldTagIndex > -1 ? md.aLines[oldTagIndex].element : '';
        if (oldTag !== sTag) {
            oTemp = options[sTag];
            if (sTag === 'ol') {
                oTemp.start = parseInt(oCheck.info[0].replace('.',''), 10);
                oTemp.start = isNaN(oTemp.start) ? 1 : oTemp.start;
            }
            console.log(oTemp);
            //oTemp.depth = oCheck.symbol;
            oTemp.content.push(li);
            oTemp.content[0].content = md.traverseLine(sLine).length ? md.traverseLine(sLine) : [{element:"#text",content:""}];
            //console.log(oTemp);
            md.aLines.push(oTemp);
        } else {
            //console.log(md.aLines[oldTagIndex], md.traverseLine(sLine));
            md.loopList(md.aLines[oldTagIndex], oCheck.symbol, md.traverseLine(sLine));
        }
        //console.log(sTag, sLine);
    };
    
    md.loopList = function (oList, iDepth, oLine, iCounter) {
        var iCounter = iCounter || 0;
        console.log(oList.content);
        console.log(oLine);
        //console.log(iDepth);
        //console.log(oLine);
        //console.log(iCounter);
        oTemp = {
            element: 'li',
            content: oLine
        };
        console.log(oTemp);
        oList.content.push(oTemp);
        console.log(oList);
    }

    md.processTaglessLine = function (sLine) {
        var i, ii, oldTag, tag, element, aTag, iiLength, oTemp, tagLength;
        i      = md.aLines.length - 1;
        oldTag = i > -1 ? md.aLines[i].element : '';
        sLine  = sLine.replace(/^\s*/,'').replace(/\s{2,}/g,' ');

        if (oldTag === 'undetermined') {

            // last line was empty, that line must be removed, this line will be new 'p'
            oldTag = '';
            md.aLines.pop();

        } else if (oldTag === 'p' && md.aLines[i].content.length === 1 && /^={1,}$/.exec(sLine) !== null) {

            // cosmetic h1-version, last line must be 'h1', this line should be discarded
            md.aLines[i].element = 'h1';
            return;

        } else if (oldTag === 'p' && md.aLines[i].content.length === 1 && /^-{1,}$/.exec(sLine) !== null) {

            // cosmetic h2-version, last line must be 'h2', this line should be discarded
            md.aLines[i].element = 'h2';
            return;

        }
        if (md.lineTags.lineTags.indexOf(oldTag) !== -1 || oldTag === '') {
            oTemp   = {
                element: 'p',
                content: md.traverseLine(sLine)
            };
            md.aLines.push(oTemp);
        } else if (md.lineTags.lineTags.indexOf(oldTag) === -1 && sLine.length > 0) {
            tag = oldTag;
            element = {element:"br",content:null};
            if (tag !== 'ul' && tag !== 'ol') {
                md.aLines[i].content.push(element);
                aTag = md.lineTags.textlessTags.indexOf(tag) !== -1 ? null : md.traverseLine(sLine);
                iiLength = aTag.length;
                for (ii = 0; ii < iiLength; ii = ii + 1){
                    md.aLines[i].content.push(aTag[ii]);
                }
            } else {
                tagLength = md.aLines[i].content.length - 1;
                md.aLines[i].content[tagLength].content.push(element);
                aTag = md.lineTags.textlessTags.indexOf(tag) !== -1 ? null : md.traverseLine(sLine);
                iiLength = aTag.length;
                for (ii = 0; ii < iiLength; ii = ii + 1){
                    md.aLines[i].content[tagLength].content.push(aTag[ii]);
                }
            }
        } else {
            oTemp = {
                element: 'undetermined',
                content: null
            };
            md.aLines.push(oTemp);
        }
        iiLength = md.aLines.length - 1;
        if (iiLength > -1 &&
            typeof(md.aLines[iiLength].content) !== 'undefined' &&
            md.aLines[iiLength].content !== null &&
            md.aLines[iiLength].content.length > 0 &&
            md.aLines[iiLength].content[0].element === 'br') {
            md.aLines[iiLength].content.shift();
        }
    };

    /**
     * standard inline options
     */
    md.inlineOptions = [
        {name: 'em',     expression: '//'},
        {name: 'mark',   expression: '__'},
        {name: 'strong', expression: '**'},
        {name: 'sup',    expression: '^^'},
        {name: 'sub',    expression: '--'},
        {name: 'abbr',   expression: '~~'},
        {name: 'code',   expression: '``'},
        {name: 'small',  expression: '<<'}
    ];

    /**
     * find the first inline option
     * element
     *
     * @param {string}  line to check
     * @return {object} name, expression
     */
    md.getFirstElement = function (sLine) {
        var aSplitted, i, oFirstElement = {location: -1};
        for (i = 0; i < md.inlineOptions.length; i = i + 1) {
            aSplitted = sLine.split(md.inlineOptions[i].expression);
            if (aSplitted.length > 2 &&
                (oFirstElement.location === -1 || aSplitted[0].length < oFirstElement.location)) {
                oFirstElement = {
                    location:   aSplitted[0].length,
                    element:    md.inlineOptions[i].name,
                    expression: md.inlineOptions[i].expression
                };
            }
        }
        return oFirstElement;
    };

    /**
     * traverse line in text and option elements
     *
     * @param {string} line to traverse
     * @return {array} traversed line
     */
    md.traverseLine = function (sLine) {
        var aTempLine, oSplitter, oTemp, sSubLine, iSubLineLength = 4, aLine = [];
        oSplitter = md.getFirstElement(sLine);
        if (oSplitter.location === -1) {
            if (sLine.length > 0) aLine.push({element:"#text",content:sLine});
        } else {
            aTempLine = sLine.split(oSplitter.expression);

            // first part (text or empty)
            sSubLine   = aTempLine.shift();
            iSubLineLength += sSubLine.length;
            if (sSubLine.length > 0) aLine.push({element:"#text",content:sSubLine});

            // second part (element, text or subElement)
            sSubLine   = aTempLine.shift();
            iSubLineLength += sSubLine.length;
            oTemp     = {
                element:oSplitter.element,
                content:md.traverseLine(sSubLine)
            };
            aLine.push(oTemp);

            // third part (reloop)
            sSubLine = sLine.substring(iSubLineLength);
            oSplitter = md.getFirstElement(sSubLine);
            if (oSplitter.location === -1) {
                if (sSubLine.length > 0) aLine.push({element:"#text",content:sSubLine});
            } else {
                aTempLine = md.traverseLine(sSubLine);
                for (i = 0; i < aTempLine.length; i = i + 1) {
                    aLine.push(aTempLine[i]);
                }
            }
        }
        return aLine;
    };

    /**
     * getHTML parses a JSON array to HTML
     *
     * @param  {object}     json object
     * @return {string}     HTML string
     */
    md.getHTML = function (aJSON) {
        var iLength = aJSON === null ? 0 : aJSON.length,
            oHTML = document.createElement('div'),
            listOptions = ['ol','ul'],
            tempElement = {}, tempContent, subTempElement,
            i, ii;
        if (iLength === 0) return '';
        for (i = 0; i < iLength; i = i + 1) {
            if (!aJSON[i].content && aJSON[i].element !== "#text") {
                tempElement = document.createElement(aJSON[i].element);
            } else if (listOptions.indexOf(aJSON[i].element) !== -1) {
                tempElement = md.traverseList(aJSON[i]);
            } else {
                if (aJSON[i].element !== '#text') {
                    tempElement = document.createElement(aJSON[i].element);
                    for (ii = 0; ii < aJSON[i].content.length; ii = ii + 1) {
                        if (aJSON[i].content[ii].element === '#text') {
                            tempContent = document.createTextNode(aJSON[i].content[ii].content);
                            tempElement.appendChild(tempContent);
                        } else {
                            subTempElement = document.createElement(aJSON[i].content[ii].element);
                            subTempElement.innerHTML = md.getHTML(aJSON[i].content[ii].content);
                            tempElement.appendChild(subTempElement);
                        }
                        oHTML.appendChild(tempElement);
                    }
                } else {
                    tempElement = document.createTextNode(aJSON[i].content);
                }
            }
            if (tempElement !== null) oHTML.appendChild(tempElement);
        }
        //console.log(oHTML);
        return oHTML.innerHTML;
    };

    md.traverseList = function (aList) {
        var i, iLength, oTemp, parentElement, options = ['ol','ul','li'];
        parentElement = document.createElement(aList.element);
        if (aList.element === 'ol') {
            console.log(aList.start);
            var att = document.createAttribute('start');
            att.value = aList.start;
            parentElement.setAttributeNode(att);
        }
        iLength       = aList.content.length;
        for (i = 0; i < iLength; i = i + 1) {
            if (options.indexOf(aList.content[i].element) !== -1) {
                parentElement.appendChild(md.traverseList(aList.content[i]));
            } else {
                tada = aList.content;
                tidi = md.getHTML(tada);
                //console.log(tidi);
                parentElement.innerHTML = tidi;
            }
        }
        return parentElement;
    };

    /**
     * temp return JSON
     */
    md.getJSON = function () {
        $('#showMd').html(md.getHTML(md.aLines));
        $('#showJson').text(JSON.stringify(md.aLines));
        return this;
    };

    return md;
});