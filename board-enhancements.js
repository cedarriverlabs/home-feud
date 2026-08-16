// Home Feud board enhancements - robust version
(function () {
  function ensureSideScores() {
    const answersBoard = document.getElementById("answers-board");
    if (!answersBoard) return;

    // If already wrapped, just sync the numbers
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

      answersBoard.parentNode.insertBefore(wrapper, answersBoard);
      wrapper.appendChild(left);
      wrapper.appendChild(answersBoard);
      wrapper.appendChild(right);
    }

    // Sync values from the original score elements (even if they are hidden)
    const n1 = document.getElementById("name1");
    const n2 = document.getElementById("name2");
    const s1 = document.getElementById("score1");
    const s2 = document.getElementById("score2");
    const sn1 = document.getElementById("side-name1");
    const sn2 = document.getElementById("side-name2");
    const ss1 = document.getElementById("side-score1");
    const ss2 = document.getElementById("side-score2");
    if (n1 && sn1) sn1.textContent = n1.textContent;
    if (n2 && sn2) sn2.textContent = n2.textContent;
    if (s1 && ss1) ss1.textContent = s1.textContent;
    if (s2 && ss2) ss2.textContent = s2.textContent;
  }

  function patchRender() {
    if (typeof window.render !== "function") return false;
    if (window.render.__enhanced) return true;

    const original = window.render;
    window.render = function () {
      original.apply(this, arguments);
      // Re-apply after every render because the board is rebuilt
      setTimeout(ensureSideScores, 0);
    };
    window.render.__enhanced = true;
    return true;
  }

  function patchReveal() {
    if (typeof window.revealAnswer !== "function") return false;
    if (window.revealAnswer.__enhanced) return true;

    const original = window.revealAnswer;
    window.revealAnswer = function (idx) {
      const row = document.querySelector('.answer-row[data-index="' + idx + '"]');
      if (row) {
        row.classList.add("flipping");
        setTimeout(() => row.classList.remove("flipping"), 600);
      }
      original.apply(this, arguments);
    };
    window.revealAnswer.__enhanced = true;
    return true;
  }

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

  // Keep trying until the main app has loaded its functions
  let attempts = 0;
  const timer = setInterval(function () {
    attempts++;
    const ok = patchRender() && patchReveal();
    ensureSideScores();
    if (ok || attempts > 40) {
      clearInterval(timer);
      console.log("[Home Feud] Enhancements active");
    }
  }, 250);
})();
