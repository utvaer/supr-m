const CONTENT = {

  // ── Écran d'intro ─────────────────────────────────────────────────────────
  intro: {
    message: "Quelques mots de ceux qui t'aiment, puis une grande surprise...",
  },

  // ── Messages des familles ──────────────────────────────────────────────────
  familles: [
    {
      nom: "Les Gasser/Gamboni",
      message: "Des moments pour créer de precieux souvenirs avec celles et ceux que l'on aime",
      indice: "Rosé et pétanque",
    },
    {
      nom: "Les Gasser/Maffli",
      message: "Tes enfants et leur moitiés ont tenu, à leur manière, à t'honorer pour tes 50 ans. On t'aime et on se réjouit!",
      indice: "On l'a déjà vécu et on va essayer de faire encore mieux.",
    },
    {
      nom: "Les Gasser/Thompson",
      message: "Joyeux anniversaire, Mams! On a hâte de fêter ça comme il se doit.",
      indice: "On sera proche d'un château et du pape, apparemment?",
    },
  ],

  // ── Destination & détails ──────────────────────────────────────────────────
  destination: {
    nom: "Pierrelatte",
    image: "assets/destination.jpeg",
    dates: "Du 18 au 25 juillet 2026",
    programme: [
      "Baignade",
      "Apéro",
      "Balades",
      "Découvertes"
    ],
    note: "Vivement les vacances en famille dans la vallée du Rhône! On garde nos apéros, mais dans une nouvelle région cette fois.",
  },

};

// ── Populate DOM ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('intro-message').textContent = CONTENT.intro.message;

  CONTENT.familles.forEach((f, i) => {
    document.getElementById(`family-nom-${i}`).textContent       = f.nom;
    document.getElementById(`family-message-${i}`).textContent   = `« ${f.message} »`;
    document.getElementById(`family-indice-${i}`).textContent    = `« ${f.indice} »`;
  });

  document.querySelectorAll('.js-destination').forEach(el => {
    el.textContent = CONTENT.destination.nom;
  });

  const heroImg = document.getElementById('hero-img');
  heroImg.src = CONTENT.destination.image;
  heroImg.alt = CONTENT.destination.nom;

  document.getElementById('trip-dates').textContent = CONTENT.destination.dates;

  const ul = document.getElementById('trip-programme');
  ul.innerHTML = '';
  CONTENT.destination.programme.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  });

  document.getElementById('closing-note').textContent = `« ${CONTENT.destination.note} »`;
});
