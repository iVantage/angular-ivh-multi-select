
/**
 * The (Async) Multi Select directive
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .directive('ivhMultiSelectAsync', function() {
    'use strict';
    return {
      scope: {
        labelAttr: '=ivhMultiSelectLabelAttribute',
        labelExpr: '=ivhMultiSelectLabelExpression',

        idAttr: '=ivhMultiSelectIdAttribute',
        selectedItems: '=ivhMultiSelectSelectedItems',

        /**
         * The function we'll use to fetch pages of items
         *
         * Should accept an options object with the following properties:
         *
         * - filter: A string, whatever the user has entered in the filte box
         * - page: The zero-based page number we're requesting for paginated
         *   results.
         * - pageSize: The number of items we expect per page
         *
         * The function should return an object, or promise which resolves to
         * shuch an object, with the following properties:
         *
         * - items: A page of collection items, if more than one page was
         *   returned only the first `pageSize` will be displayed (assuming
         *   paging is enabled).
         * - page: [Optional] The zero-based page number corresponding to the
         *   returned results. If ommitted and paging is enabled we will assume
         *   `page` from the request options.
         * - pageSize: The size of a page of results, if omitted we will assume
         *   `pageSize` from the request options.
         *
         * @todo but what to call it?
         */
        foo: '=',

        /**
         * Options for selection model
         */
        selectionModelType: '=',
        selectionModelMode: '=',
        selectionModelSelectedAttribute: '=',
        selectionModelSelectedClass: '=',
        selectionModelCleanupStrategy: '=',

        /**
         * Should be an angular expression in which `item` is the collection
         * item that has changed selected state
         */
        selOnChange: '&selectionModelOnChange'
      },
      restrict: 'AE',
      templateUrl: 'src/views/ivh-multi-select.html',
      transclude: true,
      controllerAs: 'ms',
      controller: ['$document', '$scope', 'ivhMultiSelectCore',
          function($document, $scope, ivhMultiSelectCore) {

        /**
         * Mixin core functionality
         */
        var ms = this;
        ivhMultiSelectCore.init(ms, $scope);

        /**
         * Async flavor supports only 'multi-additive' and 'single' selection
         * model modes.
         *
         * @todo blow up if we've been given another mode.
         */

        /**
         * The async version of multi-select can't rely on a local collection
         *
         * Instead we work with an array of selected items. These will be matche
         * up with items fetched from th server by their ID attribute.
         *
         * As the user selects and deselected items those items will be added
         * and removed from the array of selected items.
         */
        var idAttr = $scope.idAttr || 'id'
          , selectedItems = $scope.selectedItems || [];

        /**
         * Will be updated as we fetch items
         */
        ms.items = [];

        /**
         * The size of the *unpaged* collection
         *
         * The server shoudl tell us how many items are in the collection
         * whenever we fetch a new paged set
         */
        ms.countItems = 0;

        /**
         * Select all (or deselect) *not filtered out* items
         *
         * Note that if paging is enabled items on other pages will still be
         * selected as normal.
         */
        ms.selectAllVisible = function(isSelected) {
          // Ooph... fetch everything :/
          //
          // Perhaps confirm that this is actually what we want to do if there
          // are more than a certain number of items in the full set

          //angular.forEach(ms.items, function(item) {
          //  item[selectedAttr] = isSelected;
          //  ms.sel.onChange(item);
          //});
        };
      }]
    };
  });

