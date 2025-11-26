document.addEventListener('DOMContentLoaded', () => {
  const tavernaModal = document.getElementById('taverna-modal');
  const openTavernaBtn = document.getElementById('open-taverna-btn');
  const openArmeriaBtn = document.getElementById('open-armeria-btn');
  const startMissionBtn = document.getElementById('start-mission-btn');
  const closeBtn = document.querySelector('.close-btn');
  const heroSelectionGrid = document.getElementById('hero-selection-grid');
  const hiredPartyList = document.getElementById('hired-party-list');

  const allHeroes = {
    'tristano': { name: 'Tristano', hp: 50, maxHp: 50, attack: 'Mani nude', defense: 'Armatura di cuoio', shield: 'Scudo piccolo', sprites: { up: 'https://ste388.github.io/liberato/PG/Tristano3.png', right: 'https://ste388.github.io/liberato/PG/Tristano2.png', left: 'https://ste388.github.io/liberato/PG/Tristano1.png' } },
    'amazzone': { name: 'Amazzone', hp: 40, maxHp: 40, attack: 'Arco corto', defense: 'Veste di pelle', shield: 'Nessuno', sprites: { up: 'https://ste388.github.io/liberato/PG/amazzone3.png', right: 'https://ste388.github.io/liberato/PG/amazzone2.png', left: 'https://ste388.github.io/liberato/PG/amazzone1.png' } },
    'barbaro': { name: 'Barbaro', hp: 60, maxHp: 60, attack: 'Ascia bipenne', defense: 'Pelliccia', shield: 'Nessuno', sprites: { up: 'https://ste388.github.io/liberato/PG/barbaro3.png', right: 'https://ste388.github.io/liberato/PG/barbaro2.png', left: 'https://ste388.github.io/liberato/PG/barbaro1.png' } },
    'paladino': { name: 'Paladino', hp: 55, maxHp: 55, attack: 'Spada lunga', defense: 'Armatura di piastre', shield: 'Scudo a torre', sprites: { up: 'https://ste388.github.io/liberato/PG/paladino3.png', right: 'https://ste388.github.io/liberato/PG/paladino2.png', left: 'https://ste388.github.io/liberato/PG/paladino1.png' } },
    'mago': { name: 'Mago', hp: 30, maxHp: 30, attack: 'Bastone', defense: 'Toga', shield: 'Nessuno', sprites: { up: 'https://ste388.github.io/liberato/PG/mago3.png', right: 'https://ste388.github.io/liberato/PG/mago2.png', left: 'https://ste388.github.io/liberato/PG/mago1.png' } },
    'nano': { name: 'Nano', hp: 50, maxHp: 50, attack: 'Martello da guerra', defense: 'CotTA DI MAGLIA', shield: 'Scudo rotondo', sprites: { up: 'https://ste388.github.io/liberato/PG/nano3.png', right: 'https://ste388.github.io/liberato/PG/nano2.png', left: 'https://ste388.github.io/liberato/PG/nano1.png' } }
  };

  let hiredParty = ['tristano'];

  function renderRecruitableHeroes() {
    heroSelectionGrid.innerHTML = '';
    for (const key in allHeroes) {
      if (key === 'tristano') continue;
      const hero = allHeroes[key];
      const card = document.createElement('div');
      card.className = 'hero-card';
      card.dataset.heroKey = key;
      card.innerHTML = `<img src="${hero.sprites.left}" alt="${hero.name}"><p>${hero.name}</p>`;
      card.addEventListener('click', () => hireHero(key));
      heroSelectionGrid.appendChild(card);
    }
  }

  function renderHiredParty() {
    hiredPartyList.innerHTML = '';
    hiredParty.forEach(key => {
      const hero = allHeroes[key];
      const div = document.createElement('div');
      div.className = 'hired-hero';
      div.dataset.heroKey = key;

      const isTristano = key === 'tristano';
      div.innerHTML = `
        <img src="${hero.sprites.left}" alt="${hero.name}">
        <p>${hero.name}</p>
        <input type="text" value="${hero.name}" placeholder="Inserisci nome" ${isTristano ? 'disabled' : ''}>
        ${!isTristano ? '<button class="remove-hero-btn">Rimuovi</button>' : ''}
      `;

      if (!isTristano) {
        div.querySelector('.remove-hero-btn').addEventListener('click', () => removeHero(key));
      }

      hiredPartyList.appendChild(div);
    });
  }

  function hireHero(key) {
    if (!hiredParty.includes(key)) {
      hiredParty.push(key);
      renderHiredParty();
    } else {
      alert('Questo personaggio è già stato assoldato.');
    }
  }

  function removeHero(key) {
    hiredParty = hiredParty.filter(heroKey => heroKey !== key);
    renderHiredParty();
  }

  openTavernaBtn.onclick = () => { tavernaModal.style.display = 'block'; };
  openArmeriaBtn.onclick = () => { alert('Armeria non ancora implementata.'); };
  closeBtn.onclick = () => { tavernaModal.style.display = 'none'; };
  window.onclick = (event) => { if (event.target === tavernaModal) tavernaModal.style.display = 'none'; };

  startMissionBtn.onclick = () => {
    const finalParty = [];
    const hiredDivs = document.querySelectorAll('.hired-hero');
    hiredDivs.forEach((div, index) => {
      const key = div.dataset.heroKey;
      const customName = div.querySelector('input').value;
      const heroData = {...allHeroes[key]};
      heroData.name = customName || heroData.name;
      heroData.id = index + 1;
      heroData.originalKey = key;
      finalParty.push(heroData);
    });

    if (finalParty.length === 0) {
      alert('Devi assoldare almeno un personaggio (Tristano è sempre con te)!');
      return;
    }

    localStorage.setItem('selectedParty', JSON.stringify(finalParty));
    if (window.opener && !window.opener.closed) {
      window.opener.startGameFromCastle();
      setTimeout(() => { window.close(); }, 100);
    }
  };

  renderRecruitableHeroes();
  renderHiredParty();
});
