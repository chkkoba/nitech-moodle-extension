// 'use strict';
import promiseWrapper from 'Lib/promiseWrapper.js';
// import $ from 'jQuery';

const defaultOptions = {
  optionsVersion: '0.0.0.1',
  extentionEnable: true,
  topPageEnable: true,
  backgroundColor: 'NavajoWhite',
  hideNavOnVideo: true,
};

// TODO: defaultOptionsと完全に同一かどうか不安になる。
const options = {
  optionsVersion: '0.0.0.1',
  extentionEnable: true,
  topPageEnable: true,
  backgroundColor: 'NavajoWhite',
  hideNavOnVideo: true,
};

const optionsUtils = {
  onLoad: () => {
    Object.assign(options, optionsUtils.getOptions());
    console.log('options: ', options);

    optionsUtils.generatePage(options);
  },

  getOptions: async () => {
    return await promiseWrapper.storage.local
      .get('options')
      .then(data => {
        return data.options;
      })
      .catch(error => {
        console.error(error);
        return defaultOptions;
      });
  },

  getDefaultOptions: () => {
    const copiedDefaultOptions = {};
    Object.assign(defaultOptions, copiedDefaultOptions);
    return copiedDefaultOptions; // TODO: defaultOptionsの中身が操作される…？
  },

  saveOptions: options => {
    // storageにデータを保存
    console.log('save options: ', options);
    promiseWrapper.storage.local.set({ options: options });
  },
};

export default optionsUtils;
