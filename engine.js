
class GameEngine {
  constructor() {
    this.storageKey = "dompetSantriGame_v2";

    this.defaults = {
      initial:300000,
      balance:300000,
      spent:0,
      saved:0,
      savingTarget:0,
      week:1,
      phase:"setup",
      difficulty:"normal",
      level:1,
      xp:0,
      discipline:0,
      reputation:0,
      mood:3,
      needs:4,
      inventory:{
        soap:1,
        toothpaste:1,
        notebook:2,
        detergent:1
      },
      history:[],
      currentAllocation:{
        food:25000,
        snack:15000,
        laundry:10000,
        school:5000,
        saving:10000
      },
      currentSpent:0,
      currentSaved:0,
      currentMission:null,
      event:null,
      missionDone:false,
      achievements:[],
      score:0,
      monthCompleted:false
    };

    this.state = this.load() || structuredClone(this.defaults);
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw
        ? {...structuredClone(this.defaults),...JSON.parse(raw)}
        : null;
    } catch {
      return null;
    }
  }

  save() {
    localStorage.setItem(this.storageKey,JSON.stringify(this.state));
  }

  reset() {
    this.state = structuredClone(this.defaults);
    this.save();
  }

  money(value) {
    return "Rp" + Math.round(value).toLocaleString("id-ID");
  }

  get allocationTotal() {
    return Object.values(this.state.currentAllocation)
      .reduce((a,b)=>a+b,0);
  }

  get spendingAllocation() {
    return this.allocationTotal - this.state.currentAllocation.saving;
  }

  get status() {
    const ratio = this.state.balance / Math.max(this.state.initial,1);

    if(this.state.balance <= 0) return "KRITIS";
    if(ratio < 0.15) return "WASPADA";

    return "STABIL";
  }

  get rank() {
    return [
      "ROOKIE",
      "SANTRI AKTIF",
      "SANTRI TELADAN",
      "SENIOR",
      "LEGEND"
    ][Math.min(4,Math.floor((this.state.level-1)/2))];
  }

  get xpNeeded() {
    return this.state.level * 100;
  }

  start(config) {
    this.state.initial = config.initial;
    this.state.balance = config.initial;
    this.state.savingTarget = config.target;
    this.state.difficulty = config.difficulty;
    this.state.phase = "planning";
    this.state.week = 1;
    this.state.currentMission = this.pickMission();

    this.state.currentAllocation = {
      food:25000,
      snack:15000,
      laundry:10000,
      school:5000,
      saving:10000
    };

    this.save();
  }

  pickMission() {
    const list = GameData.missions;
    return structuredClone(list[Math.floor(Math.random()*list.length)]);
  }

  setAllocation(key,value) {
    this.state.currentAllocation[key] = Number(value);
    this.save();
  }

  buyItem(id) {
    const item = GameData.items.find(x=>x.id===id);

    if(!item || this.state.balance < item.price) {
      return false;
    }

    this.state.balance -= item.price;
    this.state.spent += item.price;

    this.state.inventory[id] =
      (this.state.inventory[id] || 0) + item.qty;

    this.state.needs = Math.min(4,this.state.needs+1);
    this.state.score += 3;

    this.save();
    return true;
  }

  lockBudget() {
    const a = this.state.currentAllocation;

    if(this.allocationTotal > this.state.balance) {
      return {ok:false,message:"Alokasi melebihi saldo!"};
    }

    this.state.currentSpent = this.spendingAllocation;
    this.state.currentSaved = a.saving;

    this.state.balance -= this.spendingAllocation;
    this.state.spent += this.spendingAllocation;
    this.state.saved += a.saving;

    this.state.score += Math.max(
      0,
      10 - Math.floor(this.spendingAllocation/15000)
    );

    this.state.event = this.pickEvent();
    this.state.phase = "event";

    this.save();

    return {ok:true};
  }

  pickEvent() {
    const pool = GameData.events.slice();

    if(this.state.difficulty === "challenge") {
      pool.push(
        ...GameData.events.filter(e=>e.type==="TANTANGAN")
      );
    }

    return structuredClone(
      pool[Math.floor(Math.random()*pool.length)]
    );
  }

  resolveChoice(index) {
    const event = this.state.event;
    const choice = event.choices[index];

    if(!choice) return false;

    if(this.state.balance < choice.cost) {
      return {
        ok:false,
        message:"Saldo tidak cukup untuk pilihan ini."
      };
    }

    this.state.balance -= choice.cost;
    this.state.spent += choice.cost;
    this.state.currentSpent += choice.cost;

    if(choice.gain) {
      this.state.balance += choice.gain;
      this.state.score += Math.floor(choice.gain/5000);
    }

    const effect = choice.effect || {};

    this.state.mood = Math.max(
      0,
      Math.min(5,this.state.mood+(effect.mood||0))
    );

    this.state.discipline = Math.max(
      0,
      this.state.discipline+(effect.discipline||0)
    );

    this.state.reputation = Math.max(
      0,
      this.state.reputation+(effect.reputation||0)
    );

    this.state.needs = Math.max(
      0,
      Math.min(4,this.state.needs+(effect.needs||0))
    );

    this.state.xp += effect.xp || 0;
    this.state.eventResult = choice.result;

    this.applyMission();

    const eventXP = 20 +
      (this.state.difficulty==="challenge" ? 5 : 0);

    this.addXP(eventXP);

    this.state.phase = "report";

    this.state.score += this.state.needs >= 3 ? 8 : 0;

    this.state.history.push({
      week:this.state.week,
      spent:this.state.currentSpent,
      saved:this.state.currentSaved,
      balance:this.state.balance,
      needs:this.state.needs,
      choice:choice.label,
      event:event.title,
      missionDone:this.state.missionDone,
      xp:eventXP
    });

    this.updateAchievements();
    this.save();

    return {ok:true};
  }

  applyMission() {
    const mission = this.state.currentMission;
    const a = this.state.currentAllocation;

    let done = false;

    if(mission.kind==="saving") {
      done = a.saving >= mission.target;
    }

    if(mission.kind==="snack") {
      done = a.snack <= mission.target;
    }

    if(mission.kind==="total") {
      done = this.allocationTotal <= mission.target;
    }

    if(mission.kind==="needs") {
      done = this.state.needs >= mission.target;
    }

    this.state.missionDone = done;

    if(done) {
      this.state.xp += mission.reward;
      this.state.score += 15;
    }
  }

  addXP(amount) {
    this.state.xp += amount;

    while(this.state.xp >= this.xpNeeded) {
      this.state.xp -= this.xpNeeded;
      this.state.level++;
      this.state.balance += 5000;
      this.state.score += 20;
      this.state.levelUp = true;
    }
  }

  updateAchievements() {
    const s = this.state;

    const add = (id,label) => {
      if(!s.achievements.some(a=>a.id===id)) {
        s.achievements.push({id,label});
      }
    };

    if(s.saved>=50000) add("saver","🐷 Penabung Konsisten");
    if(s.discipline>=4) add("disciplined","🧠 Penuh Disiplin");
    if(s.reputation>=4) add("known","⭐ Dikenal Baik");
    if(s.history.length>=2 &&
       s.history.slice(-2).every(h=>h.spent<70000)) {
      add("budgeter","📉 Ahli Budget");
    }
    if(s.needs>=4) add("prepared","🎒 Siap Sedia");
  }

  nextWeek() {
    if(this.state.week>=4) {
      this.finish();
      return;
    }

    this.state.week++;
    this.state.phase = "planning";
    this.state.currentMission = this.pickMission();
    this.state.missionDone = false;
    this.state.event = null;

    this.state.currentAllocation = {
      food:20000,
      snack:10000,
      laundry:10000,
      school:5000,
      saving:10000
    };

    if(this.state.week%2===0 && this.state.needs>1) {
      this.state.needs--;
    }

    if(this.state.balance<=0) {
      this.finish();
      return;
    }

    this.save();
  }

  finish() {
    this.state.phase = "finished";
    this.state.monthCompleted = true;

    this.state.score += this.state.balance>0
      ? Math.floor(this.state.balance/10000)
      : 0;

    if(
      this.state.savingTarget>0 &&
      this.state.saved>=this.state.savingTarget
    ) {
      this.state.score += 50;
      this.state.targetReached = true;
    }

    this.updateAchievements();
    this.save();
  }

  get grade() {
    const n = this.state.score;

    if(n>=150) return "S";
    if(n>=110) return "A";
    if(n>=75) return "B";
    if(n>=40) return "C";

    return "D";
  }
}

window.GameEngine = GameEngine;
