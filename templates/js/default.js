var CTRL_KEY = '⌃';
var META_KEY = '⌘';
var ALT_KEY = '⎇';
var SHIFT_KEY = '⇧';
var SPLITER = '';
var ENTER_KEY = '⏎'
var BACKSPACE_KEY = '⌫'

function change_os(os, callback) {
    if (os == 'macos') {
        CTRL_KEY = '⌃';
        META_KEY = '⌘';
        ALT_KEY = '⎇';
        SHIFT_KEY = '⇧';
        ENTER_KEY = '⏎'
        SPLITER = ''
        BACKSPACE_KEY = '⌫'
    } else {
        BACKSPACE_KEY = 'Backspace'
        CTRL_KEY = 'Ctrl';
        META_KEY = 'Windows';
        ALT_KEY = 'Alt';
        SHIFT_KEY = 'Shift';
        ENTER_KEY = 'Enter';
        SPLITER = '+';
    }
    if(callback) {
        callback.call(this)
    }
}

$.prototype.bindkeys = function(callback){
    this.keydown(function(e) {
        var keys = ""
        if (e.ctrlKey) {
            keys += SPLITER + CTRL_KEY;
        }
        if (e.altKey) {
            keys += SPLITER + ALT_KEY;
        }
        if (e.shiftKey) {
            keys += SPLITER + SHIFT_KEY;
        }
        if (e.metaKey) {
            keys += SPLITER + META_KEY;
        }
        var code = e.originalEvent.code;
        var key = e.key;
        if (!(key == 'Meta' || key == 'Control' || key == 'Shift' || key == 'Alt')) {
            var real_key = code;
            if(/^Key/.test(code)){
                real_key = key.toUpperCase();
            }
            switch(real_key){
                case 'SLASH':
                    real_key = '/';
                    break;
                case 'Enter':
                    real_key = ENTER_KEY;
                    break;
                case 'Backspace':
                    real_key = BACKSPACE_KEY;
                    break;
            }
            keys += SPLITER + real_key;
            keys = keys.substring(keys.indexOf(SPLITER) + SPLITER.length)
            callback.call(this, keys)
        }
    });
    return this;
}