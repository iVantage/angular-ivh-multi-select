
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
 * Autofocus the attached element when rendered
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .directive('ivhMultiSelectAutofocus', ['$timeout', function($timeout) {
    'use strict';
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        $timeout(function() {
          element[0].focus();
        });
      }
    };
  }]);




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
        items: '=ivhMultiSelectItems',
        labelAttr: '=ivhMultiSelectLabelAttribute',

        /**
         * Options for selection model
         */
        selType: '=selectionModelType',
        selMode: '=selectionModelMode',
        selAttr: '=selectionModelSelectedAttribute',
        selClass: '=selectionModelSelectedClass',
        selCleanup: '=selectionModelCleanupStrategy'
      },
      restrict: 'AE',
      template: '\n<div class="ivh-multi-select dropdown" ng-class="{open: ms.isOpen}">\n<button class="btn btn-default dropdown-toggle" type="button"\nivh-multi-select-stay-open\nng-click="ms.isOpen = !ms.isOpen">\n<span ng-transclude></span>\n<span class="caret"></span>\n</button>\n<ul class="dropdown-menu" role="menu" ng-if="ms.isOpen"\nivh-multi-select-stay-open>\n<li role="presentation">\n<a class="ms-tools">\n<button class="btn btn-default btn-sm"\nng-click="ms.selectAllVisible()">\n<span class="glyphicon glyphicon-ok"></span>\nAll\n</button>\n<button class="btn btn-default btn-sm"\nng-click="ms.selectAllVisible(false)">\n<span class="glyphicon glyphicon-remove"></span>\nNone\n</button>\n<button class="pull-right btn btn-default btn-sm"\nng-click="ms.filterString = \'\'">\nClear\n</button>\n</a>\n</li>\n<li role="presentation">\n<a class="ms-tools">\n<input class="form-control" type="text"\nplaceholder="Search..."\nng-model="ms.filterString"\nng-model-options="{debounce: 200}"\nivh-multi-select-autofocus>\n</a>\n</li>\n<li role="presentation" class="divider"></li>\n<li role="presentation" class="ms-item"\nng-repeat="item in ms.items | ivhMultiSelectPaginate:ms.ixPage:ms.sizePage"\nselection-model\nselection-model-mode="ms.sel.mode"\nselection-model-type="ms.sel.type"\nselection-model-selected-attribute="ms.sel.selectedAttribute"\nselection-model-selected-attribute="ms.sel.selectedAttribute">\n<a role="menuitem">\n<!-- Must stop propagation on checkbox clicks when nested within the `a`\ntag otherwise `a` fires a click too and undoes the first click. We\nwant to honor the actual checkbox click. -->\n<input type="checkbox" ng-click="$event.stopPropagation()" />\n{{:: item[ms.labelAttr]}}\n</a>\n</li>\n<li role="presentation" ng-hide="ms.items.length">\n<a class="ms-tools">\n<em class="text-muted">\nNothing to show\n</em>\n</a>\n</li>\n<li role="presentation" ng-if="ms.hasPager && ms.needsPager">\n<div class="text-center"\nivh-pager\nivh-pager-total="ms.items.length"\nivh-pager-page-number="ms.ixPage"\nivh-pager-page-size="ms.sizePage"\nivh-pager-button-size="\'sm\'">\n</div>\n</li>\n</ul>\n</div>\n',
      transclude: true,
      controllerAs: 'ms',
      controller: ['$document', '$scope', '$injector', 'filterFilter', 'selectionModelOptions',
          function($document, $scope, $injector, filterFilter, selectionModelOptions) {
        var ms = this;

        /**
         * @todo Forward options to ivh-pager
         */
        var pagerPageSize = 10
          , pagerUsePager = true;

        /**
         * We're embedding selection-model
         *
         * Forward supported `selection-model-*` attributes to the underlying
         * directive.
         */
        ms.sel = angular.extend({},
          // Global defaults
          selectionModelOptions.get(),
          // Our defaults
          {
            type: 'checkbox',
            mode: 'multi-additive'
          });

        // Fold inline props over everything if provided
        angular.forEach([
          // [ **selection model prop**, **value** ]
          ['type', $scope.selType],
          ['mode', $scope.selMode],
          ['selectedAttribute', $scope.selAttr],
          ['selectedClass', $scope.selClass],
          ['cleanupStategy', $scope.selCleanup]
        ], function(p) {
          if(p[1]) {
            ms.sel[p[0]] = p[1];
          }
        });

        /**
         * The collection item attribute to display as a label
         */
        ms.labelAttr = $scope.labelAttr || 'label';

        /**
         * Whether or not the dropdown is displayed
         *
         * Toggled whenever the user clicks the ol' button
         */
        ms.isOpen = false;

        /**
         * Attach the passed items to our controller for consistent interface
         */
        ms.items = $scope.items;

        /**
         * If $scope.items breaks reference we'll need to update
         */
        $scope.$watch('items', function(newItems) {
          ms.items = newItems;
        });

        /**
         * The filter string entered by the user into our input control
         */
        ms.filterString = '';

        /**
         * We optionally suppor the ivh.pager module
         *
         * If it is present your items will be paged otherwise all are displayed
         */
        ms.hasPager = pagerUsePager && $injector.has('ivhPaginateFilter');
        ms.ixPage = 0;
        ms.sizePage = pagerPageSize;
        ms.needsPager = false;

        /**
         * Select all (or deselect) *not filtered out* items
         *
         * Note that if paging is enabled items on other pages will still be
         * selected as normal.
         */
        ms.selectAllVisible = function(isSelected) {
          isSelected = angular.isDefined(isSelected) ?  isSelected : true;
          var itemsToSelect = filterFilter(ms.items, ms.filterString)
            , selectedAttr = ms.sel.selectedAttribute;
          angular.forEach(itemsToSelect, function(item) {
            item[selectedAttr] = isSelected;
          });
        };

        /**
         * When the user enters a new filter we should update our list and
         * hide/show the pager as appropriate.
         */
        $scope.$watch('ms.filterString', function(newFilterString) {
          var allItems = $scope.items;
          if(allItems) {
            var filteredItems = filterFilter(allItems, newFilterString);
            ms.items = filteredItems;
            ms.needsPager = filteredItems.length > pagerPageSize;
          }
        });

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
            ms.isOpen = false;
            $scope.$digest();
          }
        };

        $bod.on('click', collapseMe);

        $scope.$on('$destroy', function() {
          $bod.off('click', collapseMe);
        });
      }]
    };
  });


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
