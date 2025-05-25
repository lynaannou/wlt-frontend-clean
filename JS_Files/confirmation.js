export function renderConfirmation() {
  // Show the summary block and hide the thank-you block
  document.getElementById("thankYouBox").classList.add("hidden");
  document.getElementById("summaryBox").classList.remove("hidden");

  // Nom et email
  document.getElementById("userName").textContent = localStorage.getItem("username") || "--";
  document.getElementById("userEmail").textContent = localStorage.getItem("email") || "--";

  // Get real saved choices
  const sem1 = JSON.parse(localStorage.getItem("semestre1") || "[]");
  const sem2 = JSON.parse(localStorage.getItem("semestre2") || "[]");
  const besoins = JSON.parse(localStorage.getItem("besoins") || "{}");

  const sem1List = document.getElementById("sem1Choices");
  const sem2List = document.getElementById("sem2Choices");
  const extraList = document.getElementById("extras");

  sem1List.innerHTML = "";
  sem2List.innerHTML = "";
  extraList.innerHTML = "";

  sem1.forEach(voeu => {
    const li = document.createElement("li");
    li.textContent = `${voeu.module.niveau} - ${voeu.module.specialite} - ${voeu.module.nom} (${voeu.nature?.join(", ") || "aucune nature"})`;
    sem1List.appendChild(li);
  });

  sem2.forEach(voeu => {
    const li = document.createElement("li");
    li.textContent = `${voeu.module.niveau} - ${voeu.module.specialite} - ${voeu.module.nom} (${voeu.nature?.join(", ") || "aucune nature"})`;
    sem2List.appendChild(li);
  });

  const extras = [
    `Heures supplémentaires S1 : ${besoins.extraHoursS1 ?? 0}`,
    `Heures supplémentaires S2 : ${besoins.extraHoursS2 ?? 0}`,
    `PFE Licence : ${besoins.proposedLicence ?? 0}`,
    `PFE Master : ${besoins.proposedMaster ?? 0}`,
    `Souhaite heures supp : ${besoins.wantsExtraCourses ? "Oui" : "Non"}`
  ];

  extras.forEach(text => {
    const li = document.createElement("li");
    li.textContent = text;
    extraList.appendChild(li);
  });
}