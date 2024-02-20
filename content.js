const navLinks = document.querySelector(".navLinks");
var hidePostsButton = document.createElement("div");
hidePostsButton.innerHTML = `<span class="btn-wrap"><a class="button">Hide 1PBTID</a></span>`;
hidePostsButton.addEventListener("click", hidePosts);
navLinks.appendChild(hidePostsButton);

var resetHiddenPostsButton = document.createElement("div");
resetHiddenPostsButton.innerHTML = `<span class="btn-wrap"><a class="button">Show 1PBTID</a></span>`;
resetHiddenPostsButton.addEventListener("click", showPosts);
navLinks.appendChild(resetHiddenPostsButton);

const board = window.location.href
  .split("https://boards.4chan.org/")[1]
  .split("/")[0];

const storageItemKey = "4chan_1pbtid_" + board;
const threadsSavedInStorage = localStorage.getItem(storageItemKey)?.split(";");

var postsHiddenDiv = document.createElement("div");
navLinks.appendChild(postsHiddenDiv);

if (threadsSavedInStorage) {
  console.log("1pbtid threads: ", threadsSavedInStorage);
  threadsSavedInStorage.forEach((threadId) => {
    const thread = document.getElementById("thread-" + threadId);
    if (thread) thread.style.display = "none";
  });

  if (threadsSavedInStorage.length > 1)
    postsHiddenDiv.innerHTML = `<span>${threadsSavedInStorage.length} posts hidden</span>`;
}

function showPosts() {
  localStorage.setItem(storageItemKey, null);
  window.location.href = window.location.href;
}

function hidePosts() {
  fetch(window.location.href, {})
    .then((result) => result.text())
    .then(async (t) => {
      var catalogStart = t.indexOf("var catalog = {") + 14;

      var catalogFromStart = t.substring(catalogStart);

      var catalogEnd = catalogFromStart.indexOf("};") + 1;

      var catalog = catalogFromStart.substring(0, catalogEnd);

      var jsonCatalog = JSON.parse(catalog);

      var relevantThreads = Object.entries(jsonCatalog.threads).filter(
        (entry) => entry[1].r > 7
      );

      var hidCount = 0;
      localStorage.setItem(storageItemKey, "");

      for (var i = 0; i < relevantThreads.length; i++) {
        var threadId = relevantThreads[i][0];

        var res = await fetch(
          `https://boards.4chan.org/${board}/thread/${threadId}`,
          {
            body: null,
            method: "GET",
            mode: "cors",
          }
        );

        var text = await res.text();

        let fakeThreadDiv = document.createElement("div");
        fakeThreadDiv.innerHTML = text;

        let posterId = fakeThreadDiv.querySelector(".posteruid").classList[1];

        let postCount =
          fakeThreadDiv.getElementsByClassName(posterId).length / 2;

        console.log(threadId, postCount);

        if (postCount == 1) {
          document.getElementById("thread-" + threadId).style.display = "none";
          console.log(threadId + " HIDDEN!");
          hidCount++;
          postsHiddenDiv.innerHTML = `<span>${hidCount} posts hidden</span>`;
          localStorage.setItem(
            storageItemKey,
            localStorage.getItem(storageItemKey) + threadId + ";"
          );
        }
      }

      console.log("Total threads hidden: " + hidCount);
    });
}