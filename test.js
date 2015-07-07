var fs      = require('fs'),
    postcss = require('postcss'),
    expect  = require('chai').expect,
    plugin  = require('./');

var test = function(input, output, options) {
    expect(postcss(plugin(options)).process(input).css).to.eql(output);
};

describe('postcss-less-vars', function () {

    var lists = fs.readdirSync('./test');

    for(var i in lists) {
        if(lists.hasOwnProperty(i)) {
            var manifest= require('./test/' + lists[i] + '/manifest.json'),
                input   = fs.readFileSync('./test/' + lists[i] + '/input.less'),
                output  = fs.readFileSync('./test/' + lists[i] + '/output.less');

            input = input.toString();
            output = output.toString();

            (function(input, output, manifest) {
                it(manifest.name, function () {
                    test(input, output, manifest.options);
                });
            })(input, output, manifest)

        }
    }
});
