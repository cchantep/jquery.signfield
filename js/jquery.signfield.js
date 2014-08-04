(function ($) {
    "use strict";

    var isCanvasSupported = function(){
        var e = document.createElement('canvas');
        return !!(e.getContext && e.getContext('2d'))
    },
    i18n = function(key) {
        var localized = ((typeof signField_I18N) != "object") 
            ? null : signField_I18N[key];

        return localized || ('?'+key+'?')
    };
   
    $.fn.signField = function(arg) {
        var fields = $(this);

        if (arg == "errors") {
            var errors = [];

            fields.each(function(i,e){
                var f = $(e);

                if (f.data("signature") != "yes") return true; // Skip

                // ---

                var es = f.data("errors");

                if ($.trim(es) == "") return true; // Skip

                // ---

                errors = errors.concat(es)
            });

            return errors
        }

        // ---

        // Setup
        var components = [];

        fields.each(function(i,x) {
            var e = $(x), id = e.attr("id"), 
            n = e.data("name"), cs = e.attr("class"),
            div = $('<div class="'+cs+'" id="'+id
                    + '" data-signature="yes"></div>').
                attr("data-name", n),
            canvas = (!isCanvasSupported()) ? null
                : $('<canvas></canvas>').appendTo(div),
            f = $('<input type="file" name="'+n+'-file" />').appendTo(div), 
            df = f.get(0),
            msg = $('<span class="message"></span>').appendTo(div),
            validateFile = function(f){ return true };

            if (df['files']/* has File API */) {
                try {
                    var max = parseInt(e.data("max-size"));
                    
                    validateFile = function(){
                        var sz = (df.files.length == 0) 
                            ? 0 : df.files[0].size / 1024;
                        
                        if (sz > max) {
                            var es = div.data("errors");
                            
                            div.addClass("has-error");
                            msg.text(i18n('file.error.maxSize').
                                     replace('{0}', sz).
                                     replace('{1}', max));
                            
                            if ($.trim(es) != "") {
                                div.data("errors", 
                                         es + ",file.error.maxSize")
                                
                            } else div.data("errors", "file.error.maxSize")
                        } else {
                            div.removeClass("has-error");
                            msg.text("")
                        }
                    }
                } catch (e) {}
            }
            
            if (canvas) {
                var th = e.data("pen-tickness") || 2,
                hf = $('<input type="hidden" value="" />').appendTo(div),
                dc = canvas.get(0),
                selectSketch = function(){
                    hf.attr("name", n).attr("value", dc.toDataURL());
                    f.removeAttr("name");
                    
                    var errs = "";
                    $.each(div.data('errors').split(','), function(j,er){
                        if (er && er.length > 11 &&
                            er.substring(0, 11) == "file.error.") {
                            return true; // Skip
                        }

                        if ($.trim(er) != "") errs += er
                    });

                    div.data("errors", errs);

                    if (errs == "") div.removeClass("has-error")
                },
                selectFile = function(){
                    hf.removeAttr("name");
                    f.attr("name", n);

                    validateFile()
                },
                rs = $('<input type="radio" name="' + n 
                       + '-type" value="canvas" />').change(selectSketch),
                rf = $('<input type="radio" name="' + n 
                       + '-type" value="file" />'),
                cw = canvas.width(), ch = canvas.height();

                rf.change(function(){
                    if ($.trim(f.val()) == "") { 
                        // Refuse focus if there is no selected file
                        rf.removeAttr("checked");
                        return false
                    }
                    
                    selectFile()
                });

                if (cw) canvas.attr("width", cw);
                if (ch) canvas.attr("height", ch);

                canvas.sketch({
                    'defaultColor': e.data('pen-color') || (
                        e.css('color') || "black"), 
                    'defaultSize': th
                }).on('click mousedown mouseup mousemove mouseleave mouseout touchstart touchmove touchend touchcancel', 
                  function(){ 
                    rs.trigger('click');
                    div.trigger('change')
                });

                $('<label class="radio sketch-radio">' + i18n('sketch.label') +
                  '</label>').prepend(rs).insertBefore(canvas);

                $('<a href="#clear" class="clear-canvas">' +
                  i18n('sketch.clear') + '</a>').insertBefore(canvas).
                    click(function(){
                        dc.getContext('2d').clearRect(0, 0, cw, ch);
                        canvas.sketch('actions',[]);
                        return false
                    });

                $('<label class="radio file-radio">' + i18n('file.label') +
                  '</label>').prepend(rf).insertBefore(f);
                
                f.change(function(){ rf.trigger('click') })
            } else f.attr("name", n);

            f.change(function(){ 
                validateFile();
                div.trigger('change') 
            });
            
            e.replaceWith(div);
            components.push(div.get(0));
        });

        return $(components)
    }
})(jQuery);
