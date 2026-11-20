
class GameUI {
  constructor(engine) {
    this.g = engine;
    this.$ = s => document.querySelector(s);
    this.$$ = s => [...document.querySelectorAll(s)];
  }

  showScreen(id) {
    this.$$(".screen").forEach(x=>x.classList.remove("active"));
    this.$("#screen-"+id).classList.add("active");
  }

  showPhase(phase) {
    ["planning","event","report","finished"].forEach(p=>{
      this.$("#phase-"+p).classList.toggle("hidden",p!==phase);
    });

    this.renderHUD();
  }

  toast(message) {
    const el = this.$("#toast");
    el.textContent = message;
    el.classList.add("show");

    clearTimeout(this.toastTimer);

    this.toastTimer = setTimeout(()=>{
      el.classList.remove("show");
    },2200);
  }

  renderHUD() {
    const s = this.g.state;

    this.$("#weekTitle").textContent =
      `MINGGU ${String(s.week).padStart(2,"0")} — ${s.phase.toUpperCase()}`;

    this.$("#weekNumber").textContent =
      String(s.week).padStart(2,"0");

    this.$("#balanceValue").textContent = this.g.money(s.balance);
    this.$("#spentValue").textContent = "Terpakai "+this.g.money(s.spent);

    this.$("#savingValue").textContent = this.g.money(s.saved);

    this.$("#savingGoalText").textContent = s.savingTarget
      ? `${this.g.money(s.saved)} / ${this.g.money(s.savingTarget)}`
      : "Belum ada target";

    this.$("#savingMeter").style.width =
      (s.savingTarget
        ? Math.min(100,s.saved/s.savingTarget*100)
        : Math.min(100,s.saved/100000*100))+"%";

    this.$("#levelValue").textContent = s.level;
    this.$("#rankValue").textContent = this.g.rank;

    this.$("#xpMeter").style.width =
      (s.xp/this.g.xpNeeded*100)+"%";

    this.$("#xpText").textContent =
      `${s.xp} / ${this.g.xpNeeded} XP`;

    this.$("#financialStatus").textContent = "● "+this.g.status;

    this.$("#needStatus").textContent =
      s.needs>=3 ? "BAIK" :
      s.needs===2 ? "CUKUP" : "PERLU PERHATIAN";

    this.$("#needCaption").textContent =
      s.needs>=3 ? "Perlengkapan aman" : "Ada kebutuhan yang perlu dipenuhi";

    this.$$("#needDots i").forEach((x,i)=>{
      x.classList.toggle("off",i>=s.needs);
    });

    this.$$("#weekProgress span").forEach((x,i)=>{
      x.classList.toggle("done",i<s.week);
    });

    this.renderInventory();
    this.renderMission();
  }

  renderInventory() {
    const box = this.$("#inventoryList");
    box.innerHTML = "";

    GameData.items.forEach(item=>{
      const qty = this.g.state.inventory[item.id] || 0;

      const el = document.createElement("div");
      el.className = "inventory-item";

      el.innerHTML = `
        <span>${item.icon}</span>
        <span>${item.name}</span>
        <b class="qty">×${qty}</b>
      `;

      box.append(el);
    });
  }

  renderMission() {
    const m = this.g.state.currentMission;
    if(!m) return;

    this.$("#missionTitle").textContent = m.title;
    this.$("#missionDesc").textContent = m.desc;

    this.$("#missionProgress").style.width =
      this.g.state.missionDone ? "100%" : "0%";

    this.$("#missionProgressText").textContent =
      this.g.state.missionDone ? "1 / 1 selesai" : "0 / 1 selesai";
  }

  renderPlanning() {
    this.$$(".budget-item input").forEach(input=>{
      const key = input.dataset.budget;

      input.value = this.g.state.currentAllocation[key] || 0;

      this.$("#budget-"+key).textContent =
        this.g.money(input.value);
    });

    this.updateAllocationTotal();

    this.$("#tipText").textContent =
      GameData.tips[Math.floor(Math.random()*GameData.tips.length)];
  }

  updateAllocationTotal() {
    const total = this.g.allocationTotal;

    this.$("#allocationTotal").textContent =
      `${this.g.money(total)} / ${this.g.money(this.g.state.balance)}`;

    this.$("#budgetGrandTotal").textContent =
      this.g.money(total);

    this.$("#lockBudgetBtn").disabled =
      total > this.g.state.balance;

    this.$("#lockBudgetBtn").style.opacity =
      total > this.g.state.balance ? ".45" : "1";
  }

