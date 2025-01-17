export function isUndefined(value) {
  return typeof value === 'undefined';
}

export function isNullOrUndefined(o) {
  return typeof o === 'undefined' || o === null;
}

export function injectScript(code) {
  const script = document.createElement('script');
  script.textContent = code;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

// export function loadJson(filePath, callback) {
//   // chrome.runtime.getPackageDirectoryEntry(function (root) {
//   //   // get file
//   //   root.getFile(filePath, { create: false }, function (sample) {
//   //     // callback
//   //     sample.file(function (file) {
//   //       // read file
//   //       const reader = new FileReader();
//   //       reader.readAsText(file);
//   //       reader.addEventListener('load', function (e) {
//   //         // parse and return json
//   //         // const response = {
//   //         //   url: chrome.extension.getURL('data'),
//   //         //   settings: JSON.parse(e.target.result),
//   //         // };

//   //         const json = JSON.parse(e.target.result);
//   //         callback(json, chrome.extension.getURL('data'));
//   //       });
//   //     });
//   //   });
//   // });

//   // 上記コードに対して下を実装。未検証
//   loadFile(filePath, (result, url) => {
//     const json = JSON.parse(result);
//     callback(json, url);
//   });
// }

// export function loadFile(filePath, callback) {
// 動かない(APIが消えたみたい)
// chrome.runtime.getPackageDirectoryEntry(root => {
//   // get file
//   root.getFile(filePath, { create: false }, fileEntry => {
//     // callback
//     fileEntry.file(file => {
//       // read file
//       const reader = new FileReader();
//       reader.readAsText(file);
//       reader.addEventListener('load', e => {
//         callback(e.target.result);
//       });
//     });
//   });
// });
// }
