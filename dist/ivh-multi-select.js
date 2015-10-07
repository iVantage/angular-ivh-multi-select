
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
        items: '=ivhMultiSelectItems'
      },
      restrict: 'AE',
      templateUrl: 'src/views/ivh-multi-select.html',
      transclude: true,
      controllerAs: 'ms',
      controller: ['$document', '$scope', '$injector', 'filterFilter', 'selectionModelOptions',
          function($document, $scope, $injector, filterFilter, selectionModelOptions) {
        var ms = this;

        /**
         * @todo Forward options to selection model and ivh-pager
         */
        var selectedAttr = selectionModelOptions.get().selectedAttribute
          , labelAttr = 'label'
          , pagerPageSize = 10
          , pagerUsePager = true;

        /**
         *
         */
        ms.labelAttr = labelAttr;

        /**
         * Whether or not the dropdown is displayed
         *
         * Toggled whenever the user clicks the ol' button
         */
        ms.isOpen = true;

        /**
         * Attach the passed items to our controller for consistent interface
         */
        ms.items = $scope.items;

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
          var itemsToSelect = filterFilter(ms.items, ms.filterString);
          angular.forEach(itemsToSelect, function(item) {
            item[selectedAttr] = isSelected;
          });
        };

        /**
         * When the user enters a new filter we should update our list and
         * hide/show the pager as appropriate.
         */
        $scope.$watch('ms.filterString', function(newFilterString) {
          var filteredItems = filterFilter($scope.items, newFilterString);
          ms.items = filteredItems;
          ms.needsPager = filteredItems.length > pagerPageSize;
        });

        /**
         * Clicks on the body should close this multiselect
         *
         * ... unless the element has been tagged with
         * ivh-multi-select-stay-open... ;)
         */
        $document.find('body').on('click', function($event) {
          var evt = $event.originalEvent || $event;
          if(!evt.ivhMultiSelectIgnore) {
            ms.isOpen = false;
            $scope.$digest();
          }
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
