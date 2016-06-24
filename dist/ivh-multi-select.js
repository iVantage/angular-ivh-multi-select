
/**
 * Main module declaration for ivh.multiSelect
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect', [
  'selectionModel'
]);


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
      template: '\n<div class="ivh-multi-select dropdown" ng-class="{open: ms.isOpen}"\nivh-multi-select-collapsable>\n<button class="btn btn-default dropdown-toggle" type="button"\nivh-multi-select-stay-open\nng-click="ms.isOpen = !ms.isOpen; ms.getItems()">\n<span ng-transclude></span>\n<span class="caret"></span>\n</button>\n<ul class="dropdown-menu" role="menu" ng-if="ms.isOpen"\nivh-multi-select-stay-open>\n<li role="presentation" ivh-multi-select-tools></li>\n<li role="presentation" ivh-multi-select-filter></li>\n<li role="presentation" class="divider"></li>\n<li role="presentation" class="ms-item"\nng-repeat="item in ms.items"\nselection-model\nselection-model-mode="ms.sel.mode"\nselection-model-type="ms.sel.type"\nselection-model-selected-attribute="ms.sel.selectedAttribute"\nselection-model-on-change="ms.onSelectionChange(item);ms.sel.onChange(item)">\n<a role="menuitem">\n<!-- Must stop propagation on checkbox clicks when nested within the `a`\ntag otherwise `a` fires a click too and undoes the first click. We\nwant to honor the actual checkbox click. -->\n<input type="checkbox" ng-click="$event.stopPropagation()" />\n{{:: ms.getLabelFor(item)}}\n</a>\n</li>\n<li role="presentation" ng-hide="ms.items.length"\nivh-multi-select-no-results>\n</li>\n<li role="presentation" ng-if="ms.hasPager && ms.countItems > ms.sizePage">\n<div class="text-center"\nivh-pager\nivh-pager-total="ms.countItems"\nivh-pager-page-number="ms.ixPage"\nivh-pager-page-size="ms.sizePage"\nivh-pager-button-size="\'sm\'"\nivh-pager-on-page-change="ms.onPageChange(newPage, oldPage)">\n</div>\n</li>\n</ul>\n</div>\n',
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
                if(item[idAttr] === selectedItems[ix][idAttr]) {
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
          isSelected = angular.isDefined(isSelected) ?  isSelected : true;
          var selectedAttr = ms.sel.selectedAttribute
            , ix;
          if(isSelected === false && ms.filterString === '') {
            for(ix = selectedItems.length; ix--;) {
              selectedItems[ix][selectedAttr] = false;
              ms.sel.onChange(selectedItems[ix]);
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
              var incomingItems = res[0].items.concat(res[1].items)
                , incomingItemIds = {}
                , existingItemIds = {};

              for(ix = incomingItems.length; ix--;) {
                var id = incomingItems[ix][idAttr];
                if(incomingItemIds.hasOwnProperty(id)) {
                  incomingItems.splice(ix, 1);
                }
                incomingItemIds[id] = 1;
              }

              for(ix = selectedItems.length; ix--;) {
                if(incomingItemIds.hasOwnProperty(selectedItems[ix][idAttr])) {
                  existingItemIds[ selectedItems[ix][idAttr] ] = 1;
                  selectedItems.splice(ix, 1);
                }
              }

              if(isSelected) {
                Array.prototype.push.apply(selectedItems, incomingItems);
              }

              for(ix = ms.items.length; ix--;) {
                ms.items[ix][selectedAttr] = isSelected;
                if(!existingItemIds.hasOwnProperty(ms.items[ix][idAttr])) {
                  ms.sel.onChange(ms.items[ix]);
                }
              }
            });
          }
        };

        /**
         * Fetch a page of data
         *
         * Does nothing if the item list is closed. Results will not be
         * displayed if there has been a subsequent call to `ms.getItems`
         *
         * @returns {Promise} Resolves to the current page of items
         */
        ms.getItems = function() {
          if(!ms.isOpen) { return $q.when(ms.item); }
          var fetchedOnCount = ++getItemsCallCount;
          return $q.when($scope.getItems({
            filter: ms.filterString,
            page: ms.ixPage,
            pageSize: ms.sizePage
          }))
          .then(function(response) {
            if(fetchedOnCount !== getItemsCallCount) {
              // There has been another call to `getItems` since the one these
              // results correspond to.
              return;
            }
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

        // A stamp for `ms.getItems` to verify that the items fetched are still
        // considered "fresh".
        var getItemsCallCount = 0;

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

        /**
         * Update our local reference if `selectedItems` changes
         *
         * @todo Is it cleaner to just use scope.selectedItems everywhere? We
         * might still need a watch to update the displayed selected when it
         * does change if that's something we want to support
         */
        $scope.$watch('selectedItems', function(newVal, oldVal) {
          if(newVal && newVal !== oldVal) {
            selectedItems = newVal;
            updatePageSelection();
          }
        });
      }]
    };
  });



