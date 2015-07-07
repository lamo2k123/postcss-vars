var postcss = require('postcss');

var Vars = function(options) {
    if(!(this instanceof Vars)) {
        return new Vars(options);
    }

    options = options || {};
    this.vars = options.variables || {};

    return this.initializer.bind(this);
};

Vars.prototype.initializer = function(css, result) {
    css.eachAtRule(/\S+:/g, this._garbageVars.bind(this, css));

    for(var key in this.vars) {
        if(this.vars.hasOwnProperty(key)) {
            var re = new RegExp('\\B@{?' + key + '}?|@{' + key + '}', 'g');
            css.replaceValues(re, function(string) {
                return this.vars[key];
            }.bind(this));
        }
    }
};

Vars.prototype._garbageVars = function(css, rule) {
    if(rule && rule.name && rule.params) {
        this.set(rule.name, rule.params);
        css.remove(rule);
    }
};

Vars.prototype.set = function(key, value) {
    if(!this.vars) {
        this.vars = {};
    }

    if(typeof key === 'string' && typeof value === 'string') {
        key = key.slice(0, key.length - 1);

        this.vars[key] = value;
    }
};

module.exports = postcss.plugin('postcss-less-vars', Vars);