document.addEventListener("DOMContentLoaded", async () => {
  const username = localStorage.getItem("username");
  const emailRaw = localStorage.getItem("email");
  const email = emailRaw ? emailRaw.toLowerCase().trim() : null;
  const professeurId = localStorage.getItem("professeurId");

  console.log("🆔 professeurId from localStorage:", professeurId);
  console.log("📧 email:", email);

  document.getElementById("displayUsername").textContent = username || "No Username";
  document.getElementById("displayEmail").textContent = email || "No Email";
  document.getElementById("displayProfId").textContent = professeurId || "ID introuvable";

  const admins = [
     "lies.kaddouri@univ.dz",
  "faiza.djidel@univ.dz",
  
  ];

  let isAdmin = email ? admins.includes(email) : false;
  console.log("👤 isAdmin:", isAdmin);
  localStorage.setItem("isChef", isAdmin ? "true" : "false");

  if (isAdmin) {
    const statLink = document.getElementById("statLink");
    if (statLink) statLink.style.display = "flex";
  }

  const countdownDiv = document.getElementById("deadlineCountdown");
  let deadlineStr = null;

  async function getDeadline() {
    const res = await fetch("https://wlt-usthb-backend.onrender.com/api/admin/deadline");
    const text = await res.text();
    return text;
  }

  async function postDeadline(payload) {
    const res = await fetch("https://wlt-usthb-backend.onrender.com/api/admin/deadline", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    return res;
  }

  try {
    const res = await getDeadline();
    if (res && res.includes("Deadline is active")) {
      deadlineStr = res.split(": ")[1];
      localStorage.setItem("deadline", deadlineStr);
    } else {
      countdownDiv.textContent = "⏰ Aucune date limite définie.";
    }
  } catch (err) {
    countdownDiv.textContent = "Erreur de récupération de la deadline.";
    console.error(err);
  }

  function updateCountdown() {
    if (!deadlineStr) return;
    const deadline = new Date(`${deadlineStr}T23:59:59`);
    const now = new Date();
    const diff = deadline - now;

    if (diff <= 0) {
      countdownDiv.textContent = "⛔ La période de soumission est terminée.";
    } else {
      const days = Math.floor(diff / 86_400_000);
      const hours = Math.floor((diff / 3_600_000) % 24);
      const minutes = Math.floor((diff / 60_000) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      countdownDiv.textContent = `⏳ Temps restant : ${days}j ${hours}h ${minutes}m ${seconds}s`;
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  if (isAdmin) {
    const form = document.createElement("form");
    form.innerHTML = `
      <label for="newDeadline">Changer la deadline :</label>
      <input type="date" id="newDeadline" required>
      <button type="submit">Définir</button>
    `;
    countdownDiv.insertAdjacentElement("afterend", form);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newDeadline = document.getElementById("newDeadline").value;
      console.log("📨 Envoi deadline:", { deadline: newDeadline, profId: professeurId }); 

      try {
        await postDeadline({ deadline: newDeadline, profId: professeurId });
        alert("✅ Nouvelle deadline définie !");
        deadlineStr = newDeadline;
        localStorage.setItem("deadline", newDeadline);
      } catch (err) {
        alert("❌ Erreur lors de la mise à jour !");
        console.error(err);
      }
    });
  }
});