export function generateRows(tableBody, semestrePrefix, count = 3) {
  console.log("✅ generateRows called for:", semestrePrefix, "with", count, "rows");
  tableBody.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>Choix ${i + 1}</td>
      <td><select><option>L1</option><option>L2</option><option>L3</option><option>M1</option><option>M2</option></select></td>
      <td><select><option>--</option></select></td>
      <td><select><option>--</option></select></td>
      <td><select><option value="S1">S1</option><option value="S2">S2</option></select></td>
      <td><input type="checkbox" /></td>
      <td><input type="checkbox" /></td>
      <td><input type="checkbox" /></td>
    `;
    tableBody.appendChild(row);
  }
}
document.addEventListener("DOMContentLoaded", async () => {

 
    console.log("✅ generateRows called for:", semestrePrefix, "with", count, "rows");
    

  // Récupération des éléments HTML
  const sem1 = document.getElementById("sem1Rows");
  const sem2 = document.getElementById("sem2Rows");

  // Récupération de l'ID du professeur
  const profId = localStorage.getItem("professeurId");
  if (!profId || !window.getCurrentVoeux || !window.remplirChoix || !window.attachDynamicFilters) return;

  // Récupération des données
  const currentData = await window.getCurrentVoeux(profId);
  const sem1Count = currentData?.semestre1?.length || 0;
  const sem2Count = currentData?.semestre2?.length || 0;

  // Génération dynamique
  window.generateRows(sem1, "s1", Math.max(3, sem1Count));
  window.generateRows(sem2, "s2", Math.max(3, sem2Count));
  await window.attachDynamicFilters();
  await window.remplirChoix(currentData);
 


});

 
