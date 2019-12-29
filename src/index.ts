import config from 'config';

import { IEpubConfig } from './epub/models';
import EpubWriter from './epub';

const epubConfig: IEpubConfig = config.get('epub');

const ew = new EpubWriter(epubConfig);
ew.write();