/**
 * Listen for clicks outside the multi-select and collapse it if needed
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .directive('ivhMultiSelectCollapsable', ['$document', function($document) {
    'use strict';
    return {
      restrict: 'A',
      require: ['?^ivhMultiSelect', '?^ivhMultiSelectAsync'],
      link: function(scope, element, attrs, ctrls) {

        /**
         * Clicks on the body should close this multiselect
         *
         * ... unless the element has been tagged with
         * ivh-multi-select-stay-open... ;)
         *
         * Be a good doobee and clean up this click handler when our scope is
         * destroyed
         */
        var $bod = $document.find('body');

        var collapseMe = function($event) {
          var evt = $event.originalEvent || $event;
          if(!evt.ivhMultiSelectIgnore) {
            // Only one of the required parent controllers will be defined
            angular.forEach(ctrls, function(ms) {
              if(ms) { ms.isOpen = false; }
            });
            scope.$digest();
          }
        };

        $bod.on('click', collapseMe);

        scope.$on('$destroy', function() {
          $bod.off('click', collapseMe);
        });
      }
    };
  }]);





/**
 * MS Filter
 *
 * Consolidated to share between sync and async multiselect
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .directive('ivhMultiSelectFilter', function() {
    'use strict';
    return {
      restrict: 'A',
      template: '<a class="ms-tools">\n<!-- ms.getItems only defined in async version -->\n<input class="form-control" type="text"\nplaceholder="Search..."\nng-model="ms.filterString"\nng-change="ms.onFilterChange()"\nng-model-options="{debounce: 200}"\nivh-auto-focus />\n</a>\n'
    };
  });


/**
 * Displays a "no results" message
 *
 * Consolidated to share between sync and async multiselect
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .directive('ivhMultiSelectNoResults', function() {
    'use strict';
    return {
      restrict: 'A',
      template: '<a class="ms-tools">\n<em class="text-muted">\nNothing to show\n</em>\n</a>\n'
    };
  });



/**
 * Don't close the multiselect on click
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .directive('ivhMultiSelectStayOpen', function() {
    'use strict';
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {

        /**
         * Clicks on this element should not cause the multi-select to close
         */
        element.on('click', function($event) {
          var evt = $event.originalEvent || $event;
          evt.ivhMultiSelectIgnore = true;
        });
      }
    };
  });



