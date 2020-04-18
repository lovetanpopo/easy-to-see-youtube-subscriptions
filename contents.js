/*

storageの管理

key: hiddenInfo
value: StrageObj[]

{
  watchParam: "v=hogeFuga999", // 動画IDのパラメータ
  insertTime: 123456789        // 削除登録日( Date.getTime )
}

storageがどんどん大きくなるので、一週間経ったものは消していく
7 * 24 * 60 * 60 * 1000

サイトに訪れたときと、見ないボタンを押した時に、
”storageの整理”と”動画の非表示”を行う。

*/


// 各サムネイルに「見ない」ボタンをつける
// 「見ない」ボタンは、サムネイルへマウスオーバーしたタイミングで表示される
const thumbnails = document.getElementsByClassName("yt-simple-endpoint inline-block style-scope ytd-thumbnail");
for (var i = 0; i < thumbnails.length; ++i) {
  const node = document.createElement("button");
  node.innerText = "見ない";
  node.addEventListener("click", event => {
    event.stopPropagation();
    event.preventDefault();
    saveStorage(node.url);
  });
  thumbnails[i].appendChild(node);

  // mouseenter / mouseleave
  // mouseover / mouseout
  thumbnails[i].addEventListener("mouseover", event => {
    node.style.position = "absolute";
    node.url = event.currentTarget.href;
  });
  thumbnails[i].addEventListener("mouseout", event => {
    node.style.position = null;
  });
}

// 非表示URLを保存
const saveStorage = url => {
  const regex = /v=[0-9a-zA-Z_-]+/g;
  const watchParam = url.match(regex)[0];
  const insertTime = (new Date()).getTime();

  hiddenInfo = [...hiddenInfo, {watchParam, insertTime}];
  hidden();
}

let hiddenInfo = [];

const hidden = () => {
  // watchParamsだけを抽出
  runHidden(
    hiddenInfo.map(obj => obj.watchParam)
  );

  // 古いデータを削除
  const now = (new Date()).getTime();
  hiddenInfo = hiddenInfo.filter(obj => obj.insertTime + (7 * 24 * 60 * 60 * 1000) > now);
  chrome.storage.local.set({"hiddenInfo": hiddenInfo});
};

// 非表示処理
const runHidden = watchParams => {
  const elems = document.getElementsByTagName("ytd-grid-video-renderer");
  for (var i = 0; i < elems.length; ++i) {
    const thumbnail = elems[i].getElementsByClassName("yt-simple-endpoint inline-block style-scope ytd-thumbnail")[0];
    if (watchParams.find(watchParam => thumbnail.href.indexOf(watchParam) !== -1)) {
      elems[i].style.display = "none";
    }
  }
};

// hiddenInfoに記載のある要素をdisable化
chrome.storage.local.get(["hiddenInfo"], result => {
  if (result.hiddenInfo === undefined) {
    chrome.storage.local.set({"hiddenInfo": []});
  } else {
    hiddenInfo = result.hiddenInfo;
    hidden();
  }
});

// ======
(() => {
  const container = document.getElementById("title-container");
  const reset = document.createElement("button");
  reset.innerText = "隠れてる要素を出す";
  reset.addEventListener("click", () => {
    const elems = document.getElementsByTagName("ytd-grid-video-renderer");
    for (var i = 0; i < elems.length; ++i) {
      elems[i].style.display = "block";
    }
  });
  container.appendChild(reset);
})();