  renderEvent() {
    const e = this.g.state.event;
    if(!e) return;

    this.$("#eventArt").textContent = e.icon;
    this.$("#eventType").textContent = e.type;

    this.$("#eventWeek").textContent =
      "WEEK "+String(this.g.state.week).padStart(2,"0");

    this.$("#eventTitle").textContent = e.title;
    this.$("#eventDescription").textContent = e.description;

    this.$("#eventBalance").textContent =
      this.g.money(this.g.state.balance);

    this.$("#eventNeeds").textContent =
      this.g.state.needs+" / 4";

    const choices = this.$("#eventChoices");
    choices.innerHTML = "";

    e.choices.forEach((c,i)=>{
      const b = document.createElement("button");
      b.className = "choice-btn";

      const costText = c.gain
        ? "+"+this.g.money(c.gain)
        : c.cost
          ? "-"+this.g.money(c.cost)
          : "GRATIS";

      b.innerHTML = `
        <span>
          <b>${c.label}</b>
          <small>${c.detail}</small>
        </span>
        <span class="choice-cost">${costText} ↗</span>
      `;

      b.addEventListener("click",()=>this.onChoice(i));
      choices.append(b);
    });
  }

  onChoice() {}

  renderReport() {
    const s = this.g.state;
    const h = s.history[s.history.length-1];

    if(!h) return;

    const grade = h.spent<50000 ? "A" : h.spent<75000 ? "B" : "C";

    this.$("#reportGrade").textContent = grade;

    this.$("#reportHeadline").textContent =
      grade==="A" ? "Strategi hemat yang solid!" :
      grade==="B" ? "Minggu berjalan cukup baik." :
      "Pengeluaranmu perlu dievaluasi.";

    this.$("#reportMessage").textContent =
      s.eventResult || "Kamu telah menyelesaikan minggu ini.";

    this.$("#reportSpent").textContent = this.g.money(h.spent);
    this.$("#reportSaved").textContent = this.g.money(h.saved);
    this.$("#reportXP").textContent = "+"+h.xp+" XP";

    this.$("#reportBreakdown").innerHTML = `
      <div class="break-row">
        <span>Saldo saat ini</span>
        <b>${this.g.money(s.balance)}</b>
      </div>
      <div class="break-row">
        <span>Disiplin</span>
        <b>${s.discipline} poin</b>
      </div>
      <div class="break-row">
        <span>Reputasi</span>
        <b>${s.reputation} poin</b>
      </div>
      <div class="break-row">
        <span>Skor strategi</span>
        <b>${s.score}</b>
      </div>
    `;

    this.$("#missionResultTitle").textContent =
      s.missionDone ? "MISI BERHASIL!" : "Misi belum tercapai";

    this.$("#missionResultText").textContent =
      s.missionDone
        ? `Bonus ${s.currentMission.reward} XP berhasil didapat.`
        : "Coba strategi berbeda di minggu berikutnya.";

    this.$("#reportInventory").innerHTML = `
      <p style="font-size:12px;line-height:1.6;color:#c4c0d1">
        Kondisi kebutuhan: <b>${s.needs}/4</b><br>
        Level: <b>${s.level}</b> — ${this.g.rank}
      </p>
    `;

    this.$("#continueBtn").textContent =
      s.week>=4
        ? "LIHAT HASIL AKHIR →"
        : "LANJUT KE MINGGU BERIKUTNYA →";
  }

  renderFinal() {
    const s = this.g.state;

    this.$("#finalMessage").textContent =
      s.balance<=0
        ? "Saldo habis sebelum simulasi selesai. Coba strategi baru."
        : s.targetReached
          ? "Kamu berhasil melewati bulan dan mencapai target tabungan."
          : "Kamu berhasil menyelesaikan empat minggu.";

    this.$("#finalBalance").textContent = this.g.money(s.balance);
    this.$("#finalSaving").textContent = this.g.money(s.saved);
    this.$("#finalLevel").textContent = s.level;
    this.$("#finalScore").textContent = s.score+" / "+this.g.grade;

    this.$("#finalAchievements").innerHTML =
      s.achievements.map(a=>`<span class="achievement">${a.label}</span>`).join("")
      || '<span class="achievement">🌱 Awal perjalanan</span>';
  }

  openModal(html) {
    this.$("#modalContent").innerHTML = html;
    this.$("#modal").classList.remove("hidden");
  }

  closeModal() {
    this.$("#modal").classList.add("hidden");
  }
}

window.GameUI = GameUI;
