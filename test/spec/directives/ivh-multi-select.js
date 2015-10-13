
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

  it('Its watcher count should be invariant in the number of list items while collapsed', function() {
    scope.items1 = [{label: 'foo'}];
    scope.items2 = [{label: 'foo'}, {label: 'bar'}, {label: 'wowza'}];

    var $el1 = c([
      '<div ivh-multi-select',
          'ivh-multi-select-items="items1">',
        'Blargus',
      '</div>'
    ]);

    var $el2 = c([
      '<div ivh-multi-select',
          'ivh-multi-select-items="items2">',
        'Blargus',
      '</div>'
    ]);

    var numWatchers1 = countWacthers($el1);
    var numWatchers2 = countWacthers($el2);

    expect(numWatchers1).toBe(numWatchers2);
  });

  it('should display items when the button is clicked', function() {
    scope.items = [{label: 'foo'}];

    var $el = c([
      '<div ivh-multi-select',
          'ivh-multi-select-items="items">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();

    var liText = $el.find('li.ms-item').first().text().trim();

    expect(liText).toBe('foo');
  });
});
