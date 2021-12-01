import { createRenderer, fireEvent, screen } from '@material-ui/monorepo/test/utils';
import { getColumnHeadersTextContent, getColumnValues, raf } from 'test/utils/helperFn';
import * as React from 'react';
import { expect } from 'chai';
import {
  DataGridPro,
  DataGridProProps,
  GridApiRef,
  GridKeyGetterParams,
  GridPreferencePanelsValue,
  GridRowsProp,
  useGridApiRef,
} from '@mui/x-data-grid-pro';
import { spy } from 'sinon';

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

const rows: GridRowsProp = [
  { id: 0, category1: 'Cat A', category2: 'Cat 1' },
  { id: 1, category1: 'Cat A', category2: 'Cat 2' },
  { id: 2, category1: 'Cat A', category2: 'Cat 2' },
  { id: 3, category1: 'Cat B', category2: 'Cat 2' },
  { id: 4, category1: 'Cat B', category2: 'Cat 1' },
];

const baselineProps: DataGridProProps = {
  autoHeight: isJSDOM,
  disableVirtualization: true,
  rows,
  columns: [
    {
      field: 'id',
      type: 'number',
    },
    {
      field: 'category1',
    },
    {
      field: 'category2',
    },
  ],
};
const GROUPING_COLS_SINGLE_CAT_1 = ['Cat A (3)', '', '', '', 'Cat B (2)', '', ''];

const GROUPING_COLS_SINGLE_CAT_2 = ['Cat 1 (2)', '', '', 'Cat 2 (3)', '', '', ''];

const GROUPING_COLS_SINGLE_CAT_2_CAT_1 = [
  'Cat 1 (2)',
  'Cat A (1)',
  '',
  'Cat B (1)',
  '',
  'Cat 2 (3)',
  'Cat A (2)',
  '',
  '',
  'Cat B (1)',
  '',
];
const GROUPING_COLS_SINGLE_CAT_1_CAT_2 = [
  'Cat A (3)',
  'Cat 1 (1)',
  '',
  'Cat 2 (2)',
  '',
  '',
  'Cat B (2)',
  'Cat 2 (1)',
  '',
  'Cat 1 (1)',
  '',
];
const GROUPING_COLS_MULTIPLE_CAT_1_CAT_2 = [
  ['Cat A (3)', '', '', '', '', '', 'Cat B (2)', '', '', '', ''],
  ['', 'Cat 1 (1)', '', 'Cat 2 (2)', '', '', '', 'Cat 2 (1)', '', 'Cat 1 (1)', ''],
];
const GROUPING_COLS_MULTIPLE_CAT_2_CAT_1 = [
  ['Cat 1 (2)', '', '', '', '', 'Cat 2 (3)', '', '', '', '', ''],
  ['', 'Cat A (1)', '', 'Cat B (1)', '', '', 'Cat A (2)', '', '', 'Cat B (1)', ''],
];

