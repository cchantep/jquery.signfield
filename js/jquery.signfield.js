(function ($) {
    "use strict";

    var markr = $.sketch.tools['marker'], 
    _draw = markr.draw;

    markr.draw = function(d){ // Extends marker action
        var i, filtered = [], e, c = this.canvas;

        for (i = 0; i < d.events.length; i++) {
            e = d.events[i];

            if (e._type != "drawImage") { filtered.push(e); continue }

            // ---

            this.context.drawImage(e.image, 0, 0);

            

            setTimeout(function(){
                c.trigger('change')
                // see canvas.sketch(...).on("change ...") thereafter
            }, 1000)
        }

        ({ context: this.context, draw: _draw }).draw(d)
    };

    var isCanvasSupported = function(){
        var e = document.createElement('canvas');
        return !!(e.getContext && e.getContext('2d'))
    },
    i18n = function(key) {
        var localized = ((typeof signField_I18N) != "object") 
            ? null : signField_I18N[key];

        return localized || ('?'+key+'?')
    },
    addError = function(field, key, msg) {
        var es = field.data("errors");

        if (!field.hasClass("has-error")) field.addClass("has-error");

        $(".message", field).text(msg);
        
        if ($.trim(es) != "") {
            field.data("errors", es + ',' + key)
        } else field.data("errors", key);

        return field
    },
    load = function(canvas, url) {
        var img = new Image();

        $(img).load(function(){
            var actions = canvas.sketch().actions;
            actions.push({
                'tool': "marker",
                'events': [{'_type':"drawImage", 'image':this}]
            });
                  
            canvas.sketch('actions', actions);
            canvas.sketch('redraw')
        }).attr("src", _sample);
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

        if (arg == "filename") {
            var f = $('input[type="file"]', this).first();

            if (f.length == 0) return null;

            return f.val()
        }

        var args = arguments;

        if (arg == "imagedata" && args && args.length >= 2) {
            return $(this).each(function(i, e){ 
                load($('canvas', e), args[1]) 
            })
        }

        if (arg == "imagedata") {
            var c = $('.imgdata', this).first();

            if (c.length == 0) return null;

            return c.val()
        }

        if (arg == "selectiontype") {
            var r = $('input[type="radio"]:checked').first();

            if (r.length == 0) return null;

            return r.val()
        }

        if (args && args.length >= 2) { // Actions
            var action = args[0];

            if (action == "addError" && args.length >= 3) {
                var div = $(this).first();

                if (div.length != 1) return div;

                // ---

                return addError(div, args[1], args[2])
            }

            return fields
        }

        // ---

        // Setup
        var components = [];

        fields.each(function(i,x) {
            var e = $(x), id = e.attr("id"), 
            n = e.data("name"), cs = e.attr("class"),
            div = $('<div class="'+cs+'" id="'+id
                    + '" data-signature="yes"></div>'),
            canvas = (!isCanvasSupported()) ? null
                : $('<canvas></canvas>').appendTo(div),
            f = $('<input type="file" name="'+n+'-file" />').appendTo(div), 
            df = f.get(0),
            msg = $('<span class="message"></span>').appendTo(div),
            rule = $('<div style="width:1in;height:1px"></div>').appendTo(div),
            dpi = $('<input type="hidden" />').appendTo(div),
            validateFile = function(f){ return true };

            if (df['files']/* has File API */) {
                try {
                    var max = parseInt(e.data("max-size"));
                    
                    validateFile = function(){
                        var sz = (df.files.length == 0) 
                            ? 0 : df.files[0].size / 1024;
                        
                        if (sz > max) {
                            addError(div, "file.error.maxSize",
                                     i18n('file.error.maxSize').
                                     replace('{0}', sz).
                                     replace('{1}', max))

                        } else {
                            div.removeClass("has-error");
                            msg.text("")
                        }
                    }
                } catch (e) {}
            }
            
            if (canvas) {
                var th = e.data("pen-tickness") || 2,
                hf = $('<input type="hidden" class="imgdata" value="" />').
                    appendTo(div),
                dc = canvas.get(0),
                w = e.data("width"), h = e.data("height"),
                selectSketch = function(){
                    hf.attr("name", n).val(dc.toDataURL());
                    f.removeAttr("name");
                    dpi.attr("name", n+"-dpi");

                    var errs = "", es = div.data('errors');
                    if ($.trim(es) != "") {
                        $.each(es.split(','), function(j,er){
                            if (er && er.length > 11 &&
                                er.substring(0, 11) == "file.error.") {
                                return true; // Skip
                            }
                            
                            if ($.trim(er) != "") errs += er
                        })
                    }

                    div.data("errors", errs);

                    if (errs == "") div.removeClass("has-error")
                },
                selectFile = function(){
                    hf.removeAttr("name");
                    f.attr("name", n);
                    dpi.attr("name", "");

                    validateFile()
                },
                rs = $('<input type="radio" name="' + n 
                       + '-type" value="canvas" />').click(selectSketch),
                rf = $('<input type="radio" name="' + n 
                       + '-type" value="file" />'),
                cw = w || canvas.width(), ch = h || canvas.height();

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
                }).on('change click mousedown mouseup touchstart touchmove touchend touchcancel', function(){ 
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

            dpi.val(rule.width()); // after 'div' displayed
            rule.remove();
            
            components.push(div.get(0))
        });

        return $(components)
    }
})(jQuery);
