// Supabase laden und initialisieren
// Füge dies im <head> deiner HTML-Datei hinzu, falls noch nicht vorhanden:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
if (typeof createClient === "undefined" && typeof supabase !== "undefined") {
  var createClient = supabase.createClient;
}
var supabaseClient = window.supabase
  ? window.supabase.createClient(
      'https://bkrkztfybcmccwjjufym.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcmt6dGZ5YmNtY2N3amp1ZnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTk0OTAsImV4cCI6MjA2NTQ5NTQ5MH0.Wrtn346kdT51S7xyr2eN97idN7pkMGFhmAMLzW_-pvU'
    )
  : createClient(
      'https://bkrkztfybcmccwjjufym.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcmt6dGZ5YmNtY2N3amp1ZnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTk0OTAsImV4cCI6MjA2NTQ5NTQ5MH0.Wrtn346kdT51S7xyr2eN97idN7pkMGFhmAMLzW_-pvU'
    );

// Smiley anzeigen bei „Rechnung bitte“
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("rechnungButton");
  const smiley = document.getElementById("smiley");

  if (btn && smiley) {
    btn.addEventListener("click", function () {
      smiley.style.display = "block";
      setTimeout(() => {
        smiley.style.display = "none";
      }, 2000);
    });
  }
});

// Eissorten-Kugelauswahl anzeigen/verstecken
function toggleScoopMenu(iceId) {
  const menu = document.getElementById(`scoops_${iceId}`);
  const checkbox = document.getElementById(iceId);
  if (menu && checkbox) {
    menu.classList.toggle("hidden", !checkbox.checked);
  }
}
window.toggleScoopMenu = toggleScoopMenu;

// Getränkemenü ein-/ausblenden
function toggleDrinks(show) {
  const drinksMenu = document.getElementById('drinksMenu');
  if (drinksMenu) {
    drinksMenu.classList.toggle('hidden', !show);
  }
}
// Eis & Toppings deaktivieren (z.B. bei „nur Getränk“)
function disableFields(disable) {
  const iceCheckboxes = document.querySelectorAll('.ice');
  const toppingCheckboxes = document.querySelectorAll('.topping');
  const scoopsSelects = document.querySelectorAll('.scoops-menu select');

  iceCheckboxes.forEach(cb => {
    cb.disabled = disable;
    if (disable) cb.checked = false;
  });

  toppingCheckboxes.forEach(cb => cb.disabled = disable);
  scoopsSelects.forEach(s => s.disabled = disable);

  // Eismenus ausblenden
  const scoopMenus = document.querySelectorAll('.scoops-menu');
  scoopMenus.forEach(menu => menu.classList.add('hidden'));
}
window.disableFields = disableFields;


// Bestellung absenden
async function sendOrder() {
  const name = document.getElementById('name').value.trim();

  // Eis-Sorten
  const iceCheckboxes = document.querySelectorAll(".ice:checked");
  const ice = Array.from(iceCheckboxes).map(el => el.value);
  const scoops = {};

  ice.forEach(flavor => {
    const id = flavor.toLowerCase();
    const scoopSelect = document.querySelector(`#scoops_${id} select`);
    scoops[flavor] = scoopSelect?.value || "1";
  });

  // Toppings nur speichern, wenn Eis gewählt wurde
  const toppings = (ice.length > 0) 
    ? Array.from(document.querySelectorAll(".topping:checked")).map(el => el.value).join(", ")
    : "";  // Wenn kein Eis, keine Toppings speichern

  // Getränk
  const drinkChoice = document.querySelector('input[name="drinkChoice"]:checked')?.value;
  const drinks = (drinkChoice === 'getraenke' || drinkChoice === 'nurgetraenk') ? document.getElementById('drinks')?.value : "Kein Getränk";

  const status = document.getElementById("status");

  if (!name) {
    status.innerText = "❗ Bitte gib deinen Namen ein.";
    status.className = "error";
    return;
  }

  if (drinkChoice !== 'nurgetraenk' && ice.length === 0) {
    status.innerText = "❗ Bitte wähle mindestens eine Eissorte oder nur ein Getränk.";
    status.className = "error";
    return;
  }

  try {
    const { data, error } = await supabaseClient.from('orders').insert([
      {
        name,
        ice: ice.length ? ice.join(", ") : null,
        scoops: JSON.stringify(scoops),
        toppings,
        drinks
      }
    ]);

    if (error) {
      console.error("Fehler beim Speichern:", error);
      status.innerText = "❌ Fehler beim Absenden.";
      status.className = "error";
    } else {
      status.innerText = "✅ Bestellung erfolgreich abgesendet!";
      status.className = "success";

      // Zeige nach 2 Sekunden die „Vielen Dank“-Nachricht
      setTimeout(() => {
        status.innerText = "😊 Vielen Dank für Ihre Bestellung!";
        status.className = "success";
      }, 2000); // 2 Sekunden Verzögerung

      // Formular zurücksetzen
      document.getElementById('name').value = "";
      document.querySelectorAll("input[type='checkbox'], input[type='radio']").forEach(el => el.checked = false);
      document.getElementById('drinks').value = "Cola";
      toggleDrinks(false);
      disableFields(false);
      document.querySelectorAll('.scoops-menu').forEach(menu => menu.classList.add('hidden'));

      setTimeout(() => {
        status.innerText = "";
        status.className = "";
      }, 4000);
    }
  } catch (err) {
    console.error("Unbekannter Fehler:", err);
    status.innerText = "❌ Unerwarteter Fehler.";
    status.className = "error";
  }
}

function disableFields(disable) {
  const iceCheckboxes = document.querySelectorAll('.ice');
  const toppingCheckboxes = document.querySelectorAll('.topping');
  const scoopsSelects = document.querySelectorAll('.scoops-menu select');
  const scoopMenus = document.querySelectorAll('.scoops-menu');

  // Eis-Checkboxen abwählen & deaktivieren
  iceCheckboxes.forEach(cb => {
    if (disable) cb.checked = false;
    cb.disabled = disable;
  });

  // Toppings abwählen & deaktivieren (Reihenfolge wichtig!)
  toppingCheckboxes.forEach(cb => {
    if (disable) cb.checked = false;
    cb.disabled = disable;
  });

  // Kugelanzahl-Auswahl deaktivieren
  scoopsSelects.forEach(select => select.disabled = disable);

  // Kugel-Menüs verstecken
  scoopMenus.forEach(menu => menu.classList.add('hidden'));
}
