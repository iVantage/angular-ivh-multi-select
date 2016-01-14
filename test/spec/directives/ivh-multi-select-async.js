
describe('Directive: ivhMultiSelectAsync', function() {
  'use strict';

  beforeEach(module('ivh.multiSelect'));
  beforeEach(module('ivh.pager'));

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

  it('should fetch items when the button is clicked', function() {
    var spy = scope.fetcher = jasmine.createSpy('fetcher').and.returnValue({
      page: 0,
      pageSize: 10,
      totalCount: 500,
      items: []
    });

    var $el = c([
      '<div ivh-multi-select-async',
          'ivh-multi-select-fetcher="fetcher">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();

    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({
      filter: '', // No filters yet
      page: 0, // First page
      pageSize: jasmine.any(Number) // Don't care about this default
    }));
  });

  it('should display fetched items when the button is clicked', function() {
    var spy = scope.fetcher = jasmine.createSpy('fetcher').and.returnValue({
      page: 0,
      pageSize: 10,
      totalCount: 500,
      items: [
        {label: 'One'},
        {label: 'Two'},
        {label: 'Three'},
        {label: 'Four'},
        {label: 'Five'},
        {label: 'Six'},
        {label: 'Seven'},
        {label: 'Eight'},
        {label: 'Nine'},
        {label: 'Ten'}
      ]
    });

    var $el = c([
      '<div ivh-multi-select-async',
          'ivh-multi-select-fetcher="fetcher">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();

    var msItems = $el.find('li.ms-item');
    expect(msItems.length).toBe(10);
    expect(msItems.eq(3).text().trim()).toBe('Four');
  });

  it('should display promised items when the button is clicked', inject(function($q) {
    var spy = scope.fetcher = jasmine.createSpy('fetcher').and.returnValue($q.when({
      page: 0,
      pageSize: 10,
      totalCount: 500,
      items: [
        {label: 'One'},
        {label: 'Two'},
        {label: 'Three'},
        {label: 'Four'},
        {label: 'Five'},
        {label: 'Six'},
        {label: 'Seven'},
        {label: 'Eight'},
        {label: 'Nine'},
        {label: 'Ten'}
      ]
    }));

    var $el = c([
      '<div ivh-multi-select-async',
          'ivh-multi-select-fetcher="fetcher">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();

    var msItems = $el.find('li.ms-item');
    expect(msItems.length).toBe(10);
    expect(msItems.eq(3).text().trim()).toBe('Four');
  }));

  it('should display paging buttons based on returned info', inject(function($q) {
    var spy = scope.fetcher = jasmine.createSpy('fetcher').and.returnValue($q.when({
      page: 0,
      pageSize: 10,
      totalCount: 500,
      items: [
        {label: 'One'},
        {label: 'Two'},
        {label: 'Three'},
        {label: 'Four'},
        {label: 'Five'},
        {label: 'Six'},
        {label: 'Seven'},
        {label: 'Eight'},
        {label: 'Nine'},
        {label: 'Ten'}
      ]
    }));

    var $el = c([
      '<div ivh-multi-select-async',
          'ivh-multi-select-fetcher="fetcher">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();

    var pagingButtons = $el.find('[ivh-pager] li');
    expect(pagingButtons.length).toBe(12);
  }));

  it('should fetch new items when the page changes', inject(function($q, $timeout) {
    var page0 = $q.when({
      page: 0,
      pageSize: 10,
      totalCount: 500,
      items: [
        {label: '0_One'},
        {label: '0_Two'},
        {label: '0_Three'},
        {label: '0_Four'},
        {label: '0_Five'},
        {label: '0_Six'},
        {label: '0_Seven'},
        {label: '0_Eight'},
        {label: '0_Nine'},
        {label: '0_Ten'}
      ]
    });

    var page1 = $q.when({
      page: 1,
      pageSize: 10,
      totalCount: 500,
      items: [
        {label: '1_One'},
        {label: '1_Two'},
        {label: '1_Three'},
        {label: '1_Four'},
        {label: '1_Five'},
        {label: '1_Six'},
        {label: '1_Seven'},
        {label: '1_Eight'},
        {label: '1_Nine'},
        {label: '1_Ten'}
      ]
    });

    var spy = scope.fetcher = jasmine.createSpy('fetcher').and.callFake(function(args) {
      return args.page === 1 ? page1 : page0;
    });

    var $el = c([
      '<div ivh-multi-select-async',
          'ivh-multi-select-fetcher="fetcher">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();
    $el.find('[ivh-pager] li a:contains("2")').click();

    scope.$apply();

    var msItems = $el.find('li.ms-item');
    expect(msItems.length).toBe(10);
    expect(msItems.eq(3).text().trim()).toBe('1_Four');
  }));

  it('should fetch new items when the filter changes', inject(function($q, $timeout) {
    var page0 = $q.when({
      page: 0,
      pageSize: 10,
      totalCount: 30,
      items: [
        {label: 'filtered_One'},
        {label: 'filtered_Two'},
        {label: 'filtered_Three'},
        {label: 'filtered_Four'},
        {label: 'filtered_Five'},
        {label: 'filtered_Six'},
        {label: 'filtered_Seven'},
        {label: 'filtered_Eight'},
        {label: 'filtered_Nine'},
        {label: 'filtered_Ten'}
      ]
    });

    var spy = scope.fetcher = jasmine.createSpy('fetcher').and.returnValue(page0);

    var $el = c([
      '<div ivh-multi-select-async',
          'ivh-multi-select-fetcher="fetcher">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();

    var $msFilter = $el.find('input[type=text]');
    $msFilter.val('foobar');
    $msFilter.change();

    // The text input is debounced
    $timeout.flush();

    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({
      filter: 'foobar',
      page: 0,
      pageSize: jasmine.any(Number)
    }));
  }));

  it('should fetch new items when the filter is cleared', inject(function($q, $timeout) {
    var page0 = $q.when({
      page: 0,
      pageSize: 10,
      totalCount: 30,
      items: [
        {label: 'filtered_One'},
        {label: 'filtered_Two'},
        {label: 'filtered_Three'},
        {label: 'filtered_Four'},
        {label: 'filtered_Five'},
        {label: 'filtered_Six'},
        {label: 'filtered_Seven'},
        {label: 'filtered_Eight'},
        {label: 'filtered_Nine'},
        {label: 'filtered_Ten'}
      ]
    });

    var spy = scope.fetcher = jasmine.createSpy('fetcher').and.returnValue(page0);

    var $el = c([
      '<div ivh-multi-select-async',
          'ivh-multi-select-fetcher="fetcher">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();

    var $msFilter = $el.find('input[type=text]');
    $msFilter.val('foobar');
    $msFilter.change();
    $timeout.flush(); // text input is debounced

    $el.find('button:contains("Clear")').click();

    expect(spy.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
      filter: '',
      page: 0,
      pageSize: jasmine.any(Number)
    }));
  }));

  it('should reset the page when the filter changes', inject(function($timeout) {
    var page0 = {
      page: 0,
      pageSize: 10,
      totalCount: 30,
      items: [
        {label: 'One'},
        {label: 'Two'},
        {label: 'Three'},
        {label: 'Four'},
        {label: 'Five'},
        {label: 'Six'},
        {label: 'Seven'},
        {label: 'Eight'},
        {label: 'Nine'},
        {label: 'Ten'}
      ]
    };

    var spy = scope.fetcher = jasmine.createSpy('fetcher').and.returnValue(page0);

    var $el = c([
      '<div ivh-multi-select-async',
          'ivh-multi-select-fetcher="fetcher">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();

    $el.find('[ivh-pager] a:contains("2")').click();

    var $msFilter = $el.find('input[type=text]');
    $msFilter.val('foobar');
    $msFilter.change();

    // The text input is debounced
    $timeout.flush();

    var $firstPageLi = $el.find('[ivh-pager] li:contains("1")');

    expect($firstPageLi.hasClass('active')).toBe(true);
  }));

  it('should accept an array of selected items and match by id', function() {
    var page0 = {
      page: 0,
      pageSize: 10,
      totalCount: 3,
      items: [
        {id: 1, label: 'filtered_One'},
        {id: 2, label: 'filtered_Two'},
        {id: 3, label: 'filtered_Three'}
      ]
    };

    var spy = scope.fetcher = jasmine.createSpy('fetcher').and.returnValue(page0);

    scope.mySelection = [
      {id: 2, label: 'filtered_Two'}
    ];

    var $el = c([
      '<div ivh-multi-select-async',
          'ivh-multi-select-fetcher="fetcher"',
          'ivh-multi-select-selected-items="mySelection">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();

    var msCbs = $el.find('li.ms-item input[type=checkbox]');
    expect(msCbs.eq(0).prop('checked')).toBe(false);
    expect(msCbs.eq(1).prop('checked')).toBe(true);
    expect(msCbs.eq(2).prop('checked')).toBe(false);
  });

  describe('with selected items (single)', function() {
    var tpl;

    beforeEach(function() {
      scope.fetcher = jasmine.createSpy('fetcher').and.returnValue({
        page: 0,
        pageSize: 10,
        totalCount: 3,
        items: [
          {id: 1, label: 'One'},
          {id: 2, label: 'Two'},
          {id: 3, label: 'Three'}
        ]
      });

      tpl = [
        '<div ivh-multi-select-async',
            'ivh-multi-select-fetcher="fetcher"',
            'ivh-multi-select-selected-items="mySelection"',
            'selection-model-mode="\'single\'">',
          'Blargus',
        '</div>'
      ];
    });

    it('should add the last selected item to the list', function() {
      var mySelection = scope.mySelection = [{id: 2, label: 'Two'}];
      var $el = c(tpl);
      $el.find('button').click();
      $el.find('a:contains("One")').click();
      scope.$apply();
      expect(mySelection.length).toBe(1);
    });

    it('should be able to remove the last item on checkbox click', function() {
      var mySelection = scope.mySelection = [{id: 2, label: 'Two'}];
      var $el = c(tpl);
      $el.find('button').click();
      $el.find('a:contains("Two") input[type=checkbox]').click();
      scope.$apply();
      expect(mySelection.length).toBe(0);
    });
  });

  describe('with selected items (multi-additive)', function() {
    var tpl, spy;

    beforeEach(function() {
      var page0 = {
        page: 0,
        pageSize: 3,
        totalCount: 13,
        items: [
          {id: 1, label: 'One'},
          {id: 2, label: 'Two'},
          {id: 3, label: 'Three'}
        ]
      };

      var page1 = {
        page: 1,
        pageSize: 3,
        totalCount: 13,
        items: [
          {id: 4, label: 'Four'},
          {id: 5, label: 'Five'},
          {id: 6, label: 'Six'}
        ]
      };

      var half0 = {
        page: 0,
        pageSize: 7,
        totalCount: 13,
        items: [
          {id: 1, label: 'One'},
          {id: 2, label: 'Two'},
          {id: 3, label: 'Three'},
          {id: 4, label: 'Four'},
          {id: 5, label: 'Five'},
          {id: 6, label: 'Six'},
          {id: 7, label: 'Seven'}
        ]
      };

      var half1 = {
        page: 1,
        pageSize: 7,
        totalCount: 13,
        items: [
          {id: 8, label: 'Eight'},
          {id: 9, label: 'Nine'},
          {id: 10, label: 'Ten'},
          {id: 11, label: 'Eleven'},
          {id: 12, label: 'Twelve'},
          {id: 13, label: 'Thirteen'}
        ]
      };

      spy = scope.fetcher = jasmine.createSpy('fetcher').and.callFake(function(args) {
        if(7 === args.pageSize) {
          return 0 === args.page ? half0 : half1;
        }
        // A horrible hack but the default page size is 10 - I don't feel like
        // mocking out pages of ten so...
        return 0 === args.page ? page0 : page1;
      });

      tpl = [
        '<div ivh-multi-select-async',
            'ivh-multi-select-fetcher="fetcher"',
            'ivh-multi-select-selected-items="mySelection"',
            'selection-model-mode="\'multi-additive\'">',
          'Blargus',
        '</div>'
      ];
    });

    it('should add selected items to the list', function() {
      var mySelection = scope.mySelection = [{id: 2, label: 'Two'}];
      var $el = c(tpl);
      $el.find('button').click();
      $el.find('a:contains("One")').click();
      $el.find('[ivh-pager] li a:contains("2")').click();
      $el.find('a:contains("Six")').click();
      scope.$apply();
      expect(mySelection.length).toBe(3);
    });

    it('should remove unselected items from the list', function() {
      var mySelection = scope.mySelection = [{id: 4, label: 'Four'}];
      var $el = c(tpl);
      $el.find('button').click();
      $el.find('[ivh-pager] li a:contains("2")').click();
      $el.find('a:contains("Four")').click();
      expect(mySelection.length).toBe(0);
    });

    it('should select all items with two requests', function() {
      var mySelection = scope.mySelection = [{id: 4, label: 'Four'}];
      var $el = c(tpl);
      $el.find('button').click();
      $el.find('button:contains("All")').click();
      scope.$apply();
      expect(mySelection.length).toBe(13);
    });

    it('should remove all selected items when the remove button is clicked', function() {
      var mySelection = scope.mySelection = [{id: 4, label: 'Four'}];
      var $el = c(tpl);
      $el.find('button').click();
      $el.find('button:contains("None")').click();
      expect(mySelection.length).toBe(0);
    });

    it('should respect reference changes on the list of selected items', function() {
      scope.mySelection = [{id: 4, label: 'Four'}];
      var $el = c(tpl);
      $el.find('button').click();
      scope.mySelection = [{id: 1}, {id: 2}];
      scope.$apply();
      expect($el.find(':checked').length).toBe(2);
    });
  });

  it('should always show results from the most recent search', inject(function($q, $timeout) {
    /**
     * @see https://github.com/iVantage/angular-ivh-multi-select/issues/7
     */
    var deferred1 = $q.defer()
      , deferred2 = $q.defer();

    var results1 = {
      page: 0,
      pageSize: 10,
      totalCount: 3,
      items: [
        {id: 1, label: 'res_One'},
        {id: 2, label: 'res_Two'},
        {id: 3, label: 'res_Three'}
      ]
    };

    var results2 = {
      page: 0,
      pageSize: 10,
      totalCount: 3,
      items: [
        {id: 4, label: 'res_Four'},
        {id: 5, label: 'res_Five'},
        {id: 6, label: 'res_Six'}
      ]
    };

    scope.fetcher = jasmine.createSpy('fetcher').and.callFake(function(args) {
      return args.filter === 'results2' ? deferred2.promise : deferred1.promise;
    });

    var $el = c([
      '<div ivh-multi-select-async',
          'ivh-multi-select-fetcher="fetcher">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();

    var $msFilter = $el.find('input[type=text]');
    $msFilter.val('results1');
    $msFilter.change();
    $timeout.flush();

    $msFilter.val('results2');
    $msFilter.change();
    $timeout.flush();

    deferred2.resolve(results2);
    scope.$apply();

    deferred1.resolve(results1);
    scope.$apply();

    var msItems = $el.find('li.ms-item');
    expect(msItems.eq(0).text().trim()).toBe('res_Four');
  }));
});

