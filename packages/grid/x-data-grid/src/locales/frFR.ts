import { frFR as frFRCore } from '@mui/material/locale';
import { GridLocaleText } from '../models/api/gridLocaleTextApi';
import { getGridLocalization, Localization } from '../utils/getGridLocalization';

const frFRGrid: Partial<GridLocaleText> = {
  // Root
  noRowsLabel: 'Pas de résultats',
  noResultsOverlayLabel: 'Aucun résultat.',
  errorOverlayDefaultLabel: 'Une erreur est apparue.',

  // Density selector toolbar button text
  toolbarDensity: 'Densité',
  toolbarDensityLabel: 'Densité',
  toolbarDensityCompact: 'Compact',
  toolbarDensityStandard: 'Standard',
  toolbarDensityComfortable: 'Confortable',

  // Columns selector toolbar button text
  toolbarColumns: 'Colonnes',
  toolbarColumnsLabel: 'Choisir les colonnes',

  // Filters toolbar button text
  toolbarFilters: 'Filtres',
  toolbarFiltersLabel: 'Afficher les filtres',
  toolbarFiltersTooltipHide: 'Cacher les filtres',
  toolbarFiltersTooltipShow: 'Afficher les filtres',
  toolbarFiltersTooltipActive: (count) =>
    count > 1 ? `${count} filtres actifs` : `${count} filtre actif`,

  // Quick filter toolbar field
  toolbarQuickFilterPlaceholder: 'Recherche...',
  toolbarQuickFilterLabel: 'Recherche',
  toolbarQuickFilterDeleteIconLabel: 'Supprimer',

  // Export selector toolbar button text
  toolbarExport: 'Exporter',
  toolbarExportLabel: 'Exporter',
  toolbarExportCSV: 'Télécharger en CSV',
  toolbarExportPrint: 'Imprimer',
  // toolbarExportExcel: 'Download as Excel',

  // Columns panel text
  columnsPanelTextFieldLabel: 'Chercher colonne',
  columnsPanelTextFieldPlaceholder: 'Titre de la colonne',
  columnsPanelDragIconLabel: 'Réorganiser la colonne',
  columnsPanelShowAllButton: 'Tout afficher',
  columnsPanelHideAllButton: 'Tout cacher',

  // Filter panel text
  filterPanelAddFilter: 'Ajouter un filtre',
  filterPanelDeleteIconLabel: 'Supprimer',
  filterPanelLinkOperator: 'Opérateur logique',
  filterPanelOperators: 'Opérateur',

  // TODO v6: rename to filterPanelOperator
  filterPanelOperatorAnd: 'Et',
  filterPanelOperatorOr: 'Ou',
  filterPanelColumns: 'Colonnes',
  filterPanelInputLabel: 'Valeur',
  filterPanelInputPlaceholder: 'Filtrer la valeur',

  // Filter operators text
  filterOperatorContains: 'contient',
  filterOperatorEquals: 'égal à',
  filterOperatorStartsWith: 'commence par',
  filterOperatorEndsWith: 'se termine par',
  filterOperatorIs: 'est',
  filterOperatorNot: "n'est pas",
  filterOperatorAfter: 'postérieur',
  filterOperatorOnOrAfter: 'égal ou postérieur',
  filterOperatorBefore: 'antérieur',
  filterOperatorOnOrBefore: 'égal ou antérieur',
  filterOperatorIsEmpty: 'est vide',
  filterOperatorIsNotEmpty: "n'est pas vide",
  filterOperatorIsAnyOf: 'fait parti de',

  // Filter values text
  filterValueAny: 'tous',
  filterValueTrue: 'vrai',
  filterValueFalse: 'faux',

  // Column menu text
  columnMenuLabel: 'Menu',
  columnMenuShowColumns: 'Afficher les colonnes',
  columnMenuFilter: 'Filtrer',
  columnMenuHideColumn: 'Cacher',
  columnMenuUnsort: 'Annuler le tri',
  columnMenuSortAsc: 'Tri ascendant',
  columnMenuSortDesc: 'Tri descendant',

  // Column header text
  columnHeaderFiltersTooltipActive: (count) =>
    count > 1 ? `${count} filtres actifs` : `${count} filtre actif`,
  columnHeaderFiltersLabel: 'Afficher les filtres',
  columnHeaderSortIconLabel: 'Trier',

  // Rows selected footer text
  footerRowSelected: (count) =>
    count > 1
      ? `${count.toLocaleString()} lignes sélectionnées`
      : `${count.toLocaleString()} ligne sélectionnée`,

  // Total row amount footer text
  footerTotalRows: 'Lignes totales :',

  // Total visible row amount footer text
  footerTotalVisibleRows: (visibleCount, totalCount) =>
    `${visibleCount.toLocaleString()} sur ${totalCount.toLocaleString()}`,

  // Checkbox selection text
  checkboxSelectionHeaderName: 'Sélection',
  // checkboxSelectionSelectAllRows: 'Select all rows',
  // checkboxSelectionUnselectAllRows: 'Unselect all rows',
  // checkboxSelectionSelectRow: 'Select row',
  // checkboxSelectionUnselectRow: 'Unselect row',

  // Boolean cell text
  booleanCellTrueLabel: 'vrai',
  booleanCellFalseLabel: 'faux',

  // Actions cell more text
  actionsCellMore: 'Plus',

  // Column pinning text
  pinToLeft: 'Épingler à gauche',
  pinToRight: 'Épingler à droite',
  unpin: 'Désépingler',

  // Tree Data
  treeDataGroupingHeaderName: 'Groupe',
  treeDataExpand: 'afficher les enfants',
  treeDataCollapse: 'masquer les enfants',

  // Grouping columns
  groupingColumnHeaderName: 'Groupe',
  groupColumn: (name) => `Grouper par ${name}`,
  unGroupColumn: (name) => `Arrêter de grouper par ${name}`,

  // Master/detail
  // expandDetailPanel: 'Expand',
  // collapseDetailPanel: 'Collapse',

  // Row reordering text
  // rowReorderingHeaderName: 'Row reordering',

  // Aggregation
  // aggregationMultiFunctionLabel: 'Aggregation',
  // aggregationFunctionLabelSum: groupingKey => groupingKey == null ? 'Total' : `Total ${groupingKey}`,
  // aggregationFunctionLabelAvg: groupingKey => groupingKey == null ? 'Average' : `Average ${groupingKey}`,
  // aggregationFunctionLabelMin: groupingKey => groupingKey == null ? 'Minimum' : `Minimum ${groupingKey}`,
  // aggregationFunctionLabelMax: groupingKey => groupingKey == null ? 'Maximum' : `Maximum ${groupingKey}`,
  // aggregationFunctionLabelSize: groupingKey => groupingKey == null ? 'Size' : `Size ${groupingKey}`,
};

export const frFR: Localization = getGridLocalization(frFRGrid, frFRCore);
