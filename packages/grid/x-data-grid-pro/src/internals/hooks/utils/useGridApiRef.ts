import * as React from 'react';
import { GridApiCommon } from '@mui/x-data-grid/internals';
import { useGridApiRef as useCommunityGridApiRef } from '@mui/x-data-grid/internals/hooks/utils/useGridApiRef';
import { GridApiPro } from '../../models/gridApiPro';

export const useGridApiRef = useCommunityGridApiRef as <
  Api extends GridApiCommon = GridApiPro,
>() => React.MutableRefObject<Api>;
