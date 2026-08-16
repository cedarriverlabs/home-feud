// Home Feud board enhancements v4
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

      answersBoard.parentNode.insertBefore(wrapper, answersBoard);
      wrapper.appendChild(left);
      wrapper.appendChild(answersBoard);
      wrapper.appendChild(right);
    }

    const n1 = document.getElementById("name1");
    const n2 = document.getElementById("name2");
    const s1 = document.getElementById("score1");
    const s2 = document.getElementById("score2");
    if (n1) document.getElementById("side-name1").textContent = n1.textContent;
    if (n2) document.getElementById("side-name2").textContent = n2.textContent;
    if (s1) document.getElementById("side-score1").textContent = s1.textContent;
    if (s2) document.getElementById("side-score2").textContent = s2.textContent;
  }

  function ensureDataIndexes() {
    document.querySelectorAll(".answers-grid .answer-row").forEach((row, i) => {
      row.dataset.index = i;
    });
  }

  // Inject "Reveal next remaining" button into host controls when needed
  function injectRevealButton() {
    if (typeof state === "undefined" || !state.rounds) return;
    const round = state.rounds[state.currentRoundIndex];
    if (!round) return;

    const remaining = round.answers.length - state.revealed.length;
    if (remaining <= 0) return;

    // Only show after the round has been played (idle or after award)
    if (state.mode !== "idle" && state.mode !== "playing" && state.mode !== "steal") return;

    const actions = document.getElementById("dynamic-actions");
    if (!actions) return;

    // Don't add duplicates
    if (actions.querySelector("[data-hf-reveal-next]")) return;

    const btn = document.createElement("button");
    btn.className = "btn-lg btn-orange";
    btn.setAttribute("data-hf-reveal-next", "1");
    btn.innerHTML = "Reveal next remaining answer<br><small style=\"font-weight:500;opacity:0.85\">One at a time like the show</small>";
    btn.onclick = function () {
      window.revealNextRemaining();
    };
    actions.appendChild(btn);
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
        injectRevealButton();
      }, 20);
    };
    window.render.__hfEnhanced = true;
    return true;
  }

  function patchReveal() {
    if (typeof window.revealAnswer !== "function") return false;
    if (window.revealAnswer.__hfEnhanced) return true;

    const original = window.revealAnswer;
    window.revealAnswer = function (idx) {
      // Play flip BEFORE the original re-renders the board
      const row = document.querySelector('.answer-row[data-index="' + idx + '"]');
      if (row) {
        row.classList.remove("flipping");
        // Force reflow so the animation restarts
        void row.offsetWidth;
        row.classList.add("flipping");

        // Let the flip play, then let the original update the content
        setTimeout(function () {
          original.call(window, idx);
        }, 280);
      } else {
        original.call(window, idx);
      }
    };
    window.revealAnswer.__hfEnhanced = true;
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

  let tries = 0;
  const iv = setInterval(function () {
    tries++;
    const ok1 = patchRender();
    const ok2 = patchReveal();
    ensureSideScores();
    ensureDataIndexes();
    injectRevealButton();
    if ((ok1 && ok2) || tries > 60) {
      clearInterval(iv);
      console.log("[Home Feud] Board enhancements v4 active");
    }
  }, 200);
})();
