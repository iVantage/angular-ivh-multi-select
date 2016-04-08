
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


