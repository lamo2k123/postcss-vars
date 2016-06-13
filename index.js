var postcss = require('postcss');

var Vars = function(options) {
    this.options = options || {};
    this.vars = {};
};

Vars.prototype.inputVars = function() {
    var vars = this.options.only || this.options.variables || {};

    Object.keys(vars).forEach(function(key) {
        this.set(key, vars[key]);
    }, this);
};

Vars.prototype.process = function(css) {
    css.walk(this.grabVars.bind(this));
};

Vars.prototype.grabVars = function(node) {

    switch(node.type) {
        case 'atrule':
            this.replace(node, 'params');

            if(!this.options.only) {
                if(/\S+:/g.test(node.name)) {
                    node.remove();
                    node.name = node.name.slice(0, -1);
                    this.set(node.name, node.params);
                }
            }

            break;

        case 'decl':
            this.replace(node, 'value');

            break;
    }

};

Vars.prototype.get = function(name) {
    return typeof this.vars[name] !== 'undefined' ? this.vars[name] : name;
};

Vars.prototype.set = function(name, value) {
    if(typeof name === 'string') {
        this.vars['@{' + name + '}'] = this.vars['@' + name] = this.vars[name] = value;
    }
};

Vars.prototype.replace = function(node, key) {
    if(node && typeof key === 'string') {
        var value = node[key],
            vars = value.match(/(@{?[a-z0-9-_.]+}?)/g);

        if(vars) {
            vars.forEach(function(item) {
                node[key] = node[key].replace(item, this.get(item));

                if(/@(?:@)/g.test(value)) {
                    node[key] = node[key].replace(/\B(?=@)?["']|["']\B/g, '');
                }

                if(!this.options.only) {
                    this.replace(node, key);
                }
            }, this);
        }
    }
};

module.exports = postcss.plugin('postcss-less-vars', function (options) {
    var vars = new Vars(options);
    vars.inputVars();
    return function (css) {
        vars.process(css);
    };
});
