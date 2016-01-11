
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
