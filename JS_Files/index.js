console.log("hi");

//import { login, register } from "./JS_Files/api.js";

document.addEventListener("DOMContentLoaded", () => {
  // PANEL TOGGLES
  const registerBtn = document.getElementById("register");
  const alreadyLoginBtn = document.getElementById("aleady_login");

  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      document.getElementById("already").classList.remove("hidden");
      document.getElementById("login").classList.add("hidden");
      document.getElementById("registerr").classList.remove("hidden");
      document.getElementById("welcome").classList.add("hidden");
    });
  }

  if (alreadyLoginBtn) {
    alreadyLoginBtn.addEventListener("click", () => {
      document.getElementById("already").classList.add("hidden");
      document.getElementById("login").classList.remove("hidden");
      document.getElementById("registerr").classList.add("hidden");
      document.getElementById("welcome").classList.remove("hidden");
    });
  }

  // PRELOADER
  setTimeout(() => {
    document.getElementById("preload").classList.add("hidden");
    document.getElementById("container").classList.remove("hidden");
  }, 1500);

  // TOGGLE PASSWORD VISIBILITY
  const passwordIcon = document.getElementById("password");
  const passwordField = document.getElementById("passwordInput");
  if (passwordIcon && passwordField) {
    passwordIcon.addEventListener("click", () => {
      const type = passwordField.getAttribute("type");
      passwordField.setAttribute("type", type === "password" ? "text" : "password");
    });
  }

  // GESTION LOGIN
  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      const email = document.getElementById("emailInput").value;
      const password = document.getElementById("passwordInput").value;

      try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        console.log("✅ LOGIN RESPONSE:", data);
        console.log("📌 Type de data:", typeof data);
        console.log("📌 Contenu exact:", JSON.stringify(data));

        if (response.ok && data.professeurId) {
          console.log("🎯 Storing ID:", data.professeurId);
          localStorage.setItem("professeurId", data.professeurId);
          localStorage.setItem("email", email);
          localStorage.setItem("username", email.split("@")[0]);
          localStorage.setItem("grade", data.grade || "");
          localStorage.setItem("numBureau", data.numBureau || "");
          localStorage.setItem("emailPref", data.emailPref || "");


          alert("Connexion réussie !");
          window.location.href = "Loged%20in.html";
        } else {
          alert("❌ professeurId manquant dans la réponse !");
          console.warn("❌ Login response doesn't contain professeurId:", data);
        }

      } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur lors de la connexion");
      }
    });
  }
});
