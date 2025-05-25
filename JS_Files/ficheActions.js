import {
  submitForm,
  hasAlreadySubmitted,
  isFormLocked,
  getCurrentVoeux,
  prefillFromLastYear,
  getFilteredModules,
  getFilteredSpecialites
} from "./ficheHandler.js";

import { generateRows } from "./Fiche_de_voeux.js";
import { saveVoeuxToLocalStorage } from "./ficheHandler.js";


document.addEventListener("DOMContentLoaded", async () => {


  // Dès que l'utilisateur modifie extraS1 ou extraS2, on coche la case "veut des heures sup"
document.getElementById("extraS1").addEventListener("input", () => {
  const val = parseInt(document.getElementById("extraS1").value) || 0;
  document.getElementById("extraCheckbox").checked = val > 0;
});
document.getElementById("extraS2").addEventListener("input", () => {
  const val = parseInt(document.getElementById("extraS2").value) || 0;
  document.getElementById("extraCheckbox").checked = val > 0;
});


  const profId = localStorage.getItem("professeurId");
  const username = localStorage.getItem("username") || "Professeur";
  const email = localStorage.getItem("email") || "";

  if (!profId) {
    alert("Erreur : identifiant professeur introuvable. Veuillez vous reconnecter.");
    return;
  }

  document.getElementById("displayUsername").textContent = username;
  document.getElementById("displayEmail").textContent = email;

  // 🟢 Récupération locale du grade, bureau, email préféré
  document.getElementById("grade").value = localStorage.getItem("grade") || "";
  document.getElementById("officeNum").value = localStorage.getItem("numBureau") || "";
  document.getElementById("emailPref").value = localStorage.getItem("emailPref") || "";

  let currentData = await getCurrentVoeux(profId);
  console.log("🔍 Data received from backend:", currentData);


  // Corriger structure si getCurrentVoeux retourne un tableau simple
  let voeux = currentData;
  if (Array.isArray(voeux)) {
    currentData = {
      semestre1: voeux.slice(0, 3).map(v => ({ ...v, semestre: "S1" })),
      semestre2: voeux.slice(3, 6).map(v => ({ ...v, semestre: "S2" }))
    };
  }
  console.log("Voeux récupérés :", currentData);

  const sem1 = document.getElementById("sem1Rows");
  const sem2 = document.getElementById("sem2Rows");

sem1.innerHTML = "";
sem2.innerHTML = "";

if (!currentData || (!currentData.semestre1?.length && !currentData.semestre2?.length)) {
  generateRows(sem1, "s1", 3);
  generateRows(sem2, "s2", 3);
} else {
  const sem1Count = currentData.semestre1?.length || 0;
  const sem2Count = currentData.semestre2?.length || 0;
  generateRows(sem1, "s1", Math.max(3, sem1Count));
  generateRows(sem2, "s2", Math.max(3, sem2Count));
}

// ✅ Toujours appeler après génération de lignes
await attachDynamicFilters();
await remplirChoix(currentData);


  await attachDynamicFilters();
  await remplirChoix(currentData);

  document.getElementById("btn-status").addEventListener("click", async () => {
    const res = await hasAlreadySubmitted(profId);
    alert(res);
  });

  document.getElementById("btn-locked").addEventListener("click", async () => {
    const res = await isFormLocked();
    alert(res);
  });

  document.getElementById("btn-prefill").addEventListener("click", async () => {
    const anciens = await prefillFromLastYear(profId);
    await remplirChoix(anciens);
    alert("Choix de l'année précédente chargés !");
  });
document.getElementById("btn-submit").addEventListener("click", async () => {
  document.getElementById("questions").classList.remove("hidden");

  const licence = parseInt(document.getElementById("licenceCount").value) || 0;
  const master = parseInt(document.getElementById("masterCount").value) || 0;

  // 🔒 Blocage si l’un des deux est < 1
  if (licence < 1 || master < 1) {
    alert("Veuillez renseigner au moins 1 PFE pour la Licence et pour le Master.");
    return;
  }

  const formData = collectFormData();
  formData.professeurId = parseInt(profId);
  formData.emailPref = email;

  const res = await submitForm(formData);

  if (res.ok) {
    localStorage.setItem("confirmationData", JSON.stringify(formData));
    alert("Formulaire soumis avec succès !");
    saveVoeuxToLocalStorage(formData);
    window.location.href = "confirmation.html";
  } else {
    const text = await res.text();
    alert("Erreur : " + text);
  }
});

});

