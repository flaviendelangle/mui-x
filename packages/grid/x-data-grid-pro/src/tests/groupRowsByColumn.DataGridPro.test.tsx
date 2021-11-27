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
import { spy } from 'sinon';

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
const GROUPING_COLS_SINGLE_CAT_1 = ['A (3)', '', '', '', 'B (2)', '', ''];

const GROUPING_COLS_SINGLE_CAT_2 = ['Cat 1 (2)', '', '', 'Cat 2 (3)', '', '', ''];

const GROUPING_COLS_SINGLE_CAT_2_CAT_1 = [
  'Cat 1 (2)',
  'A (1)',
  '',
  'B (1)',
  '',
  'Cat 2 (3)',
  'A (2)',
  '',
  '',
  'B (1)',
  '',
];
const GROUPING_COLS_SINGLE_CAT_1_CAT_2 = [
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
];
const GROUPING_COLS_MULTIPLE_CAT_1_CAT_2 = [
  ['A (3)', '', '', '', '', '', 'B (2)', '', '', '', ''],
  ['', 'Cat 1 (1)', '', 'Cat 2 (2)', '', '', '', 'Cat 2 (1)', '', 'Cat 1 (1)', ''],
];
const GROUPING_COLS_MULTIPLE_CAT_2_CAT_1 = [
  ['Cat 1 (2)', '', '', '', '', 'Cat 2 (3)', '', '', '', '', ''],
  ['', 'A (1)', '', 'B (1)', '', '', 'A (2)', '', '', 'B (1)', ''],
];

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

  describe('initialState: groupingColumns.model', () => {
    it('should allow to initialize the grouping columns', () => {
      render(
        <Test
          initialState={{ groupingColumns: { model: ['category1'] } }}
          defaultGroupingExpansionDepth={-1}
        />,
      );
      expect(getColumnValues(0)).to.deep.equal(GROUPING_COLS_SINGLE_CAT_1);
    });

    it('should not react to initial state updates', () => {
      const { setProps } = render(
        <Test
          initialState={{ groupingColumns: { model: ['category1'] } }}
          defaultGroupingExpansionDepth={-1}
        />,
      );
      expect(getColumnValues(0)).to.deep.equal(GROUPING_COLS_SINGLE_CAT_1);

      setProps({ initialState: { groupingColumns: { model: ['category2'] } } });
      expect(getColumnValues(0)).to.deep.equal(GROUPING_COLS_SINGLE_CAT_1);
    });
  });

  describe('prop: groupingColumnsModel', () => {
    it('should not call onGroupingColumnsModelChange on initialisation or on groupingColumnsModel prop change', () => {
      const onGroupingColumnsModelChange = spy();

      const { setProps } = render(
        <Test
          groupingColumnsModel={['category1']}
          onGroupingColumnsModelChange={onGroupingColumnsModelChange}
        />,
      );

      expect(onGroupingColumnsModelChange.callCount).to.equal(0);
      setProps({ groupingColumnsModel: ['category2'] });

      expect(onGroupingColumnsModelChange.callCount).to.equal(0);
    });

    it('should allow to update the grouping columns model from the outside', () => {
      const { setProps } = render(
        <Test groupingColumnsModel={['category1']} defaultGroupingExpansionDepth={-1} />,
      );
      expect(getColumnValues(0)).to.deep.equal(GROUPING_COLS_SINGLE_CAT_1);
      setProps({ groupingColumnsModel: ['category2'] });
      expect(getColumnValues()).to.deep.equal(GROUPING_COLS_SINGLE_CAT_2);
      setProps({ groupingColumnsModel: ['category1', 'category2'] });
      expect(getColumnValues()).to.deep.equal(GROUPING_COLS_SINGLE_CAT_1_CAT_2);
    });
  });

  describe('props: groupingColumnMode', () => {
    it('should gather call the grouping fields in a single column when groupingColumnMode is not defined', () => {
      render(
        <Test
          initialState={{ groupingColumns: { model: ['category1', 'category2'] } }}
          defaultGroupingExpansionDepth={-1}
        />,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal([
        'Group',
        'id',
        'category1',
        'category2',
      ]);
      expect(getColumnValues(0)).to.deep.equal(GROUPING_COLS_SINGLE_CAT_1_CAT_2);
    });

    it('should gather call the grouping fields in a single column when groupingColumnMode = "single"', () => {
      render(
        <Test
          initialState={{ groupingColumns: { model: ['category1', 'category2'] } }}
          defaultGroupingExpansionDepth={-1}
          groupingColumnMode="single"
        />,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal([
        'Group',
        'id',
        'category1',
        'category2',
      ]);
      expect(getColumnValues(0)).to.deep.equal(GROUPING_COLS_SINGLE_CAT_1_CAT_2);
    });

    it('should gather call the grouping fields in a single column when groupingColumnMode = "multiple"', () => {
      render(
        <Test
          initialState={{ groupingColumns: { model: ['category1', 'category2'] } }}
          defaultGroupingExpansionDepth={-1}
          groupingColumnMode="multiple"
        />,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal([
        'category1',
        'category2',
        'id',
        'category1',
        'category2',
      ]);
      expect(getColumnValues(0)).to.deep.equal(GROUPING_COLS_MULTIPLE_CAT_1_CAT_2[0]);
      expect(getColumnValues(1)).to.deep.equal(GROUPING_COLS_MULTIPLE_CAT_1_CAT_2[1]);
    });

    it('should support groupingColumnMode switch', () => {
      const { setProps } = render(
        <Test
          initialState={{ groupingColumns: { model: ['category1', 'category2'] } }}
          defaultGroupingExpansionDepth={-1}
          groupingColumnMode="multiple"
        />,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal([
        'category1',
        'category2',
        'id',
        'category1',
        'category2',
      ]);
      expect(getColumnValues(0)).to.deep.equal(GROUPING_COLS_MULTIPLE_CAT_1_CAT_2[0]);
      expect(getColumnValues(1)).to.deep.equal(GROUPING_COLS_MULTIPLE_CAT_1_CAT_2[1]);

      setProps({ groupingColumnMode: 'single' });
      expect(getColumnHeadersTextContent()).to.deep.equal([
        'Group',
        'id',
        'category1',
        'category2',
      ]);
      expect(getColumnValues(0)).to.deep.equal(GROUPING_COLS_SINGLE_CAT_1_CAT_2);

      setProps({ groupingColumnMode: 'multiple' });
      expect(getColumnHeadersTextContent()).to.deep.equal([
        'category1',
        'category2',
        'id',
        'category1',
        'category2',
      ]);
      expect(getColumnValues(0)).to.deep.equal(GROUPING_COLS_MULTIPLE_CAT_1_CAT_2[0]);
      expect(getColumnValues(1)).to.deep.equal(GROUPING_COLS_MULTIPLE_CAT_1_CAT_2[1]);
    });

    it('should respect the model grouping order when groupingColumnMode = "single"', () => {
      render(
        <Test
          initialState={{ groupingColumns: { model: ['category2', 'category1'] } }}
          defaultGroupingExpansionDepth={-1}
          groupingColumnMode="single"
        />,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal([
        'Group',
        'id',
        'category1',
        'category2',
      ]);
      expect(getColumnValues(0)).to.deep.equal(GROUPING_COLS_SINGLE_CAT_2_CAT_1);
    });

    it('should respect the model grouping order when groupingColumnMode = "multiple"', () => {
      render(
        <Test
          initialState={{ groupingColumns: { model: ['category2', 'category1'] } }}
          defaultGroupingExpansionDepth={-1}
          groupingColumnMode="multiple"
        />,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal([
        'category2',
        'category1',
        'id',
        'category1',
        'category2',
      ]);
      expect(getColumnValues(0)).to.deep.equal(GROUPING_COLS_MULTIPLE_CAT_2_CAT_1[0]);
      expect(getColumnValues(1)).to.deep.equal(GROUPING_COLS_MULTIPLE_CAT_2_CAT_1[1]);
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
              keyGetter: (params: GridKeyGetterParams<string>) => `key-${params.value}`,
            },
          ]}
          groupingColumnsModel={['category1']}
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

  // TODO: Add more tests
  describe('sorting', () => {
    describe('props: groupingColumnMode = "multiple"', () => {
      it('should apply the sorting on the column grouping criteria if mainGroupingCriteria and leafField are not defined', () => {
        render(
          <Test
            groupingColumnsModel={['category1']}
            groupingColumnMode="multiple"
            sortModel={[{ field: '__row_group_by_columns_group_category1__', sort: 'desc' }]}
            defaultGroupingExpansionDepth={-1}
          />,
        );

        expect(getColumnValues(0)).to.deep.equal(['B (2)', '', '', 'A (3)', '', '', '']);
      });
    });
  });
});
