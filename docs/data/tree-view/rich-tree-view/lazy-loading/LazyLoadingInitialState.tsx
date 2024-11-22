import * as React from 'react';
import Box from '@mui/material/Box';
import {
  randomInt,
  randomName,
  randomId,
  randomBoolean,
} from '@mui/x-data-grid-generator';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';

type ItemType = TreeViewBaseItem<{
  id: string;
  label: string;
  childrenCount?: number;
}>;

const initialItems: ItemType[] = [
  { id: '1', label: 'Amy Harris', childrenCount: randomInt(1, 5) },
  { id: '2', label: 'Sam Smith', childrenCount: randomInt(1, 5) },
  { id: '3', label: 'Jordan Miles', childrenCount: randomInt(1, 5) },
  { id: '4', label: 'Amalia Brown', childrenCount: randomInt(1, 5) },
];

const fetchData = async (): Promise<ItemType[]> => {
  const length: number = randomInt(2, 10);
  const rows = Array.from({ length }, () => ({
    id: randomId(),
    label: randomName({}, {}),
    ...(randomBoolean() ? { childrenCount: length } : {}),
  }));

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(rows);
    }, 1000);
  });
};

export default function LazyLoadingInitialState() {
  return (
    <Box sx={{ width: '300px' }}>
      <RichTreeView
        items={initialItems}
        experimentalFeatures={{ lazyLoading: true }}
        treeViewDataSource={{
          getChildrenCount: (item) => item?.childrenCount as number,
          getTreeItems: fetchData,
        }}
      />
    </Box>
  );
}
