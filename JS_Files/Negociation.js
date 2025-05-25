const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("chatInput");
const messageContainer = document.getElementById("messages");
const statsDisplay = document.getElementById("stats");
const conversationList = document.getElementById("conversationList");

const email = (localStorage.getItem("email") || "").toLowerCase();
const profId = parseInt(localStorage.getItem("professeurId")); // utilisé si ce n’est pas un admin

const adminEmails = [
  "lies.kaddouri@univ.dz",
  "faiza.djidel@univ.dz",
  
];

const isAdmin = adminEmails.includes(email);

// 🟣 Ajout classe pour le CSS si prof
if (!isAdmin) {
  document.body.classList.add("prof-mode");
}

let currentUserId = profId;
let chefDepartementId = null;
let contactId = isAdmin ? null : 1;
let chefDepartementNom = null;
let currentContactName = "";

const messages = [];

document.addEventListener("DOMContentLoaded", () => {
  const chatHeader = document.getElementById("chatHeader");

  if (isAdmin && chatHeader) {
    chatHeader.style.display = "none";
  }

  if (isAdmin) {
    fetch(`https://wlt-usthb-backend.onrender.com/api/professeurs/by-email?email=${encodeURIComponent(email)}`)
      .then(res => {
        if (!res.ok) throw new Error("Professeur introuvable");
        return res.json();
      })
      .then(prof => {
        if (!prof || !prof.departement) {
          alert("Erreur récupération admin : Professeur ou département invalide");
          return;
        }

        currentUserId = prof.id;
        chefDepartementId = prof.departement.idDepartement || prof.departement;
        chefDepartementNom = prof.departement.nomDepartement || prof.departement;

        console.log("Admin connecté :", prof.nom, "| ID:", currentUserId, "| Département ID:", chefDepartementId);

        loadConversations();
      })
      .catch(err => {
        console.error("Erreur récupération admin :", err);
        alert("Impossible de charger les informations de l'administrateur.");
      });
  } else {
    // Professeur
    fetch(`https://wlt-usthb-backend.onrender.com/api/professeurs/conversation-with-chef/${currentUserId}`)
      .then(res => res.json())
      .then(id => {
        conversationId = id;
        currentContactName = "Votre Chef";
        document.getElementById("chatWith").textContent = `Conversation avec ${currentContactName}`;
        document.getElementById("chatForm").classList.remove("hidden");
        loadMessages();
      })
      .catch(err => {
        console.error("Erreur récupération de la conversation avec le chef :", err);
        alert("Impossible de trouver une conversation avec votre chef.");
      });
  }
});

chatForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const newMessage = messageInput.value.trim();
  if (!newMessage) return;

  fetch("https://wlt-usthb-backend.onrender.com/api/messagerie/messages/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      senderId: currentUserId,
      conversationId: conversationId,
      content: newMessage
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("Erreur d'envoi");
      return res.text();
    })
    .then(() => {
      messageInput.value = "";
      loadMessages();
    })
    .catch(err => alert("Erreur : " + err.message));
});

function loadConversations() {
  if (!isAdmin) return;

  fetch(`https://wlt-usthb-backend.onrender.com/api/professeurs/by-departement/${encodeURIComponent(chefDepartementId)}?chefId=${currentUserId}`)
    .then(res => res.json())
    .then(data => {
      console.log("Professeurs reçus :", data);
      conversationList.innerHTML = "<strong>Conversations :</strong><br/>";

      data.forEach(prof => {
        if (!prof.departement || prof.departement !== chefDepartementId) return;

        const btn = document.createElement("button");
        btn.textContent = `${prof.nom}`;
        btn.style.margin = "5px";
        btn.style.padding = "5px 10px";
        btn.style.borderRadius = "10px";
        btn.style.background = "#5FA9DD";
        btn.style.color = "white";
        btn.style.border = "none";
        btn.style.cursor = "pointer";

        btn.onclick = () => {
          contactId = prof.id;
          conversationId = prof.conversationId;
          currentContactName = prof.nom;

          console.log("🖱️ Conversation sélectionnée : ID =", conversationId, "| Nom prof =", currentContactName);

          document.querySelectorAll('#conversationList button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          document.getElementById("chatWith").textContent = `Conversation avec ${currentContactName}`;
          document.getElementById("chatForm").classList.remove("hidden");

          loadMessages();
        };

        conversationList.appendChild(btn);
      });
    })
    .catch(err => console.error("Erreur chargement conversations :", err));
}

function loadMessages() {
  if (!conversationId) {
    console.warn("Pas encore de conversation : affichage vide.");
    document.getElementById("chatWith").textContent = `Conversation avec ${currentContactName}`;
    document.getElementById("chatForm").classList.remove("hidden");

    messages.length = 0;
    renderMessages();
    updateStats();
    return;
  }

  console.log("📨 Chargement messages pour conversation ID:", conversationId);

  fetch(`https://wlt-usthb-backend.onrender.com/api/messagerie/by-conversation?conversationId=${conversationId}`)
    .then(res => res.json())
    .then(data => {
      console.log("📬 Messages reçus:", data);

      messages.length = 0;
      data.forEach(msg => {
        const isSentByCurrentUser = msg.senderId === currentUserId;
        messages.push({
          from: isSentByCurrentUser ? "sent" : "received",
          text: msg.contenu,
        });
      });

      renderMessages();
      updateStats();
    })
    .catch(err => console.error("Erreur chargement messages:", err));
}

function renderMessages() {
  messageContainer.innerHTML = "";
  messages.forEach((msg) => {
    const li = document.createElement("li");
    li.className = `message ${msg.from}`;
    li.innerHTML = `<span class="msg-text">${msg.text}</span>`;
    messageContainer.appendChild(li);
  });
}

function updateStats() {
  const total = messages.length;
  const delivered = messages.filter(m => m.status === "delivered").length;
  const seen = messages.filter(m => m.status === "seen").length;
  // Stats usage here if needed
}