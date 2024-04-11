import globalChance, { Chance } from 'chance';
import {
  COLORS,
  COMMODITY_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
  COUNTRY_ISO_OPTIONS,
  CURRENCY_OPTIONS,
  INCOTERM_OPTIONS,
  RATE_TYPE_OPTIONS,
  STATUS_OPTIONS,
  TAXCODE_OPTIONS,
} from './static-data';
import { GridDataGeneratorContext } from './gridColDefGenerator';

const subSample = (l: any[], rate: number) => l.filter((v, i) => i % rate === 0);

const sampleRate = 3;
const EUR_USD_RATE = subSample(
  [
    1.076, 1.069, 1.074, 1.071, 1.073, 1.072, 1.075, 1.077, 1.081, 1.081, 1.077, 1.084, 1.086,
    1.087, 1.086, 1.092, 1.098, 1.096, 1.101, 1.103, 1.101, 1.106, 1.1, 1.097, 1.104, 1.103, 1.104,
    1.097, 1.105, 1.099, 1.097, 1.096, 1.097, 1.092, 1.099, 1.105, 1.099, 1.091, 1.086, 1.09, 1.092,
    1.09, 1.095, 1.09, 1.085, 1.091, 1.084, 1.084, 1.08, 1.077, 1.083, 1.086, 1.077, 1.072, 1.07,
    1.061, 1.058, 1.073, 1.073, 1.065, 1.058, 1.054, 1.055, 1.068,
  ],
  sampleRate,
);

const USD_JPY_RATE = subSample(
  [
    140.17, 138.734, 139.136, 139.793, 140.47, 140.881, 140.025, 139.29, 138.607, 138.662, 137.651,
    138.629, 137.604, 136.429, 136.029, 135.819, 134.479, 134.099, 135.281, 135.086, 135.191,
    134.16, 134.549, 136.468, 137.518, 136.384, 133.8, 133.465, 133.711, 134.083, 133.963, 133.996,
    134.711, 134.037, 134.457, 133.984, 132.492, 133.085, 133.6, 133.471, 132.097, 131.673, 130.934,
    131.432, 132.323, 133.348, 133.199, 132.543, 131.047, 131.239, 130.847, 130.867, 131.188,
    132.396, 131.399, 132.271, 133.366, 132.907, 134.428, 133.083, 134.95, 136.371, 137.23, 137.386,
    135.997,
  ],
  sampleRate,
);

const CNY_USD_RATE = subSample(
  [
    0.141, 0.141, 0.141, 0.141, 0.141, 0.142, 0.141, 0.141, 0.141, 0.142, 0.142, 0.142, 0.143,
    0.143, 0.144, 0.144, 0.144, 0.144, 0.144, 0.145, 0.145, 0.145, 0.145, 0.145, 0.145, 0.145,
    0.145, 0.144, 0.144, 0.145, 0.145, 0.146, 0.145, 0.146, 0.145, 0.146, 0.146, 0.146, 0.145,
    0.145, 0.146, 0.146, 0.145, 0.145, 0.145, 0.146, 0.146, 0.145, 0.146, 0.145, 0.146, 0.147,
    0.145, 0.145, 0.145, 0.145, 0.145, 0.145, 0.146, 0.146, 0.145, 0.144, 0.144, 0.144, 0.144,
  ],
  sampleRate,
);

const chanceId = globalChance();
let chance: Chance.Chance;

declare const DISABLE_CHANCE_RANDOM: any;

if (typeof DISABLE_CHANCE_RANDOM !== 'undefined' && DISABLE_CHANCE_RANDOM) {
  chance = globalChance(() => 0.5);
} else {
  chance = chanceId;
}

type ColumnDataGenerator<Value> = (data: any, context: GridDataGeneratorContext) => Value;

/**
 * Wrap a data generator that returns a string and add a prefix if the value generated has already been given
 */
const uniquenessHandler =
  (generator: ColumnDataGenerator<string>): ColumnDataGenerator<string> =>
  (data, context) => {
    const rawValue = generator(data, context);

    if (!context.values) {
      return rawValue;
    }

    const valueCount = (context.values[rawValue] ?? 0) + 1;
    context.values[rawValue] = valueCount + 1;

    if (valueCount > 1) {
      return `${rawValue} ${valueCount}`;
    }

    return rawValue;
  };

