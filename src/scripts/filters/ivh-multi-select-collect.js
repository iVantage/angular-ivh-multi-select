
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

