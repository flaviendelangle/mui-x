import { createRenderer } from '@material-ui/monorepo/test/utils';
import { getColumnHeadersTextContent, getColumnValues } from 'test/utils/helperFn';
import * as React from 'react';
import { expect } from 'chai';
import {
  DataGridPro,
  DataGridProProps,
  GridApiRef,
  GridRowsProp,
  useGridApiRef,
} from '@mui/x-data-grid-pro';

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

const rows: GridRowsProp = [
  { id: 0, category1: 'A', category2: 'Cat 1' },
  { id: 1, category1: 'A', category2: 'Cat 2' },
  { id: 2, category1: 'A', category2: 'Cat 2' },
  { id: 3, category1: 'B', category2: 'Cat 2' },
  { id: 4, category1: 'B', category2: 'Cat 1' },
];

const baselineProps: DataGridProProps = {
  autoHeight: isJSDOM,
  rows,
  columns: [
    {
      field: 'id',
    },
    {
      field: 'category1',
    },
    {
      field: 'category2',
    },
  ],
};

describe('<DataGridPro /> - Tree Data', () => {
  const { render } = createRenderer();

  let apiRef: GridApiRef;

  const Test = (props: Partial<DataGridProProps>) => {
    apiRef = useGridApiRef();

    return (
      <div style={{ width: 300, height: 800 }}>
        <DataGridPro {...baselineProps} apiRef={apiRef} {...props} />
      </div>
    );
  };

  describe('colDef property: groupRows', () => {
    it('should support groupRows toggling on column via props', () => {
      const { setProps } = render(
        <Test
          columns={[
            {
              field: 'id',
            },
            {
              field: 'category1',
            },
            {
              field: 'category2',
            },
          ]}
          defaultGroupingExpansionDepth={-1}
        />,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'category1', 'category2']);
      expect(getColumnValues(0)).to.deep.equal(['0', '1', '2', '3', '4']);

      setProps({
        columns: [
          {
            field: 'id',
          },
          {
            field: 'category1',
            groupRows: true,
          },
          {
            field: 'category2',
          },
        ],
      });
      expect(getColumnHeadersTextContent()).to.deep.equal([
        'Group',
        'id',
        'category1',
        'category2',
      ]);
      expect(getColumnValues(0)).to.deep.equal(['A (3)', '', '', '', 'B (2)', '', '']);
      expect(getColumnValues(1)).to.deep.equal(['', '0', '1', '2', '', '3', '4']);

      setProps({
        columns: [
          {
            field: 'id',
          },
          {
            field: 'category1',
          },
          {
            field: 'category2',
            groupRows: true,
          },
        ],
      });
      expect(getColumnHeadersTextContent()).to.deep.equal([
        'Group',
        'id',
        'category1',
        'category2',
      ]);
      expect(getColumnValues(0)).to.deep.equal(['Cat 1 (2)', '', '', 'Cat 2 (3)', '', '', '']);
      expect(getColumnValues(1)).to.deep.equal(['', '0', '4', '', '1', '2', '3']);
    });

    it('should support groupRows toggling on column via `apiRef.current.updateColumns`', () => {
      render(
        <Test
          columns={[
            {
              field: 'id',
            },
            {
              field: 'category1',
            },
            {
              field: 'category2',
            },
          ]}
          defaultGroupingExpansionDepth={-1}
        />,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'category1', 'category2']);
      expect(getColumnValues(0)).to.deep.equal(['0', '1', '2', '3', '4']);

      apiRef.current.updateColumns([
        {
          field: 'category1',
          groupRows: true,
        },
      ]);
      expect(getColumnHeadersTextContent()).to.deep.equal([
        'Group',
        'id',
        'category1',
        'category2',
      ]);
      expect(getColumnValues(0)).to.deep.equal(['A (3)', '', '', '', 'B (2)', '', '']);
      expect(getColumnValues(1)).to.deep.equal(['', '0', '1', '2', '', '3', '4']);

      apiRef.current.updateColumns([
        {
          field: 'category1',
          groupRows: false,
        },
        {
          field: 'category2',
          groupRows: true,
        },
      ]);
      expect(getColumnHeadersTextContent()).to.deep.equal([
        'Group',
        'id',
        'category1',
        'category2',
      ]);
      expect(getColumnValues(0)).to.deep.equal(['Cat 1 (2)', '', '', 'Cat 2 (3)', '', '', '']);
      expect(getColumnValues(1)).to.deep.equal(['', '0', '4', '', '1', '2', '3']);
    });
  });
});
