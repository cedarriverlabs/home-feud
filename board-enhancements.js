// Home Feud board enhancements
(function () {
  // Wait until the main app has defined the key functions
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    // ---- 1. Restructure the board area for side scores ----
    const answersBoard = document.getElementById("answers-board");
    if (!answersBoard) return;

    const panel = answersBoard.closest(".panel");
    if (!panel || panel.querySelector(".board-with-scores")) return;

    // Create the side-score structure
    const wrapper = document.createElement("div");
    wrapper.className = "board-with-scores";

    const left = document.createElement("div");
    left.className = "side-score team1";
    left.innerHTML = '<div class="side-name" id="side-name1">Family 1</div><div class="side-pts" id="side-score1">0</div>';

    const right = document.createElement("div");
    right.className = "side-score team2";
    right.innerHTML = '<div class="side-name" id="side-name2">Family 2</div><div class="side-pts" id="side-score2">0</div>';

    // Move the answers board into the middle
    answersBoard.parentNode.insertBefore(wrapper, answersBoard);
    wrapper.appendChild(left);
    wrapper.appendChild(answersBoard);
    wrapper.appendChild(right);

    // Keep the side scores in sync with the main scores
    const origRender = window.render;
    if (typeof origRender === "function") {
      window.render = function () {
        origRender.apply(this, arguments);
        const n1 = document.getElementById("name1");
        const n2 = document.getElementById("name2");
        const s1 = document.getElementById("score1");
        const s2 = document.getElementById("score2");
        if (n1) document.getElementById("side-name1").textContent = n1.textContent;
        if (n2) document.getElementById("side-name2").textContent = n2.textContent;
        if (s1) document.getElementById("side-score1").textContent = s1.textContent;
        if (s2) document.getElementById("side-score2").textContent = s2.textContent;
      };
    }

    // ---- 2. Improve revealAnswer with flip ----
    const origReveal = window.revealAnswer;
    if (typeof origReveal === "function") {
      window.revealAnswer = function (idx) {
        const row = document.querySelector('.answer-row[data-index="' + idx + '"]');
        if (row) row.classList.add("flipping");
        origReveal.apply(this, arguments);
        setTimeout(function () {
          if (row) row.classList.remove("flipping");
        }, 600);
      };
    }

    // ---- 3. One-by-one remaining reveal helper ----
    window.revealNextRemaining = function () {
      if (typeof state === "undefined" || !state.rounds) return;
      const round = state.rounds[state.currentRoundIndex];
      if (!round) return;
      for (let i = 0; i < round.answers.length; i++) {
        if (!state.revealed.includes(i)) {
          window.revealAnswer(i);
          return;
        }
      }
    };

    console.log("[Home Feud] Board enhancements loaded");
  });
})();
