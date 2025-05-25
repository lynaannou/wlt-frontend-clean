const BASE_URL = "https://wlt-usthb-backend.onrender.com/api/form";

// Soumettre le formulaire
export async function submitForm(data) {
  const res = await fetch(`${BASE_URL}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res;
}

// Vérifier si le prof a déjà soumis
export async function hasAlreadySubmitted(profId) {
  const res = await fetch(`${BASE_URL}/status?professeurId=${profId}`);
  return res.text();
}

// Vérifier si le formulaire est verrouillé
export async function isFormLocked() {
  const res = await fetch(`${BASE_URL}/locked`);
  return res.text();
}

// Récupérer les voeux actuels
export async function getCurrentVoeux(profId) {
  const res = await fetch(`${BASE_URL}/get?professeurId=${profId}`);
  return res.json();
}

// Récupérer les voeux de l'année précédente
export async function prefillFromLastYear(profId) {
  const res = await fetch(`${BASE_URL}/formulaire-choix?professeurId=${profId}&copierAnneePrecedente=true`, {
    method: "PUT"
  });
  return res.json();
}

// Filtrer modules
export async function getFilteredModules(semestre, pallier, specialite) {
  let url = `${BASE_URL}/modules?semestre=${semestre}&pallier=${pallier}`;
  if (specialite) url += `&specialite=${specialite}`;
  const res = await fetch(url);
  return res.json();
}

// Filtrer spécialités
export async function getFilteredSpecialites(semestre, pallier) {
  const res = await fetch(`${BASE_URL}/specialites?semestre=${semestre}&pallier=${pallier}`);
  return res.json();
}
// Enregistrer les voeux en localStorage pour affichage dans confirmation.html
export function saveVoeuxToLocalStorage(voeux) {
  const { semestre1, semestre2 } = voeux || {};

  const questions = {
    extraHoursS1: voeux.extraHoursS1 || 0,
    extraHoursS2: voeux.extraHoursS2 || 0,
    proposedLicence: voeux.proposedLicence || 0,
    proposedMaster: voeux.proposedMaster || 0,
    wantsExtraCourses: voeux.wantsExtraCourses || false
  };

  localStorage.setItem("semestre1", JSON.stringify(semestre1 || []));
  localStorage.setItem("semestre2", JSON.stringify(semestre2 || []));
  localStorage.setItem("besoins", JSON.stringify(questions));
}