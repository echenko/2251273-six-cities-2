import { LocationType, UserType } from './index.type.js';

export type MockServerDataType = {
  titles: string[];
  types: string[];
  cites: string[];
  locations: {
    [key: string]: LocationType;
  };
  previewImages: string[];
  descriptions: string[];
  goods: string[];
  images: string[];
  users: {
    [key: string]: UserType;
  };
};