function collectFormData() {
  const formData = {
    semestre1: [],
    semestre2: [],
    wantsExtraCourses: document.getElementById("extraCheckbox").checked,
    extraHoursS1: parseInt(document.getElementById("extraS1").value) || 0,
    extraHoursS2: parseInt(document.getElementById("extraS2").value) || 0,
    proposedLicence: parseInt(document.getElementById("licenceCount").value) || 0,
    proposedMaster: parseInt(document.getElementById("masterCount").value) || 0,
    grade: document.getElementById("grade").value,
    numBureau: parseInt(document.getElementById("officeNum").value) || 0,
  };

  const rows = document.querySelectorAll("tbody tr");
  let s1Index = 1;
  let s2Index = 1;
  rows.forEach(row => {
    const selects = row.querySelectorAll("select");
    const checkboxes = row.querySelectorAll("input[type='checkbox']");

    const choix = {
      module: {
        niveau: selects[0].value,
        specialite: selects[1].value,
        nom: selects[2].value,
      },
      nature: [],
      semestre: selects[3].value,
      numChoix: 0
    };

    if (checkboxes[0].checked) choix.nature.push("COURS");
    if (checkboxes[1].checked) choix.nature.push("TD");
    if (checkboxes[2].checked) choix.nature.push("TP");

    if (choix.semestre === "S1") {
      choix.numChoix = s1Index++;
      formData.semestre1.push(choix);
    } else {
      choix.numChoix = s2Index++;
      formData.semestre2.push(choix);
    }
  });

  return formData;
}
async function remplirChoix(data) {
  const remplirBloc = async (voeuxList, rowsContainerId, semestre) => {
    const container = document.getElementById(rowsContainerId);
    const rows = container.querySelectorAll("tr");

  for (const voeu of voeuxList) {
  const rowIndex = voeu.numChoix - 1; // car les lignes commencent à 0
  const row = rows[rowIndex];
  if (!row) continue;
  await remplirLigne(row, voeu, semestre);
}

  };

  await remplirBloc(data.semestre1 || [], "sem1Rows", "S1");
  await remplirBloc(data.semestre2 || [], "sem2Rows", "S2");

  document.getElementById("extraCheckbox").checked = !!data.wantsExtraCourses;
  document.getElementById("extraS1").value = data.extraHoursS1 || 0;
  document.getElementById("extraS2").value = data.extraHoursS2 || 0;
  document.getElementById("licenceCount").value = data.proposedLicence || 0;
  document.getElementById("masterCount").value = data.proposedMaster || 0;
  document.getElementById("grade").value = data.grade || "";
  document.getElementById("officeNum").value = data.numBureau || "";
  document.getElementById("emailPref").value = data.emailPref || "";
}

// ✅ expose à window pour que les autres fichiers puissent l'appeler
window.remplirChoix = remplirChoix;
window.attachDynamicFilters = attachDynamicFilters;


async function remplirLigne(row, voeu, semestre) {
  const selects = row.querySelectorAll("select");
  const checkboxes = row.querySelectorAll("input[type='checkbox']");

  const niveau = voeu.module.pallier || "";
  const specialite = voeu.module.specialite || "";
  const moduleNom = voeu.module.nom || "";

  if (niveau) selects[0].value = niveau;
  selects[3].value = semestre;

  const specialites = await getFilteredSpecialites(semestre, niveau);
  if (!specialites.includes(specialite)) {
    specialites.unshift(specialite);
  }
  selects[1].innerHTML = `<option>--</option>` + specialites.map(s => `<option>${s}</option>`).join("");
  if (specialite) selects[1].value = specialite;

  const modules = await getFilteredModules(semestre, niveau, specialite);
  if (!modules.map(m => m.nom).includes(moduleNom)) {
    modules.unshift({ nom: moduleNom });
  }
  selects[2].innerHTML = `<option>--</option>` + modules.map(m => `<option>${m.nom}</option>`).join("");
  if (moduleNom) selects[2].value = moduleNom;

  checkboxes[0].checked = voeu.nature?.includes("COURS") || false;
  checkboxes[1].checked = voeu.nature?.includes("TD") || false;
  checkboxes[2].checked = voeu.nature?.includes("TP") || false;
}


function attachDynamicFilters() {
  const rows = document.querySelectorAll("tbody tr");
  const promises = [];

  rows.forEach(row => {
    const selects = row.querySelectorAll("select");
    const niveauSelect = selects[0];
    const specSelect = selects[1];
    const modSelect = selects[2];
    const semSelect = selects[3];

    const updateSpecialites = async () => {
      const niveau = niveauSelect.value;
      const semestre = semSelect.value;
      const specialites = await getFilteredSpecialites(semestre, niveau);
      specSelect.innerHTML = `<option>--</option>` + specialites.map(s => `<option>${s}</option>`).join("");
      modSelect.innerHTML = `<option>--</option>`;
    };

    niveauSelect.addEventListener("change", updateSpecialites);
    semSelect.addEventListener("change", updateSpecialites);

    specSelect.addEventListener("change", async () => {
      const niveau = niveauSelect.value;
      const semestre = semSelect.value;
      const specialite = specSelect.value;
      const modules = await getFilteredModules(semestre, niveau, specialite);
      modSelect.innerHTML = `<option>--</option>` + modules.map(m => `<option>${m.nom}</option>`).join("");
    });

    promises.push(updateSpecialites());
   window.remplirChoix = remplirChoix;
window.attachDynamicFilters = attachDynamicFilters;



  });

  return Promise.all(promises);
 
}