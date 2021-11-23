import React from 'react';
import SelectorsDocs from 'docsx/src/modules/components/SelectorsDocs';
import selectors from 'docsx/pages/api-docs/data-grid/selectors.json';

export default function PaginationSelectorsNoSnap() {
  return (
    <SelectorsDocs
      selectors={selectors.filter((selector) => selector.feature === 'Pagination')}
    />
  );
}
