
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