function dateFuture(years?: number, refDate?: string) {
  let date = new Date();
  if (typeof refDate !== 'undefined') {
    date = new Date(Date.parse(refDate));
  }

  const range = {
    min: 1000,
    max: (years || 1) * 365 * 24 * 3600 * 1000,
  };

  // some time from now to N years later, in milliseconds
  const past = date.getTime() + chance.integer(range);
  date.setTime(past);

  return date;
}

function dateRecent(days?: number, refDate?: string) {
  let date = new Date();
  if (typeof refDate !== 'undefined') {
    date = new Date(Date.parse(refDate));
  }

  const range = {
    min: 1000,
    max: (days || 1) * 24 * 3600 * 1000,
  };

  // some time from now to N days ago, in milliseconds
  const past = date.getTime() - chance.integer(range);
  date.setTime(past);

  return date;
}

function datePast(years?: number, refDate?: string) {
  let date = new Date();
  if (typeof refDate !== 'undefined') {
    date = new Date(Date.parse(refDate));
  }

  const range = {
    min: 1000,
    max: (years || 1) * 365 * 24 * 3600 * 1000,
  };

  // some time from now to N years ago, in milliseconds
  const past = date.getTime() - chance.integer(range);
  date.setTime(past);

  return date;
}

export const random = (min: number, max: number): number => chance.floating({ min, max });
export const randomInt = (min: number, max: number): number => chance.integer({ min, max });
export const randomPrice = (min = 0, max = 100000): number => Number(random(min, max).toFixed(2));
export const randomRate = (): number => random(0, 1);
export const randomDate = (start: Date, end: Date) =>
  new Date(
    start.getTime() + chance.floating({ min: 0, max: 1 }) * (end.getTime() - start.getTime()),
  );
export const randomArrayItem = <T>(arr: T[]) => arr[randomInt(0, arr.length - 1)];
export const randomBoolean = (): boolean => randomArrayItem([true, false]);

export const randomColor = () => randomArrayItem(COLORS);
export const randomId = () => chanceId.guid();
export const randomDesk = () => `D-${chance.integer({ min: 0, max: 10000 })}`;
export const randomCommodity = () => randomArrayItem(COMMODITY_OPTIONS);
export const randomTraderName = () => chance.name();
export const randomUserName = () => chance.twitter();
export const randomEmail = () => chance.email();
export const randomUrl = () => chance.url();
export const randomPhoneNumber = () => chance.phone();
export const randomUnitPrice = () => randomPrice(1, 100);
export const randomUnitPriceCurrency = () => randomArrayItem(CURRENCY_OPTIONS);
export const randomQuantity = () => randomInt(1000, 100000);
export const randomFeeRate = () => Number(random(0.1, 0.4).toFixed(3));
export const randomIncoterm = () => randomArrayItem(INCOTERM_OPTIONS);
export const randomStatusOptions = () => randomArrayItem(STATUS_OPTIONS);
export const randomPnL = () => random(-100000000, 100000000);
export const randomMaturityDate = () => dateFuture();
export const randomTradeDate = () => dateRecent();
export const randomBrokerId = () => chance.guid();
export const randomCompanyName = () => chance.company();
export const randomCountry = () => randomArrayItem(COUNTRY_ISO_OPTIONS);
export const randomCurrency = () => randomArrayItem(CURRENCY_OPTIONS);
export const randomAddress = () => chance.address();
export const randomCity = () => chance.city();
export const randomTaxCode = () => randomArrayItem(TAXCODE_OPTIONS);
export const randomContractType = () => randomArrayItem(CONTRACT_TYPE_OPTIONS);
export const randomRateType = () => randomArrayItem(RATE_TYPE_OPTIONS);
export const randomCreatedDate = () => datePast();
export const randomUpdatedDate = () => dateRecent();
export const randomJobTitle = () => chance.profession();
export const randomRating = () => randomInt(1, 5);
export const randomName = uniquenessHandler(() => chance.name());
export const randomCurencyRate = () => randomArrayItem([EUR_USD_RATE, USD_JPY_RATE, CNY_USD_RATE]);

export const generateFilledQuantity = (data: { quantity: number }) =>
  Number((data.quantity * randomRate()).toFixed()) / data.quantity;
export const generateIsFilled = (data: { quantity: number; filledQuantity: number }) =>
  data.quantity === data.filledQuantity;
