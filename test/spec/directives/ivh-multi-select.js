
describe('Directive: ivhMultiSelect', function() {
  'use strict';

  beforeEach(module('ivh.multiSelect'));

  var ng = angular
    , $ = jQuery
    , scope
    , c; // compile

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();

    c = function(tpl, s) {
      s = s || scope;
      tpl = ng.isArray(tpl) ? tpl.join('\n') : tpl;
      var $el = $compile(ng.element(tpl))(s);
      s.$apply();
      return $el;
    };
  }));

  it('should create a button with text as the transcluded content', function() {
    var $el = c([
      '<div ivh-multi-select',
          'ivh-multi-select-items="[]">',
        'Blargus',
      '</div>'
    ]);

    var tText = $el.text().trim();
    expect(tText).toBe('Blargus');
  });
});