/**
 * MS Tools (e.g. "Select All" button)
 *
 * Consolidated to share between sync and async multiselect
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .directive('ivhMultiSelectTools', function() {
    'use strict';
    return {
      restrict: 'A',
      template: '<a class="ms-tools">\n<button class="btn btn-default btn-sm"\nng-click="ms.enableMultiSelect && ms.selectAllVisible()"\nng-if="ms.enableMultiSelect">\n<span class="glyphicon glyphicon-ok"></span>\nAll\n</button>\n<button class="btn btn-default btn-sm"\nng-click="ms.enableMultiSelect && ms.selectAllVisible(false)"\nng-if="ms.enableMultiSelect">\n<span class="glyphicon glyphicon-remove"></span>\nNone\n</button>\n<button class="btn btn-default btn-sm"\nng-show="ms.filterString.length"\nng-click="ms.filterString = \'\';ms.onFilterChange()">\nClear\n</button>\n</a>\n'
    };
  });




/**
 * The Multi Select directive
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .directive('ivhMultiSelect', function() {
    'use strict';
    return {
      scope: {
        labelAttr: '=ivhMultiSelectLabelAttribute',
        labelExpr: '=ivhMultiSelectLabelExpression',

        /**
         * The universe of items
         */
        items: '=ivhMultiSelectItems',

        /**
         * Options for selection model
         */
        selectionModelType: '=',
        selectionModelMode: '=',
        selectionModelSelectedAttribute: '=',
        selectionModelSelectedClass: '=',
        selectionModelCleanupStrategy: '=',
        selectionModelSelectedItems: '=',

        /**
         * Should be an angular expression in which `item` is the collection
         * item that has changed selected state
         */
        selOnChange: '&selectionModelOnChange'
      },
      restrict: 'AE',
      template: '\n<div class="ivh-multi-select dropdown" ng-class="{open: ms.isOpen}"\nivh-multi-select-collapsable>\n<button class="btn btn-default dropdown-toggle" type="button"\nivh-multi-select-stay-open\nng-click="ms.isOpen = !ms.isOpen">\n<span ng-transclude></span>\n<span class="caret"></span>\n</button>\n<ul class="dropdown-menu" role="menu" ng-if="ms.isOpen"\nivh-multi-select-stay-open>\n<li role="presentation" ivh-multi-select-tools></li>\n<li role="presentation" ivh-multi-select-filter></li>\n<li role="presentation" class="divider"></li>\n<li role="presentation" class="ms-item"\nng-repeat="item in ms.items = (items | ivhMultiSelectLabelFilter:ms) | ivhMultiSelectPaginate:ms.ixPage:ms.sizePage"\nselection-model\nselection-model-mode="ms.sel.mode"\nselection-model-type="ms.sel.type"\nselection-model-selected-attribute="ms.sel.selectedAttribute"\nselection-model-on-change="ms.sel.onChange(item)"\nselection-model-selected-items="ms.sel.selectedItems">\n<a role="menuitem">\n<!-- Must stop propagation on checkbox clicks when nested within the `a`\ntag otherwise `a` fires a click too and undoes the first click. We\nwant to honor the actual checkbox click. -->\n<input type="checkbox" ng-click="$event.stopPropagation()" />\n{{:: ms.getLabelFor(item)}}\n</a>\n</li>\n<li role="presentation" ng-hide="ms.items.length"\nivh-multi-select-no-results>\n</li>\n<li role="presentation" ng-if="ms.hasPager && ms.items.length > ms.sizePage">\n<div class="text-center"\nivh-pager\nivh-pager-total="ms.items.length"\nivh-pager-page-number="ms.ixPage"\nivh-pager-page-size="ms.sizePage"\nivh-pager-button-size="\'sm\'">\n</div>\n</li>\n</ul>\n</div>\n',
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
         * Attach the passed items to our controller for consistent interface
         *
         * Will be updated from the view as `$scope.items` changes
         */
        ms.items = $scope.items;

        /**
         * Select all (or deselect) *not filtered out* items
         *
         * Note that if paging is enabled items on other pages will still be
         * selected as normal.
         */
        ms.selectAllVisible = function(isSelected) {
          isSelected = angular.isDefined(isSelected) ?  isSelected : true;
          var selectedAttr = ms.sel.selectedAttribute;
          angular.forEach(ms.items, function(item) {
            item[selectedAttr] = isSelected;
            ms.sel.onChange(item);
          });
        };
      }]
    };
  });


