import { createRenderer } from '@material-ui/monorepo/test/utils';
import { getColumnHeadersTextContent, getColumnValues } from 'test/utils/helperFn';
import * as React from 'react';
import { expect } from 'chai';
import {
  DataGridPro,
  DataGridProProps,
  GridApiRef,
  GridKeyGetterParams,
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

describe('<DataGridPro /> - Group Rows By Column', () => {
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

  describe('props: groupingColumnMode', () => {
    it('should gather call the grouping fields in a single column when groupingColumnMode is not defined', () => {
      render(
        <Test
          columns={[
            {
              field: 'category1',
              groupRows: true,
              hide: true,
            },
            {
              field: 'category2',
              groupRows: true,
              hide: true,
            },
          ]}
          defaultGroupingExpansionDepth={-1}
        />,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal(['Group']);
      expect(getColumnValues(0)).to.deep.equal([
        'A (3)',
        'Cat 1 (1)',
        '',
        'Cat 2 (2)',
        '',
        '',
        'B (2)',
        'Cat 2 (1)',
        '',
        'Cat 1 (1)',
        '',
      ]);
    });

    it('should gather call the grouping fields in a single column when groupingColumnMode = "single"', () => {
      render(
        <Test
          columns={[
            {
              field: 'category1',
              groupRows: true,
              hide: true,
            },
            {
              field: 'category2',
              groupRows: true,
              hide: true,
            },
          ]}
          defaultGroupingExpansionDepth={-1}
          groupingColumnMode="single"
        />,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal(['Group']);
      expect(getColumnValues(0)).to.deep.equal([
        'A (3)',
        'Cat 1 (1)',
        '',
        'Cat 2 (2)',
        '',
        '',
        'B (2)',
        'Cat 2 (1)',
        '',
        'Cat 1 (1)',
        '',
      ]);
    });

    it('should gather call the grouping fields in a single column when groupingColumnMode = "multiple"', () => {
      render(
        <Test
          columns={[
            {
              field: 'category1',
              groupRows: true,
              hide: true,
            },
            {
              field: 'category2',
              groupRows: true,
              hide: true,
            },
          ]}
          defaultGroupingExpansionDepth={-1}
          groupingColumnMode="multiple"
        />,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal(['category1', 'category2']);
      expect(getColumnValues(0)).to.deep.equal([
        'A (3)',
        '',
        '',
        '',
        '',
        '',
        'B (2)',
        '',
        '',
        '',
        '',
      ]);
      expect(getColumnValues(1)).to.deep.equal([
        '',
        'Cat 1 (1)',
        '',
        'Cat 2 (2)',
        '',
        '',
        '',
        'Cat 2 (1)',
        '',
        'Cat 1 (1)',
        '',
      ]);
    });

    it('should support groupingColumnMode switch', () => {
      const { setProps } = render(
        <Test
          columns={[
            {
              field: 'category1',
              groupRows: true,
              hide: true,
            },
            {
              field: 'category2',
              groupRows: true,
              hide: true,
            },
          ]}
          defaultGroupingExpansionDepth={-1}
          groupingColumnMode="multiple"
        />,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal(['category1', 'category2']);
      expect(getColumnValues(0)).to.deep.equal([
        'A (3)',
        '',
        '',
        '',
        '',
        '',
        'B (2)',
        '',
        '',
        '',
        '',
      ]);
      expect(getColumnValues(1)).to.deep.equal([
        '',
        'Cat 1 (1)',
        '',
        'Cat 2 (2)',
        '',
        '',
        '',
        'Cat 2 (1)',
        '',
        'Cat 1 (1)',
        '',
      ]);

      setProps({ groupingColumnMode: 'single' });
      expect(getColumnHeadersTextContent()).to.deep.equal(['Group']);
      expect(getColumnValues(0)).to.deep.equal([
        'A (3)',
        'Cat 1 (1)',
        '',
        'Cat 2 (2)',
        '',
        '',
        'B (2)',
        'Cat 2 (1)',
        '',
        'Cat 1 (1)',
        '',
      ]);
    });
  });

  describe('colDef: groupRows', () => {
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

  describe('colDef: groupRowIndex', () => {
    it('should order the grouping fields according to the column order if no groupRowIndex provided', () => {
      render(
        <Test
          columns={[
            {
              field: 'category2',
              groupRows: true,
              hide: true,
            },
            {
              field: 'category1',
              groupRows: true,
              hide: true,
            },
          ]}
          defaultGroupingExpansionDepth={-1}
          groupingColumnMode="multiple"
        />,
      );
      expect(getColumnHeadersTextContent()).to.deep.equal(['category2', 'category1']);
    });

    it('should order the grouping fields according to the groupRowIndex property if provided', () => {
      render(
        <Test
          columns={[
            {
              field: 'category1',
              groupRows: true,
              groupRowIndex: 2,
              hide: true,
            },
            {
              field: 'category2',
              groupRows: true,
              groupRowIndex: 1,
              hide: true,
            },
          ]}
          defaultGroupingExpansionDepth={-1}
          groupingColumnMode="multiple"
        />,
      );
      expect(getColumnHeadersTextContent()).to.deep.equal(['category2', 'category1']);
    });

    it('should put columns without groupRowIndex before columns with it', () => {
      render(
        <Test
          columns={[
            {
              field: 'category1',
              groupRows: true,
              groupRowIndex: 0,
              hide: true,
            },
            {
              field: 'category2',
              groupRows: true,
              hide: true,
            },
          ]}
          defaultGroupingExpansionDepth={-1}
          groupingColumnMode="multiple"
        />,
      );
      expect(getColumnHeadersTextContent()).to.deep.equal(['category2', 'category1']);
    });

    it('should react to change of groupRowIndex via `apiRef.current.updateColumns`', () => {
      render(
        <Test
          columns={[
            {
              field: 'category1',
              groupRows: true,
              groupRowIndex: 2,
              hide: true,
            },
            {
              field: 'category2',
              groupRows: true,
              groupRowIndex: 1,
              hide: true,
            },
          ]}
          defaultGroupingExpansionDepth={-1}
          groupingColumnMode="multiple"
        />,
      );
      expect(getColumnHeadersTextContent()).to.deep.equal(['category2', 'category1']);
      apiRef.current.updateColumns([{ field: 'category2', groupRowIndex: 3 }]);
    });
  });

  describe('colDef: keyGetter', () => {
    it('should use keyGetter to group rows when defined', () => {
      render(
        <Test
          columns={[
            {
              field: 'id',
            },
            {
              field: 'category1',
              groupRows: true,
              groupRowIndex: 2,
              hide: true,
              keyGetter: (params: GridKeyGetterParams<string>) => `key-${params.value}`,
            },
          ]}
          defaultGroupingExpansionDepth={-1}
        />,
      );
      expect(getColumnValues(0)).to.deep.equal(['key-A (3)', '', '', '', 'key-B (2)', '', '']);
      expect(getColumnValues(1)).to.deep.equal(['', '0', '1', '2', '', '3', '4']);
    });

    // TODO: Uncomment once `useGridGroupRowsByColumn` handles `valueGetter`
    // it('should pass the return of valueGetter to the keyGetter callback when both defined', () => {
    //   render(<Test
    //       columns={[
    //         {
    //           field: 'id',
    //         },
    //         {
    //           field: 'category1',
    //           groupRows: true,
    //           groupRowIndex: 2,
    //           hide: true,
    //           valueGetter: (params) => `value-${params.value}`,
    //           keyGetter: (params: GridKeyGetterParams<string>) => `test-${params.value}`,
    //         },
    //       ]}
    //       defaultGroupingExpansionDepth={-1}
    //   />)
    //   expect(getColumnValues(0)).to.deep.equal(['test-key-A (3)', '', '', '', 'test-key-B (2)', '', '']);
    //   expect(getColumnValues(1)).to.deep.equal(['', '0', '1', '2', '', '3', '4']);
  });
});
