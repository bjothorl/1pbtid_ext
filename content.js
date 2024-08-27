const navLinks = document.querySelector(".navLinks");

const hidePostButtonAndInputs = document.createElement("div");
hidePostButtonAndInputs.innerHTML = `<span id="pbtid_hideButton" class="btn-wrap"><a class="button">Hide 1PBTID</a></span><span style="margin: 0 5px 0 5px">pbtid count:</span><input id="pbtid_pbtidCountInput" value="${
  localStorage.getItem("1pbtid_pbtidCount") ?? 1
}" style="width: 50px"/><span style="margin: 0 5px 0 5px">reply count:</span><input id="pbtid_replyCountInput" value="${
  localStorage.getItem("1pbtid_replyCount") ?? 7
}" style="width: 50px"/>`;
navLinks.appendChild(hidePostButtonAndInputs);

document
  .getElementById("pbtid_hideButton")
  .addEventListener("click", hidePosts);

const replyCountInput = document.getElementById("pbtid_replyCountInput");
replyCountInput.addEventListener("input", () => {
  localStorage.setItem("1pbtid_replyCount", replyCountInput.value);
});

const pbtidCountInput = document.getElementById("pbtid_pbtidCountInput");
pbtidCountInput.addEventListener("input", () => {
  localStorage.setItem("1pbtid_pbtidCount", pbtidCountInput.value);
});

const resetHiddenPostsButton = document.createElement("div");
resetHiddenPostsButton.innerHTML = `<span class="btn-wrap"><a class="button">Show 1PBTID</a></span>`;
resetHiddenPostsButton.addEventListener("click", showPosts);
navLinks.appendChild(resetHiddenPostsButton);

const board = window.location.href
  .split("https://boards.4chan.org/")[1]
  .split("/")[0];

const storageItemKey = "1pbtid_" + board;
const threadsSavedInStorage = localStorage.getItem(storageItemKey)
  ? localStorage.getItem(storageItemKey).split(";")
  : null;

const postsHiddenDiv = document.createElement("div");
navLinks.appendChild(postsHiddenDiv);

if (threadsSavedInStorage) {
  console.log("1pbtid threads:", threadsSavedInStorage);
  threadsSavedInStorage.forEach((threadId) => {
    const thread = document.getElementById("thread-" + threadId);
    if (thread) thread.style.display = "none";
  });

  if (threadsSavedInStorage.length > 1)
    postsHiddenDiv.innerHTML = `<span>${threadsSavedInStorage.length} posts hidden</span>`;
}

function showPosts() {
  localStorage.removeItem(storageItemKey);
  window.location.href = window.location.href;
}

function hidePosts() {
  fetch(window.location.href, {})
    .then((result) => result.text())
    .then(async (t) => {
      const catalogStart = t.indexOf("var catalog = {") + 14;
      const catalogFromStart = t.substring(catalogStart);
      const catalogEnd = catalogFromStart.indexOf("};") + 1;
      const catalog = catalogFromStart.substring(0, catalogEnd);
      const jsonCatalog = JSON.parse(catalog);
      const relevantThreads = Object.entries(jsonCatalog.threads).filter(
        (entry) =>
          entry[1].r >= Number(localStorage.getItem("1pbtid_replyCount") ?? 7)
      );

      console.log(relevantThreads);
      let hidCount = 0;
      localStorage.removeItem(storageItemKey);
      for (let i = 0; i < relevantThreads.length; i++) {
        let threadId = relevantThreads[i][0];

        let res = await fetch(
          `https://boards.4chan.org/${board}/thread/${threadId}`,
          {
            body: null,
            method: "GET",
            mode: "cors",
          }
        );

        const text = await res.text();
        const fakeThreadDiv = document.createElement("div");
        fakeThreadDiv.innerHTML = text;
        const posterId = fakeThreadDiv.querySelector(".posteruid").classList[1];
        const postCount =
          fakeThreadDiv.getElementsByClassName(posterId).length / 2;
        console.log(
          threadId,
          "pbtidCount: " + postCount,
          "replyCount: " + relevantThreads[i][1].r
        );

        if (
          postCount <= Number(localStorage.getItem("1pbtid_pbtidCount") ?? 1)
        ) {
          document.getElementById("thread-" + threadId).style.display = "none";
          console.log(threadId + " HIDDEN!");
          hidCount++;
          postsHiddenDiv.innerHTML = `<span>${hidCount} posts hidden</span>`;
          const currentThreads = localStorage.getItem(storageItemKey);
          if (currentThreads) {
            localStorage.setItem(
              storageItemKey,
              currentThreads + threadId + ";"
            );
          } else {
            localStorage.setItem(storageItemKey, threadId + ";");
          }
        }
      }

      console.log("Total threads hidden: " + hidCount);
    });
}
