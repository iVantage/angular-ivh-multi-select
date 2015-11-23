
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

        /**
         * Used to compare freshly paged in collection items with those in the
         * selected items array
         */
        idAttr: '=ivhMultiSelectIdAttribute',

        /**
         * A managed list of currently selected items
         */
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
         * - `totalCount`: The total (unpaged) result set count
         *
         */
        getItems: '=ivhMultiSelectFetcher',

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
      templateUrl: 'src/views/ivh-multi-select-async.html',
      transclude: true,
      controllerAs: 'ms',
      controller: ['$document', '$scope', '$q', 'ivhMultiSelectCore',
          function($document, $scope, $q, ivhMultiSelectCore) {

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
         * If we are tracking a selection update the new page of things
         */
        var itemIsSelected = function(item) {
          for(var ix = selectedItems.length; ix--;) {
            if(selectedItems[ix][idAttr] === item[idAttr]) {
              return true;
            }
          }
          return false;
        };

        var updatePageSelection = function() {
          var selectedAttr = ms.sel.selectedAttribute;
          for(var ix = ms.items.length; ix--;) {
            ms.items[ix][selectedAttr] = itemIsSelected(ms.items[ix]);
          }
        };

        /**
         * Update the selection as reported to the user whenever we have
         * selection model updates
         *
         * Note that only single and multi-additive selection modes are
         * supported
         */
        ms.onSelectionChange = function(item) {
          var selectedAttr = ms.sel.selectedAttribute
            , ix;
          if('single' === ms.sel.mode) {
            if(item[selectedAttr]) {
              selectedItems.length = 0;
              selectedItems.push(item);
            } else {
              for(ix = selectedItems.length; ix--;) {
                if(item[idAttr] === selectedItems[idAttr]) {
                  selectedItems.splice(ix, 1);
                }
              }
            }
          } else {
            for(ix = selectedItems.length; ix--;) {
              if(selectedItems[ix][idAttr] === item[idAttr]) {
                selectedItems.splice(ix, 1);
                break;
              }
            }
            if(item[selectedAttr]) {
              selectedItems.push(item);
            }
          }
        };

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
         *
         * Trying to selected all items with a server side paginated dataset is
         * pretty gross... we'll do it but split the request up to leverage our
         * cluster.
         */
        ms.selectAllVisible = function(isSelected) {
          var selectedAttr = ms.sel.selectedAttribute
            , ix;
          if(isSelected === false) {
            for(ix = ms.items.length; ix--;) {
              if(ms.items[ix][selectedAttr]) {
                ms.items[ix][selectedAttr] = false;
                ms.sel.onChange(ms.items[ix]);
              }
            }
            selectedItems.length = 0;
          } else {
            var sizePageHalfTotal = Math.ceil(ms.countItems / 2);
            $q.all([
              $scope.getItems({
                filter: ms.filterString,
                page: 0,
                pageSize: sizePageHalfTotal
              }),
              $scope.getItems({
                filter: ms.filterString,
                page: 1,
                pageSize: sizePageHalfTotal
              })
            ])
            .then(function(res) {
              selectedItems.length = 0;
              Array.prototype.push.apply(selectedItems,
                  res[0].items.concat(res[1].items));
              for(ix = ms.items.length; ix--;) {
                ms.items[ix][selectedAttr] = true;
              }
            });
          }
        };

        /**
         * Fetch a page of data
         *
         * Does nothing if the item list is closed
         *
         * @returns {Promise} Resolves to the current page of items
         */
        ms.getItems = function() {
          if(!ms.isOpen) { return $q.when(ms.item); }
          return $q.when($scope.getItems({
            filter: ms.filterString,
            page: ms.ixPage,
            pageSize: ms.sizePage
          }))
          .then(function(response) {
            ms.items = response.items;
            ms.ixPage = response.page || ms.ixPage;
            ms.sizePage = response.pageSize || ms.sizePage;
            ms.countItems = response.totalCount || ms.items.length;
            if(ms.items.length > ms.sizePage) {
              ms.items.length = ms.sizePage;
            }
            updatePageSelection();
            return ms.items;
          }, function(reason) {
            ms.items = [];
            ms.countItems = 0;
            return ms.items;
          });
        };

        /**
         * Override the hook for filter change
         */
        ms.onFilterChange = function() {
          ms.ixPage = 0;
          ms.getItems();
        };

        /**
         * Get the new page!
         */
        ms.onPageChange = function(newPage, oldPage) {
          ms.ixPage = newPage;
          ms.getItems();
        };
      }]
    };
  });

