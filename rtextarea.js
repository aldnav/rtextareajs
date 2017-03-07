/**
 * Simple wrapper to turn contenteditable div to RTE-like widget.
 * With emojione plugin enabled.
 */

;(function($,  undefined) {

    var plugins = {
        'emoji': emojiPlugin
    }
    var caretObj;

    /**
     * Initialize the RTE application
     * @param  {String|ZeptoObject} el The wrapper div for this RTE application
     */
    function init(el) {
        if (typeof el === 'string')
            el = $(el);
        var ed = Mustache.render($('#r-editor-template').html(), {});
        el.append(ed);
    }

    /**
     * Binds action for RTE application
     * @param  {ZeptoObject} el The RTE application wrapper
     */
    function bindActions(el) {
        if (typeof el === 'string')
            el = $(el);
        var editor = el.find('.r-editor');

        // Always keep track of the current caret position of the editor
        editor.bind('keyup click', function() {
            caretObj = getCaretPosition(editor[0]);
        });

        // Select a plugin and apply
        el.on('click', '.r-editor-plugins-option', function(e) {
            e.preventDefault();
            var pluginToUse = $(this).data('plugin');
            if (typeof plugins[pluginToUse] === 'function')
                plugins[pluginToUse].apply({},[el]);
        });
    }

    /**
     * PLUGIN: EMOJI PLUGIN
     * Handles emoji application
     * @param  {ZeptoObject} el The RTE application wrapper
     */
    function emojiPlugin(el) {
        var pl = el.find('.r-editor-plugins');
        var plx = el.find('.r-editor-plugins-extra');
        var editor = el.find('.r-editor');
        // Toggle display of editor plugins extra
        var extraHidden = plx.hasClass('hidden');
        var enabled = false;
        if (!extraHidden) {
            plx.addClass('hidden');
            plx.empty();
            pl.removeClass('r-editor-plugins-reveal');
        } else {
            plx.removeClass('hidden');
            pl.addClass('r-editor-plugins-reveal');
            enabled = true;
        }
        // Append the plugin's display of emojis
        if (!enabled) {
            return true;
        }
        var pluginTemplate = Mustache.render($('#emoji-plugin-template').html(), {});
        plx.append(pluginTemplate);

        /*** Bind emoji actions ***/

        plx.find('.emoji-list').on('click', '[class*=emojione-]', function(e) {
            e.preventDefault();
            var shortname = $(this).data('shortname');
            var emojiImgDiv = emojione.shortnameToImage(shortname);
            if (caretObj) {
                restoreSelection(caretObj);
                pasteHtmlAtCaret(emojiImgDiv);
                caretObj = getCaretPosition(editor[0]);
            }
            return false;
        });


        /**
         * Paste html content at caret position
         * @param  {DOMObject} html HTML to be pasted
         * @see http://stackoverflow.com/a/6691294
         */
        function pasteHtmlAtCaret(html) {
            var sel, range;
            if (window.getSelection) {
                // IE9 and non-IE
                sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.deleteContents();

                    // Range.createContextualFragment() would be useful here but is
                    // non-standard and not supported in all browsers (IE9, for one)
                    var el = document.createElement("div");
                    el.innerHTML = html;
                    var frag = document.createDocumentFragment(), node, lastNode;
                    while ( (node = el.firstChild) ) {
                        lastNode = frag.appendChild(node);
                    }
                    range.insertNode(frag);

                    // Preserve the selection
                    if (lastNode) {
                        range = range.cloneRange();
                        range.setStartAfter(lastNode);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
            } else if (document.selection && document.selection.type != "Control") {
                // IE < 9
                document.selection.createRange().pasteHTML(html);
            }
        }
    }

    /**
     * Gets the caret position of the editable div
     * @param  {DOMElement} editableDiv [description]
     * @return {Object} Range object
     * @see http://zurb.com/forrst/posts/Tracking_the_caret_position_in_a_contenteditable-P4l
     */
    function getCaretPosition(editableDiv) {
        var caretPos = 0, containerEl = null, sel, range;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                range = sel.getRangeAt(0);
                if (range.commonAncestorContainer.parentNode == editableDiv) {
                    caretPos = range.endOffset;
                }
            }
        } else if (document.selection && document.selection.createRange) {
            range = document.selection.createRange();
            if (range.parentElement() == editableDiv) {
                var tempEl = document.createElement("span");
                editableDiv.insertBefore(tempEl, editableDiv.firstChild);
                var tempRange = range.duplicate();
                tempRange.moveToElementText(tempEl);
                tempRange.setEndPoint("EndToEnd", range);
                caretPos = tempRange.text.length;
            }
        }
        return range;
    }

    /**
     * Restore caret position selection
     * @param  {Object} range Range object previously saved
     * @see http://stackoverflow.com/a/2925633
     */
    function restoreSelection(range) {
        if (range) {
            if (window.getSelection) {
                sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            } else if (document.selection && range.select) {
                range.select();
            }
        }
    }

    $.fn.rtextarea = function() {
        init(this);
        bindActions(this);
    }

    $.fn.rtextToPlainText = function() {
        var bodyText = $(this).find('.r-editor').clone();
        $.each(bodyText.find('.emojione'), function (k, v) {
            var alt = $(v).attr('alt');
            $(v).replaceWith(alt);
        });
        return bodyText.text().trim();
    }

})(Zepto)


$('.rtextarea-container').rtextarea();
// $('.rtextarea-container').rtextToPlainText();
