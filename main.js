
document.addEventListener("DOMContentLoaded",()=>{

  const game = new GameEngine();
  const ui = new GameUI(game);

  let config = {
    initial:300000,
    difficulty:"normal",
    target:0
  };

  const $ = selector => document.querySelector(selector);

  function startOrResume() {
    if(game.state.phase==="setup") {
      ui.showScreen("start");
      return;
    }

    ui.showScreen("game");
    ui.showPhase(game.state.phase);

    if(game.state.phase==="planning") ui.renderPlanning();
    if(game.state.phase==="event") ui.renderEvent();
    if(game.state.phase==="report") ui.renderReport();
    if(game.state.phase==="finished") ui.renderFinal();
  }

  $("#startBtn").addEventListener("click",()=>{
    const saved = localStorage.getItem(game.storageKey);

    if(saved) {
      const previous = JSON.parse(saved);

      if(previous.phase!=="setup" &&
         confirm("Lanjutkan simulasi yang tersimpan?")) {
        startOrResume();
        return;
      }
    }

    ui.showScreen("setup");
  });

  $("#initialMoney").addEventListener("input",e=>{
    config.initial = Number(e.target.value);
    $("#initialMoneyLabel").textContent = game.money(config.initial);
  });

  document.querySelectorAll(".difficulty").forEach(button=>{
    button.addEventListener("click",()=>{
      document.querySelectorAll(".difficulty")
        .forEach(x=>x.classList.remove("selected"));

      button.classList.add("selected");
      config.difficulty = button.dataset.difficulty;
    });
  });

  document.querySelectorAll(".target").forEach(button=>{
    button.addEventListener("click",()=>{
      document.querySelectorAll(".target")
        .forEach(x=>x.classList.remove("selected"));

      button.classList.add("selected");
      config.target = Number(button.dataset.target);
    });
  });

  $("#beginGameBtn").addEventListener("click",()=>{
    game.start(config);
    ui.showScreen("game");
    ui.showPhase("planning");
    ui.renderPlanning();
    ui.toast("Simulasi dimulai. Atur uangmu!");
  });

  document.querySelectorAll("[data-budget]").forEach(input=>{
    input.addEventListener("input",e=>{
      const key = e.target.dataset.budget;
      const value = Number(e.target.value);

      game.setAllocation(key,value);

      $("#budget-"+key).textContent = game.money(value);

      ui.updateAllocationTotal();
      ui.renderMission();
    });
  });

  $("#lockBudgetBtn").addEventListener("click",()=>{
    const result = game.lockBudget();

    if(!result.ok) {
      ui.toast(result.message);
      return;
    }

    ui.showPhase("event");
    ui.renderEvent();
    ui.toast("Rencana terkunci. Hadapi minggu ini!");
  });

  ui.onChoice = index=>{
    const result = game.resolveChoice(index);

    if(!result.ok) {
      ui.toast(result.message);
      return;
    }

    ui.showPhase("report");
    ui.renderReport();

    if(game.state.levelUp) {
      ui.toast("LEVEL UP! Bonus Rp5.000 masuk.");
      game.state.levelUp = false;
      game.save();
    }
  };

  $("#continueBtn").addEventListener("click",()=>{
    if(game.state.week>=4 || game.state.balance<=0) {
      game.finish();
      ui.showPhase("finished");
      ui.renderFinal();
    } else {
      game.nextWeek();
      ui.showPhase("planning");
      ui.renderPlanning();
    }
  });

  $("#shopBtn").addEventListener("click",()=>{
    const html = `
      <div class="eyebrow">PONDOK MINI MARKET</div>
      <h3>KEBUTUHAN SANTRI</h3>
      <p style="color:var(--muted);font-size:12px">
        Beli perlengkapan untuk menjaga kebutuhanmu.
      </p>

      <div class="shop-list">
        ${GameData.items.map(item=>`
          <div class="shop-item">
            <span style="font-size:24px">${item.icon}</span>
            <div class="shop-desc">
              <b>${item.name}</b>
              <small>${item.desc} · ${game.money(item.price)}</small>
            </div>
            <button data-buy="${item.id}">BELI</button>
          </div>
        `).join("")}
      </div>

      <div style="font:10px var(--mono);color:var(--yellow)">
        SALDO: ${game.money(game.state.balance)}
      </div>
    `;

    ui.openModal(html);

    document.querySelectorAll("[data-buy]").forEach(button=>{
      button.addEventListener("click",()=>{
        if(game.buyItem(button.dataset.buy)) {
          ui.toast("Barang berhasil dibeli!");
          ui.renderHUD();
          ui.closeModal();
        } else {
          ui.toast("Saldo tidak cukup.");
        }
      });
    });
  });

  $("#modalClose").addEventListener("click",()=>ui.closeModal());

  $("#modal").addEventListener("click",e=>{
    if(e.target.classList.contains("modal-backdrop")) {
      ui.closeModal();
    }
  });

  $("#resetBtn").addEventListener("click",()=>{
    if(confirm("Hapus progres dan mulai ulang?")) {
      game.reset();
      ui.showScreen("start");
      ui.toast("Progres direset.");
    }
  });

  $("#playAgainBtn").addEventListener("click",()=>{
    game.reset();
    ui.showScreen("setup");
  });

  if(game.state.phase!=="setup") {
    startOrResume();
  } else {
    ui.showScreen("start");
  }

});