describe('<DataGridPro /> - Group Rows By Column', () => {
  const { render, clock } = createRenderer();

  let apiRef: GridApiRef;

  const Test = (props: Partial<DataGridProProps>) => {
    apiRef = useGridApiRef();

    return (
      <div style={{ width: 300, height: 300 }}>
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
              keyGetter: (params: GridKeyGetterParams<string>) => `key ${params.value}`,
            },
          ]}
          initialState={{ groupingColumns: { model: ['category1'] } }}
          defaultGroupingExpansionDepth={-1}
        />,
      );
      expect(getColumnValues(0)).to.deep.equal([
        'key Cat A (3)',
        '',
        '',
        '',
        'key Cat B (2)',
        '',
        '',
      ]);
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

  describe('prop: defaultGroupingExpansionDepth', () => {
    it('should not expand any row if defaultGroupingExpansionDepth = 0', () => {
      render(
        <Test
          defaultGroupingExpansionDepth={0}
          groupingColDef={{ leafField: 'id' }}
          initialState={{ groupingColumns: { model: ['category1', 'category2'] } }}
        />,
      );
      expect(getColumnValues(0)).to.deep.equal(['Cat A (3)', 'Cat B (2)']);
    });

    it('should expand all top level rows if defaultGroupingExpansionDepth = 1', () => {
      render(
        <Test
          defaultGroupingExpansionDepth={1}
          groupingColDef={{ leafField: 'id' }}
          initialState={{ groupingColumns: { model: ['category1', 'category2'] } }}
        />,
      );
      expect(getColumnValues(0)).to.deep.equal([
        'Cat A (3)',
        'Cat 1 (1)',
        'Cat 2 (2)',
        'Cat B (2)',
        'Cat 2 (1)',
        'Cat 1 (1)',
      ]);
    });

    it('should expand all rows up to depth of 2 if defaultGroupingExpansionDepth = 2', () => {
      render(
        <Test
          defaultGroupingExpansionDepth={2}
          groupingColDef={{ leafField: 'id' }}
          initialState={{ groupingColumns: { model: ['category1', 'category2'] } }}
        />,
      );
      expect(getColumnValues(0)).to.deep.equal([
        'Cat A (3)',
        'Cat 1 (1)',
        '0',
        'Cat 2 (2)',
        '1',
        '2',
        'Cat B (2)',
        'Cat 2 (1)',
        '3',
        'Cat 1 (1)',
        '4',
      ]);
    });

    it('should expand all rows if defaultGroupingExpansionDepth = -1', () => {
      render(
        <Test
          defaultGroupingExpansionDepth={-1}
          groupingColDef={{ leafField: 'id' }}
          initialState={{ groupingColumns: { model: ['category1', 'category2'] } }}
        />,
      );
      expect(getColumnValues(0)).to.deep.equal([
        'Cat A (3)',
        'Cat 1 (1)',
        '0',
        'Cat 2 (2)',
        '1',
        '2',
        'Cat B (2)',
        'Cat 2 (1)',
        '3',
        'Cat 1 (1)',
        '4',
      ]);
    });

    it('should not re-apply default expansion on rerender after expansion manually toggled', async () => {
      const { setProps } = render(
        <Test
          groupingColDef={{ leafField: 'id', mainGroupingCriteria: 'category1' }}
          initialState={{ groupingColumns: { model: ['category1', 'category2'] } }}
        />,
      );
      expect(getColumnValues(0)).to.deep.equal(['Cat A (3)', 'Cat B (2)']);
      apiRef.current.setRowChildrenExpansion('auto-generated-row-category1/Cat B', true);
      await raf();
      expect(getColumnValues(0)).to.deep.equal([
        'Cat A (3)',
        'Cat B (2)',
        'Cat 2 (1)',
        'Cat 1 (1)',
      ]);
      setProps({ sortModel: [{ field: '__row_group_by_columns_group__', sort: 'desc' }] });
      expect(getColumnValues(0)).to.deep.equal([
        'Cat B (2)',
        'Cat 2 (1)',
        'Cat 1 (1)',
        'Cat A (3)',
      ]);
    });
  });

  describe('props: groupingColDef', () => {
    describe('props: groupingColumnMode = "single"', () => {
      it('should not allow to override the field', () => {
        render(
          <Test
            initialState={{ groupingColumns: { model: ['category1'] } }}
            groupingColumnMode="multiple"
            groupingColDef={{
              // @ts-expect-error
              field: 'custom-field',
            }}
          />,
        );

        expect(apiRef.current.getAllColumns()[0].field).to.equal(
          '__row_group_by_columns_group_category1__',
        );
      });

      it('should allow to override the headerName in object mode', () => {
        render(
          <Test
            initialState={{ groupingColumns: { model: ['category1', 'category2'] } }}
            groupingColumnMode="single"
            groupingColDef={{
              headerName: 'Main category',
            }}
          />,
        );

        expect(getColumnHeadersTextContent()).to.deep.equal([
          'Main category',
          'id',
          'category1',
          'category2',
        ]);
      });

      it('should allow to override the headerName in callback mode', () => {
        render(
          <Test
            initialState={{ groupingColumns: { model: ['category1', 'category2'] } }}
            groupingColumnMode="single"
            groupingColDef={(params) =>
              params.sources.some((colDef) => colDef.field === 'category1')
                ? {
                    headerName: 'Main category',
                  }
                : {}
            }
          />,
        );

        expect(getColumnHeadersTextContent()).to.deep.equal([
          'Main category',
          'id',
          'category1',
          'category2',
        ]);
      });
    });

    describe('props: groupingColumnMode = "multiple"', () => {
      it('should not allow to override the field', () => {
        render(
          <Test
            initialState={{ groupingColumns: { model: ['category1'] } }}
            groupingColumnMode="single"
            groupingColDef={{
              // @ts-expect-error
              field: 'custom-field',
            }}
          />,
        );

        expect(apiRef.current.getAllColumns()[0].field).to.equal('__row_group_by_columns_group__');
      });

      it('should allow to override the headerName in object mode', () => {
        render(
          <Test
            initialState={{ groupingColumns: { model: ['category1', 'category2'] } }}
            groupingColumnMode="multiple"
            groupingColDef={{
              headerName: 'Main category',
            }}
          />,
        );

        expect(getColumnHeadersTextContent()).to.deep.equal([
          'Main category',
          'Main category',
          'id',
          'category1',
          'category2',
        ]);
      });

      it('should allow to override the headerName in callback mode', () => {
        render(
          <Test
            initialState={{ groupingColumns: { model: ['category1', 'category2'] } }}
            groupingColumnMode="multiple"
            groupingColDef={(params) =>
              params.sources.some((colDef) => colDef.field === 'category1')
                ? {
                    headerName: 'Main category',
                  }
                : {}
            }
          />,
        );

        expect(getColumnHeadersTextContent()).to.deep.equal([
          'Main category',
          'category2',
          'id',
          'category1',
          'category2',
        ]);
      });
    });
  });

  describe('sorting', () => {
    describe('props: groupingColumnMode = "single"', () => {
      it('should use the top level grouping criteria for sorting if mainGroupingCriteria and leafField are not defined', () => {
        render(
          <Test
            initialState={{ groupingColumns: { model: ['category1', 'category2'] } }}
            groupingColumnMode="single"
            sortModel={[{ field: '__row_group_by_columns_group__', sort: 'desc' }]}
            defaultGroupingExpansionDepth={-1}
          />,
        );

        expect(getColumnValues(0)).to.deep.equal([
          'Cat B (2)',
          'Cat 2 (1)',
          '',
          'Cat 1 (1)',
          '',
          'Cat A (3)',
          'Cat 1 (1)',
          '',
          'Cat 2 (2)',
          '',
          '',
        ]);
      });

      it('should use the column grouping criteria for sorting if mainGroupingCriteria is one of the grouping criteria and leaf field is defined', () => {
        render(
          <Test
            initialState={{ groupingColumns: { model: ['category1', 'category2'] } }}
            groupingColumnMode="single"
            groupingColDef={{
              leafField: 'id',
              mainGroupingCriteria: 'category2',
            }}
            sortModel={[{ field: '__row_group_by_columns_group__', sort: 'desc' }]}
            defaultGroupingExpansionDepth={-1}
          />,
        );
        expect(getColumnValues(0)).to.deep.equal([
          'Cat A (3)',
          'Cat 2 (2)',
          '1',
          '2',
          'Cat 1 (1)',
          '0',
          'Cat B (2)',
          'Cat 2 (1)',
          '3',
          'Cat 1 (1)',
          '4',
        ]);
      });

      it('should use the leaf field for sorting if mainGroupingCriteria is not defined and leaf field is defined', () => {
        render(
          <Test
            initialState={{ groupingColumns: { model: ['category1', 'category2'] } }}
            groupingColumnMode="single"
            groupingColDef={{
              leafField: 'id',
            }}
            sortModel={[{ field: '__row_group_by_columns_group__', sort: 'desc' }]}
            defaultGroupingExpansionDepth={-1}
          />,
        );

        expect(getColumnValues(0)).to.deep.equal([
          'Cat A (3)',
          'Cat 1 (1)',
          '0',
          'Cat 2 (2)',
          '2',
          '1',
          'Cat B (2)',
          'Cat 2 (1)',
          '3',
          'Cat 1 (1)',
          '4',
        ]);
      });

      it('should use the leaf field for sorting if mainGroupingCriteria is not one of the grouping criteria and leaf field is defined', () => {
        render(
          <Test
            initialState={{ groupingColumns: { model: ['category1', 'category2'] } }}
            groupingColumnMode="single"
            groupingColDef={{
              leafField: 'id',
              mainGroupingCriteria: 'category3',
            }}
            sortModel={[{ field: '__row_group_by_columns_group__', sort: 'desc' }]}
            defaultGroupingExpansionDepth={-1}
          />,
        );

        expect(getColumnValues(0)).to.deep.equal([
          'Cat A (3)',
          'Cat 1 (1)',
          '0',
          'Cat 2 (2)',
          '2',
          '1',
          'Cat B (2)',
          'Cat 2 (1)',
          '3',
          'Cat 1 (1)',
          '4',
        ]);
      });
    });

    describe('props: groupingColumnMode = "multiple"', () => {
      it('should use the column grouping criteria for sorting if mainGroupingCriteria and leafField are not defined', () => {
        render(
          <Test
            initialState={{ groupingColumns: { model: ['category1'] } }}
            groupingColumnMode="multiple"
            sortModel={[{ field: '__row_group_by_columns_group_category1__', sort: 'desc' }]}
            defaultGroupingExpansionDepth={-1}
          />,
        );

        expect(getColumnValues(0)).to.deep.equal(['Cat B (2)', '', '', 'Cat A (3)', '', '', '']);
      });

      it('should use the column grouping criteria for sorting if mainGroupingCriteria matches the column grouping criteria and leaf field is defined', () => {
        render(
          <Test
            initialState={{ groupingColumns: { model: ['category1'] } }}
            groupingColumnMode="multiple"
            groupingColDef={{
              leafField: 'id',
              mainGroupingCriteria: 'category1',
            }}
            sortModel={[{ field: '__row_group_by_columns_group_category1__', sort: 'desc' }]}
            defaultGroupingExpansionDepth={-1}
          />,
        );

        expect(getColumnValues(0)).to.deep.equal([
          'Cat B (2)',
          '3',
          '4',
          'Cat A (3)',
          '0',
          '1',
          '2',
        ]);
      });

      it('should use the leaf field for sorting if mainGroupingCriteria is not defined and leaf field is defined', () => {
        render(
          <Test
            initialState={{ groupingColumns: { model: ['category1'] } }}
            groupingColumnMode="multiple"
            groupingColDef={{
              leafField: 'id',
            }}
            sortModel={[{ field: '__row_group_by_columns_group_category1__', sort: 'desc' }]}
            defaultGroupingExpansionDepth={-1}
          />,
        );

        expect(getColumnValues(0)).to.deep.equal([
          'Cat A (3)',
          '2',
          '1',
          '0',
          'Cat B (2)',
          '4',
          '3',
        ]);
      });

      it("should use the leaf field for sorting if mainGroupingCriteria doesn't match the column grouping criteria and leaf field is defined", () => {
        render(
          <Test
            initialState={{ groupingColumns: { model: ['category1'] } }}
            groupingColumnMode="multiple"
            groupingColDef={{
              leafField: 'id',
              mainGroupingCriteria: 'category2',
            }}
            sortModel={[{ field: '__row_group_by_columns_group_category1__', sort: 'desc' }]}
            defaultGroupingExpansionDepth={-1}
          />,
        );

        expect(getColumnValues(0)).to.deep.equal([
          'Cat A (3)',
          '2',
          '1',
          '0',
          'Cat B (2)',
          '4',
          '3',
        ]);
      });
    });
  });

  describe('filtering', () => {
    clock.withFakeTimers();

    describe('props: groupingColumnMode = "single"', () => {
      it('should use the top level grouping criteria for filtering if mainGroupingCriteria and leafField are not defined', () => {
        render(
          <Test
            initialState={{
              groupingColumns: { model: ['category1', 'category2'] },
              preferencePanel: { open: true, openedPanelValue: GridPreferencePanelsValue.filters },
            }}
            groupingColumnMode="single"
            defaultGroupingExpansionDepth={-1}
          />,
        );

        fireEvent.change(screen.getByRole('textbox', { name: 'Value' }), {
          target: { value: 'Cat A' },
        });
        clock.tick(500);

        expect(getColumnValues(0)).to.deep.equal([
          'Cat A (3)',
          'Cat 1 (1)',
          '',
          'Cat 2 (2)',
          '',
          '',
        ]);
      });

      it('should use the column grouping criteria for filtering if mainGroupingCriteria is one of the grouping criteria and leaf field is defined', () => {
        render(
          <Test
            initialState={{
              groupingColumns: { model: ['category1', 'category2'] },
              preferencePanel: { open: true, openedPanelValue: GridPreferencePanelsValue.filters },
            }}
            groupingColumnMode="single"
            groupingColDef={{
              leafField: 'id',
              mainGroupingCriteria: 'category2',
            }}
            defaultGroupingExpansionDepth={-1}
          />,
        );

        fireEvent.change(screen.getByRole('textbox', { name: 'Value' }), {
          target: { value: 'Cat 1' },
        });
        clock.tick(500);

        expect(getColumnValues(0)).to.deep.equal([
          'Cat A (1)',
          'Cat 1 (1)',
          '0',
          'Cat B (1)',
          'Cat 1 (1)',
          '4',
        ]);
      });

      it('should use the leaf field for filtering if mainGroupingCriteria is not defined and leaf field is defined', () => {
        render(
          <Test
            initialState={{
              groupingColumns: { model: ['category1', 'category2'] },
              preferencePanel: { open: true, openedPanelValue: GridPreferencePanelsValue.filters },
            }}
            groupingColumnMode="single"
            groupingColDef={{
              leafField: 'id',
            }}
            defaultGroupingExpansionDepth={-1}
          />,
        );

        fireEvent.change(screen.getByRole('combobox', { name: 'Operators' }), {
          target: { value: '>' },
        });
        fireEvent.change(screen.getByRole('spinbutton', { name: 'Value' }), {
          target: { value: 2 },
        });
        clock.tick(500);

        expect(getColumnValues(0)).to.deep.equal(['Cat B (2)', 'Cat 2 (1)', '3', 'Cat 1 (1)', '4']);
      });

      it('should use the leaf field for filtering if mainGroupingCriteria is not one of the grouping criteria and leaf field is defined', () => {
        render(
          <Test
            initialState={{
              groupingColumns: { model: ['category1', 'category2'] },
              preferencePanel: { open: true, openedPanelValue: GridPreferencePanelsValue.filters },
            }}
            groupingColumnMode="single"
            groupingColDef={{
              leafField: 'id',
              mainGroupingCriteria: 'category3',
            }}
            defaultGroupingExpansionDepth={-1}
          />,
        );

        fireEvent.change(screen.getByRole('combobox', { name: 'Operators' }), {
          target: { value: '>' },
        });
        fireEvent.change(screen.getByRole('spinbutton', { name: 'Value' }), {
          target: { value: 2 },
        });
        clock.tick(500);

        expect(getColumnValues(0)).to.deep.equal(['Cat B (2)', 'Cat 2 (1)', '3', 'Cat 1 (1)', '4']);
      });
    });

    describe('props: groupingColumnMode = "multiple"', () => {
      it('should use the column grouping criteria for filtering if mainGroupingCriteria and leafField are not defined', () => {
        render(
          <Test
            initialState={{
              groupingColumns: { model: ['category1'] },
              preferencePanel: { open: true, openedPanelValue: GridPreferencePanelsValue.filters },
            }}
            groupingColumnMode="multiple"
            defaultGroupingExpansionDepth={-1}
          />,
        );

        fireEvent.change(screen.getByRole('textbox', { name: 'Value' }), {
          target: { value: 'Cat A' },
        });
        clock.tick(500);

        expect(getColumnValues(0)).to.deep.equal(['Cat A (3)', '', '', '']);
        expect(getColumnValues(1)).to.deep.equal(['', '0', '1', '2']);
      });

      it('should use the column grouping criteria for filtering if mainGroupingCriteria matches the column grouping criteria and leaf field is defined', () => {
        render(
          <Test
            initialState={{
              groupingColumns: { model: ['category1'] },
              preferencePanel: { open: true, openedPanelValue: GridPreferencePanelsValue.filters },
            }}
            groupingColumnMode="multiple"
            groupingColDef={{
              leafField: 'id',
              mainGroupingCriteria: 'category1',
            }}
            defaultGroupingExpansionDepth={-1}
          />,
        );

        fireEvent.change(screen.getByRole('textbox', { name: 'Value' }), {
          target: { value: 'Cat A' },
        });
        clock.tick(500);

        expect(getColumnValues(0)).to.deep.equal(['Cat A (3)', '0', '1', '2']);
      });

      it('should use the leaf field for filtering if mainGroupingCriteria is not defined and leaf field is defined', () => {
        render(
          <Test
            initialState={{
              groupingColumns: { model: ['category1'] },
              preferencePanel: { open: true, openedPanelValue: GridPreferencePanelsValue.filters },
            }}
            groupingColumnMode="multiple"
            groupingColDef={{
              leafField: 'id',
            }}
            defaultGroupingExpansionDepth={-1}
          />,
        );

        fireEvent.change(screen.getByRole('combobox', { name: 'Operators' }), {
          target: { value: '>' },
        });
        fireEvent.change(screen.getByRole('spinbutton', { name: 'Value' }), {
          target: { value: 2 },
        });
        clock.tick(500);

        expect(getColumnValues(0)).to.deep.equal(['Cat B (2)', '3', '4']);
      });

      it("should use the leaf field for filtering if mainGroupingCriteria doesn't match the column grouping criteria and leaf field is defined", () => {
        render(
          <Test
            initialState={{
              groupingColumns: { model: ['category1'] },
              preferencePanel: { open: true, openedPanelValue: GridPreferencePanelsValue.filters },
            }}
            groupingColumnMode="multiple"
            groupingColDef={{
              leafField: 'id',
              mainGroupingCriteria: 'category2',
            }}
            defaultGroupingExpansionDepth={-1}
          />,
        );

        fireEvent.change(screen.getByRole('combobox', { name: 'Operators' }), {
          target: { value: '>' },
        });
        fireEvent.change(screen.getByRole('spinbutton', { name: 'Value' }), {
          target: { value: 2 },
        });
        clock.tick(500);

        expect(getColumnValues(0)).to.deep.equal(['Cat B (2)', '3', '4']);
      });
    });
  });
});
