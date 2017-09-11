/**
 * copyright @Lloyd Zhou(lloydzhou@qq.com)
 */
(function(exports){

    exports.Template = function(){
        var FN = {}, replace_templae = {"\\": "\\\\", "\n": "\\n", "\r": "\\r",
            "{{": "');cb(", "}}": ");cb('", "{%": "');", "%}": "\ncb('"}

        return function(tmpl, data, cb) {
            FN[tmpl = tmpl || ''] = FN[tmpl] || new Function("_", "cb", "with(_){" +
                ("%}" + tmpl + "{%").replace(/([\\\n\r]|{{|}}|{%|%})/g, function(tag) {
                  return replace_templae[tag]
                }) + "}return cb")

            try{
                return data ? FN[tmpl](data, cb) : FN[tmpl];
            }catch(e){
                return e;
            }
        };
    }

    exports.StringBuffer = function(){
        var data = [], callback = function(s){data.push(s)};
        callback.toString = function(){return data.join('')}
        return callback
    }

    exports.Component = function(root, tmpl, state, callbacks){
        var template = new tplite.Template();
        var compile = template(tmpl);
        var componet = {
          state: state, render: render, setState: setState, trigger: trigger
        };
        function trigger (name){
          var args = [].slice.call(arguments, 1)
          return !callbacks[name] || (typeof callbacks[name] == 'function' && callbacks[name].apply(componet, args))
        }
        function setState (newState){
          state = Object.assign({}, state||{}, newState||{});
          if (trigger('shouldUpdate')){
            render()
            requestAnimationFrame(function(){
              trigger('update')
            })
          }
          return state;
        }
        function render (){
          var out = new tplite.StringBuffer()
          compile(state, out);
          if (root){
            return root.innerHTML = out.toString();
          }
          return out.toString()
        }
        setState({
          callback: function(name) {
            var cbname = Math.random().toString().replace('0.', '__')
            var args = [].slice.call(arguments, 1)
            exports[cbname] = function(e){
              return typeof callbacks[name] == 'function' && callbacks[name].apply(componet, args.concat(e))
            }
            return 'tplite.' + cbname + '(event)'
          }
        })
        trigger('init')
        return componet;
    }

}(typeof exports === 'undefined' ? this.tplite || (this.tplite = {}) : exports));

