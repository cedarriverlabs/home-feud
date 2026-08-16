// Home Feud board enhancements v3
(function () {
  function ensureSideScores() {
    const answersBoard = document.getElementById("answers-board");
    if (!answersBoard) return;

    let wrapper = document.querySelector(".board-with-scores");
    if (!wrapper) {
      const panel = answersBoard.closest(".panel");
      if (!panel) return;

      wrapper = document.createElement("div");
      wrapper.className = "board-with-scores";

      const left = document.createElement("div");
      left.className = "side-score team1";
      left.innerHTML = '<div class="side-name" id="side-name1">Family 1</div><div class="side-pts" id="side-score1">0</div>';

      const right = document.createElement("div");
      right.className = "side-score team2";
      right.innerHTML = '<div class="side-name" id="side-name2">Family 2</div><div class="side-pts" id="side-score2">0</div>';

      // Insert wrapper and move the answers board into it
      answersBoard.parentNode.insertBefore(wrapper, answersBoard);
      wrapper.appendChild(left);
      wrapper.appendChild(answersBoard);
      wrapper.appendChild(right);
    }

    // Always sync the numbers
    const n1 = document.getElementById("name1");
    const n2 = document.getElementById("name2");
    const s1 = document.getElementById("score1");
    const s2 = document.getElementById("score2");
    if (n1) document.getElementById("side-name1").textContent = n1.textContent;
    if (n2) document.getElementById("side-name2").textContent = n2.textContent;
    if (s1) document.getElementById("side-score1").textContent = s1.textContent;
    if (s2) document.getElementById("side-score2").textContent = s2.textContent;
  }

  // Make sure every answer row has a data-index (the original file was missing it)
  function ensureDataIndexes() {
    document.querySelectorAll(".answers-grid .answer-row").forEach((row, i) => {
      if (!row.dataset.index) row.dataset.index = i;
    });
  }

  function patchRender() {
    if (typeof window.render !== "function") return false;
    if (window.render.__hfEnhanced) return true;

    const original = window.render;
    window.render = function () {
      original.apply(this, arguments);
      setTimeout(function () {
        ensureSideScores();
        ensureDataIndexes();
      }, 10);
    };
    window.render.__hfEnhanced = true;
    return true;
  }

  function patchReveal() {
    if (typeof window.revealAnswer !== "function") return false;
    if (window.revealAnswer.__hfEnhanced) return true;

    const original = window.revealAnswer;
    window.revealAnswer = function (idx) {
      // Find the row and play the flip
      const row = document.querySelector('.answer-row[data-index="' + idx + '"]');
      if (row) {
        row.classList.remove("flipping");
        void row.offsetWidth; // restart animation
        row.classList.add("flipping");
      }
      original.apply(this, arguments);
    };
    window.revealAnswer.__hfEnhanced = true;
    return true;
  }

  // One-by-one reveal helper
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

  // Poll until the main game has finished loading its functions
  let tries = 0;
  const iv = setInterval(function () {
    tries++;
    const ok1 = patchRender();
    const ok2 = patchReveal();
    ensureSideScores();
    ensureDataIndexes();
    if ((ok1 && ok2) || tries > 60) {
      clearInterval(iv);
      console.log("[Home Feud] Board enhancements active");
    }
  }, 200);
})();