/**
 * For when you really need to track ids of selected items
 *
 * A bit of a hack, meant to be used in conjunction with
 * `selection-model-on-change`:
 *
 * ```
 * <div ivh-multi-select
 *      ivh-multi-select-items="demo.items"
 *      selection-model-on-change="demo.selectedIds | ivhMultiSelectCollect:item">
 * </div>
 * ```
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .filter('ivhMultiSelectCollect', ['selectionModelOptions', function(selectionModelOptions) {
    'use strict';

    var defaultSelAttr = selectionModelOptions.get().selectedAttribute;

    return function(idsList, item, idAttr, selAttr) {
      if(!idsList || !item) {
        return idsList;
      }

      var isSelected = item[selAttr || defaultSelAttr]
        , itemId = item[idAttr || 'id']
        , ixId = idsList.indexOf(itemId);

      if(isSelected && -1 === ixId) {
        idsList.push(itemId);
      } else if(!isSelected && ixId > -1) {
        idsList.splice(ixId, 1);
      }

      return idsList;
    };
  }]);



/**
 * For filtering items by calculated labels
 *
 * @package ivh.multiSelect
 * @copyright 2016 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .filter('ivhMultiSelectLabelFilter', [function(selectionModelOptions) {
    'use strict';

    return function(items, ctrl) {
      var str = ctrl.filterString;

      if(!items || !str) {
        return items;
      }

      var filtered = [];

      angular.forEach(items, function(item) {
        if(ctrl.getLabelFor(item).indexOf(str) > -1) {
          filtered.push(item);
        }
      });

      return filtered;
    };
  }]);




/**
 * Wrapper for ivhPaginateFilter if present
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .filter('ivhMultiSelectPaginate', ['$injector', function($injector) {
    'use strict';

    // Fall back to the identity function
    var filterFn = function(col) {
      return col;
    };

    // Use ivhPaginateFilter if we have access to it
    if($injector.has('ivhPaginateFilter')) {
      filterFn = $injector.get('ivhPaginateFilter');
    }

    return filterFn;
  }]);


/**
 * Shared multi select controller functionality
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .factory('ivhMultiSelectCore', ['$injector', '$interpolate', 'ivhMultiSelectSelm',
      function($injector, $interpolate, ivhMultiSelectSelm) {
    'use strict';
    var exports = {};

    /**
     * Adds shared functionality a multiselect controller
     */
    exports.init = function(ms, $scope) {
      var pagerPageSize = 10
        , pagerUsePager = true;

      /**
       * Whether or not the dropdown is displayed
       *
       * See ivh-multi-select-collapsable
       *
       * Toggled whenever the user clicks the ol' button
       */
      ms.isOpen = false;

      /**
       * The filter string entered by the user into our input control
       */
      ms.filterString = '';

      /**
       * We're embedding selection-model
       *
       * Forward supported `selection-model-*` attributes to the underlying
       * directive.
       */
      ms.sel = ivhMultiSelectSelm.options($scope);

      /**
       * Disable the 'All'/'None' buttons when in single select mode
       */
      ms.enableMultiSelect = 'single' !== ms.sel.mode;

      /**
       * Filter change hook, override as needed.
       *
       * Defined in core so as not to generate errors
       */
      ms.onFilterChange = angular.noop;

      /**
       * Setup watchers for each selection model propety attached to us
       */
      angular.forEach(ivhMultiSelectSelm.propsMap(), function(p) {
        var unwatch = $scope.$watch(p[1], function(newVal) {
          if(newVal) {
            ms.sel[p[0]] = newVal;
            if('mode' === p[0]) {
              ms.enableMultiSelect = 'single' !== newVal;
            }
          }
        });
        $scope.$on('$destroy', unwatch);
      });

      /**
       * Provide a way for the outside world to know about selection changes
       */
      ms.sel.onChange = function(item) {
        $scope.selOnChange({item: item});
      };

      /**
       * The collection item attribute or expression to display as a label
       */
      var labelAttr, labelFn;

      ms.getLabelFor = function(item) {
        return labelFn ? labelFn({item: item}) : item[labelAttr];
      };

      $scope.$watch('labelExpr || labelAttr', function() {
        labelAttr = $scope.labelAttr || 'label';
        labelFn = $scope.labelExpr ? $interpolate($scope.labelExpr) : null;
      });

      /**
       * We optionally suppor the ivh.pager module
       *
       * If it is present your items will be paged otherwise all are displayed
       */
      ms.hasPager = pagerUsePager && $injector.has('ivhPaginateFilter');
      ms.ixPage = 0;
      ms.sizePage = pagerPageSize;
    };

    return exports;
  }]);



/**
 * Selection Model helpers for Multi Select
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .factory('ivhMultiSelectSelm', ['selectionModelOptions', function(selectionModelOptions) {
    'use strict';
    var exports = {};

    /**
     * We're overriding selection model defaults with our own
     *
     * May still be set by the user at the attribute level
     */
    var selmOverrides = {
      type: 'checkbox',
      mode: 'multi-additive'
    };

    /**
     * Returns the supported selection model properties
     *
     * Note that we're only interested in properties that may need to be watched
     * (i.e. `selection-model-on-change` is omitted)
     *
     * @return {Array} The list of props, look for {1} $scope and {0} on selection model props
     */
    exports.propsMap = function() {
      return [
        ['type', 'selectionModelType'],
        ['mode', 'selectionModelMode'],
        ['selectedAttribute', 'selectionModelSelectedAttribute'],
        ['selectedClass', 'selectionModelSelectedClass'],
        ['cleanupStategy', 'selectionModelCleanupStrategy'],
        ['selectedItems', 'selectionModelSelectedItems']
      ];
    };

    /**
     * Merges and returns selection model defaults with overrides on the passed
     * scope.
     *
     * Accounts for IVH Multi Select selection model defaults
     *
     * @param {Scope} $scope Should have props matching supported selection model attrs
     * @return {Opbject} A hash of the merged options
     */
    exports.options = function($scope) {
      var opts = angular.extend({}, selectionModelOptions.get(), selmOverrides);
      angular.forEach(exports.propsMap(), function(p) {
        if($scope[p[1]]) {
          opts[p[0]] = $scope[p[1]];
        }
      });
      return opts;
    };

    return exports;
  }]);