// =====================================
// EXTRA INTERACTIONS
// =====================================

// 1. Tambah tombol bantuan dan suara
const topActions = document.querySelector(".top-actions");

const helpButton = document.createElement("button");
helpButton.className = "extra-action";
helpButton.textContent = "? BANTUAN";

const soundButton = document.createElement("button");
soundButton.className = "extra-action";
soundButton.textContent = "🔇 SUARA";

topActions.append(helpButton, soundButton);

// 2. Panel bantuan
helpButton.addEventListener("click", () => {
  ui.openModal(`
    <div class="eyebrow">GAME GUIDE / DOMPET SANTRI</div>
    <h3>CARA BERMAIN</h3>

    <div class="help-content">
      <p><b>01. ATUR UANG</b><br>
      Tentukan anggaran untuk kebutuhan selama satu minggu.</p>

      <p><b>02. KUNCI RENCANA</b><br>
      Setelah yakin dengan anggaranmu, kunci rencana.</p>

      <p><b>03. HADAPI KEJADIAN</b><br>
      Pilih keputusan terbaik dari kejadian yang muncul.</p>

      <p><b>04. EVALUASI</b><br>
      Periksa laporan dan lanjutkan ke minggu berikutnya.</p>

      <p><b>05. SELESAIKAN 4 MINGGU</b><br>
      Raih saldo, tabungan, dan skor strategi terbaik.</p>
    </div>
  `);
});

// 3. Efek suara sederhana
let soundEnabled = false;
let audioContext;

function playSound(frequency = 500, duration = 0.08) {
  if (!soundEnabled) return;

  try {
    audioContext ??= new (
      window.AudioContext || window.webkitAudioContext
    )();

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(.08, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      .001,
      audioContext.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.warn("Audio tidak tersedia:", error);
  }
}

soundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;

  soundButton.textContent = soundEnabled
    ? "🔊 SUARA ON"
    : "🔇 SUARA";

  playSound(650);
});

// 4. Efek ripple semua tombol
document.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;

  const rect = button.getBoundingClientRect();
  const ripple = document.createElement("span");

  ripple.className = "ripple-effect";

  const size = Math.max(rect.width, rect.height);

  ripple.style.width = size + "px";
  ripple.style.height = size + "px";
  ripple.style.left = (event.clientX - rect.left - size / 2) + "px";
  ripple.style.top = (event.clientY - rect.top - size / 2) + "px";

  button.appendChild(ripple);

  setTimeout(() => ripple.remove(), 650);

  playSound(420);
});

// 5. Partikel background
function createParticle() {
  const particle = document.createElement("span");

  particle.className = "ambient-particle";
  particle.style.left = Math.random() * 100 + "vw";
  particle.style.animationDuration = (7 + Math.random() * 8) + "s";
  particle.style.opacity = Math.random() * .25;

  document.body.appendChild(particle);

  setTimeout(() => particle.remove(), 16000);
}

for (let i = 0; i < 12; i++) {
  setTimeout(createParticle, i * 250);
}

setInterval(createParticle, 900);

// 6. Animasi perubahan angka HUD
const hudNumbers = document.querySelectorAll(
  "#balanceValue, #savingValue, #levelValue, #rankValue"
);

hudNumbers.forEach(element => {
  const observer = new MutationObserver(() => {
    element.classList.remove("value-pop");
    void element.offsetWidth;
    element.classList.add("value-pop");

    playSound(580, .1);
  });

  observer.observe(element, {
    childList: true,
    characterData: true,
    subtree: true
  });
});

// 7. Efek confetti untuk pencapaian
function confettiBurst() {
  const symbols = ["✦", "●", "◆", "★"];

  for (let i = 0; i < 65; i++) {
    const piece = document.createElement("span");

    piece.className = "confetti-piece";
    piece.textContent = symbols[
      Math.floor(Math.random() * symbols.length)
    ];

    piece.style.left = Math.random() * 100 + "vw";
    piece.style.color = Math.random() > .5
      ? "#ff704f"
      : "#ffd166";

    piece.style.animationDelay = Math.random() * .7 + "s";

    document.body.appendChild(piece);

    setTimeout(() => piece.remove(), 3500);
  }

  playSound(780, .3);
}

// 8. Shortcut keyboard
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    ui.closeModal();
  }

  if (event.key.toLowerCase() === "h" &&
      !event.target.matches("input, textarea")) {
    helpButton.click();
  }
});

// 9. Efek hover pada kartu
document.querySelectorAll(
  ".hud-card, .mission-card, .tip-card, .side-stat"
).forEach(card => {
  card.addEventListener("mouseenter", () => {
    playSound(300, .04);
  });
});

// 10. Animasi saat simulasi dimulai
document.querySelectorAll(".primary-btn").forEach(button => {
  button.addEventListener("click", () => {
    button.classList.add("value-pop");

    setTimeout(() => {
      button.classList.remove("value-pop");
    }, 500);
  });
});