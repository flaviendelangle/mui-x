import { expect } from 'chai';
import { act, fireEvent } from '@mui/internal-test-utils';
import { describeTreeView } from 'test/utils/tree-view/describeTreeView';
import { UseTreeViewLabelSignature } from '@mui/x-tree-view/internals';

describeTreeView<[UseTreeViewLabelSignature]>(
  'useTreeViewLabel plugin',
  ({ render, treeViewComponentName }) => {
    describe('interaction', () => {
      describe('render labelInput when needed', () => {
        it('should not render labelInput when double clicked if item is not editable', function test() {
          // This test is not relevant for the TreeItem component or the SimpleTreeView.
          if (treeViewComponentName.startsWith('SimpleTreeView')) {
            this.skip();
          }
          const response = render({
            experimentalFeatures: { labelEditing: true },
            items: [{ id: '1', editable: false }],
            isItemEditable: (item) => item.editable,
          });
          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.doubleClick(response.getItemLabel('1'));

          expect(response.getItemLabelInput('1')).to.equal(null);
        });

        it('should render labelInput when double clicked if item is editable', function test() {
          // This test is not relevant for the TreeItem component or the SimpleTreeView.
          if (treeViewComponentName.startsWith('SimpleTreeView')) {
            this.skip();
          }
          const response = render({
            experimentalFeatures: { labelEditing: true },
            items: [{ id: '1', editable: true }],
            isItemEditable: (item) => item.editable,
          });
          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.doubleClick(response.getItemLabel('1'));

          expect(response.getItemLabelInput('1')).not.to.equal(null);
        });

        it('should not render label when double clicked if item is editable', function test() {
          // This test is not relevant for the TreeItem component or the SimpleTreeView.
          if (treeViewComponentName.startsWith('SimpleTreeView')) {
            this.skip();
          }
          const response = render({
            experimentalFeatures: { labelEditing: true },
            items: [{ id: '1', editable: true }],
            isItemEditable: (item) => item.editable,
          });
          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.doubleClick(response.getItemLabel('1'));

          expect(response.getItemLabel('1')).to.equal(null);
        });

        it('should not render labelInput on Enter if item is not editable', function test() {
          // This test is not relevant for the TreeItem component or the SimpleTreeView.
          if (treeViewComponentName.startsWith('SimpleTreeView')) {
            this.skip();
          }
          const response = render({
            experimentalFeatures: { labelEditing: true },
            items: [{ id: '1', editable: false }],
            isItemEditable: (item) => item.editable,
          });
          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: 'Enter' });

          expect(response.getItemLabelInput('1')).to.equal(null);
          expect(response.getItemLabel('1')).not.to.equal(null);
        });

        it('should render labelInput on Enter if item is editable', function test() {
          // This test is not relevant for the TreeItem component or the SimpleTreeView.
          if (treeViewComponentName.startsWith('SimpleTreeView')) {
            this.skip();
          }
          const response = render({
            experimentalFeatures: { labelEditing: true },
            items: [{ id: '1', editable: true }],
            isItemEditable: (item) => item.editable,
          });
          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: 'Enter' });

          expect(response.getItemLabelInput('1')).not.to.equal(null);
        });

        it('should unmount labelInput after save', function test() {
          // This test is not relevant for the TreeItem component or the SimpleTreeView.
          if (treeViewComponentName.startsWith('SimpleTreeView')) {
            this.skip();
          }
          const response = render({
            experimentalFeatures: { labelEditing: true },
            items: [{ id: '1', label: 'test', editable: true }],
            isItemEditable: (item) => item.editable,
          });
          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.doubleClick(response.getItemLabel('1'));
          fireEvent.keyDown(response.getItemLabelInput('1'), { key: 'Enter' });

          expect(response.getItemLabelInput('1')).to.equal(null);
          expect(response.getItemLabel('1')).not.to.equal(null);
        });

        it('should unmount labelInput after cancel', function test() {
          // This test is not relevant for the TreeItem component or the SimpleTreeView.
          if (treeViewComponentName.startsWith('SimpleTreeView')) {
            this.skip();
          }
          const response = render({
            experimentalFeatures: { labelEditing: true },
            items: [{ id: '1', label: 'test', editable: true }],
            isItemEditable: (item) => item.editable,
          });
          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.doubleClick(response.getItemLabel('1'));
          fireEvent.keyDown(response.getItemLabelInput('1'), { key: 'Esc' });

          expect(response.getItemLabelInput('1')).to.equal(null);
          expect(response.getItemLabel('1')).not.to.equal(null);
        });
      });

      describe('labelInput value', () => {
        it('should equal label value on first render', function test() {
          // This test is not relevant for the TreeItem component or the SimpleTreeView.
          if (treeViewComponentName.startsWith('SimpleTreeView')) {
            this.skip();
          }
          const response = render({
            experimentalFeatures: { labelEditing: true },
            items: [{ id: '1', label: 'test', editable: true }],
            isItemEditable: (item) => item.editable,
          });
          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.doubleClick(response.getItemLabel('1'));

          expect(response.getItemLabelInput('1').value).to.equal('test');
        });

        it('should save new value on Enter', function test() {
          // This test is not relevant for the TreeItem component or the SimpleTreeView.
          if (treeViewComponentName.startsWith('SimpleTreeView')) {
            this.skip();
          }
          const response = render({
            experimentalFeatures: { labelEditing: true },
            items: [{ id: '1', label: 'test', editable: true }],
            isItemEditable: (item) => item.editable,
          });
          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.doubleClick(response.getItemLabel('1'));
          fireEvent.change(response.getItemLabelInput('1'), { target: { value: 'new value' } });
          fireEvent.keyDown(response.getItemLabelInput('1'), { key: 'Enter' });

          expect(response.getItemLabel('1').textContent).to.equal('new value');
        });

        it('should hold new value on render after save', function test() {
          // This test is not relevant for the TreeItem component or the SimpleTreeView.
          if (treeViewComponentName.startsWith('SimpleTreeView')) {
            this.skip();
          }
          const response = render({
            experimentalFeatures: { labelEditing: true },
            items: [{ id: '1', label: 'test', editable: true }],
            isItemEditable: (item) => item.editable,
          });
          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.doubleClick(response.getItemLabel('1'));
          fireEvent.change(response.getItemLabelInput('1'), { target: { value: 'new value' } });
          fireEvent.keyDown(response.getItemLabelInput('1'), { key: 'Enter' });
          fireEvent.doubleClick(response.getItemLabel('1'));

          expect(response.getItemLabelInput('1').value).to.equal('new value');
        });

        it('should hold initial value on render after cancel', function test() {
          // This test is not relevant for the TreeItem component or the SimpleTreeView.
          if (treeViewComponentName.startsWith('SimpleTreeView')) {
            this.skip();
          }
          const response = render({
            experimentalFeatures: { labelEditing: true },
            items: [{ id: '1', label: 'test', editable: true }],
            isItemEditable: (item) => item.editable,
          });
          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.doubleClick(response.getItemLabel('1'));
          fireEvent.change(response.getItemLabelInput('1'), { target: { value: 'new value' } });
          fireEvent.keyDown(response.getItemLabelInput('1'), { key: 'Esc' });
          expect(response.getItemLabel('1').textContent).to.equal('test');

          fireEvent.doubleClick(response.getItemLabel('1'));
          expect(response.getItemLabelInput('1').value).to.equal('test');
        });
      });
    });
    describe('updateItemLabel api method', () => {
      it('should change the label value', function test() {
        // This test is not relevant for the TreeItem component or the SimpleTreeView.
        if (treeViewComponentName.startsWith('SimpleTreeView')) {
          this.skip();
        }
        const response = render({
          items: [{ id: '1', label: 'test' }],
        });

        act(() => {
          response.apiRef.current.updateItemLabel('1', 'new value');
        });

        expect(response.getItemLabel('1').textContent).to.equal('new value');
      });
    });
  },
);
