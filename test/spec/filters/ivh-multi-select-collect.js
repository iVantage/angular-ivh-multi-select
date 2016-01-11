
describe('Filter: ivhMultiSelectCollect', function() {
  'use strict';

  beforeEach(module('ivh.multiSelect'));

  var collect;

  beforeEach(inject(function(ivhMultiSelectCollectFilter) {
    collect = ivhMultiSelectCollectFilter;
  }));

  it('should gather collect selected item ids', function() {
    var list = []
      , item = {selected: true, id: 'foo'};
    collect(list, item);
    expect(list.length).toBe(1);
    expect(list[0]).toBe('foo');
  });

  it('should remove deselected item ids', function() {
    var list = ['foo', 'bar']
      , item = {selected: false, id: 'foo'};
    collect(list, item);
    expect(list.length).toBe(1);
    expect(list[0]).toBe('bar');
  });
});

