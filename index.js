var postcss = require('postcss');

var Vars = function(options) {
    if(!(this instanceof Vars)) {
        return new Vars(options);
    }
    this.options = options || {};
    this.vars = this.options.only || this.options.variables || {};
    //console.log(options, this.vars);
    return this.initializer.bind(this);
};

Vars.prototype.initializer = function(css, result) {
    css.eachInside(this._garbageVars.bind(this, css));

/*    for(var key in this.vars) {
        if(this.vars.hasOwnProperty(key)) {
            var re = new RegExp('\\B@{?' + key + '}?|@{' + key + '}', 'g');
            css.replaceValues(re, function(string) {
                return this.vars[key];
            }.bind(this));
        }
    }*/
};

Vars.prototype._garbageVars = function(css, node) {
    var store = null;

    switch(node.type) {
        case 'atrule':
            store = 'params';
            break;
        case 'decl':
            store = 'value';
            break;
    }

    if(store) {
        var re      = new RegExp('\\B@{?\\S+}?|@{\\S+}', 'g'),
            vars    = node[store].match(re);

        if(vars && vars.length) {
            for(var i in vars) {
                if(vars.hasOwnProperty(i)) {
                    var key = vars[i].substring(1);

                    if(typeof this.vars[key] !== 'undefined') {
                        node[store] = node[store].replace(vars[i], this.vars[key]);
                    }
                }
            }
        }
    }

    if(node.type === 'atrule' && /\S+:/g.test(node.name) && node.params) {
        if(!this.options.only) {
            this.set(node.name, node.params);

            node.parent.remove(node);
        }

    } else if(node.type === 'decl') {

    }

};

Vars.prototype.set = function(key, value) {
    if(typeof key === 'string' && typeof value === 'string') {
        key = key.slice(0, key.length - 1);

        this.vars[key] = value;
    }
};

module.exports = postcss.plugin('postcss-less-vars', Vars);