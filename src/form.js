let non = document.querySelector("#alreadyhandball-non");
let alreadyhandball = document.querySelector("#alreadyhandball");



  if (non.checked === true) {
	let form_handball = document.querySelector("#form-handball");
    // Supprimer le formulaire si la case "non" est cochée et le formulaire existe
    form_handball.remove();
	non.parentNode.parentNode.style.marginBottom = "0.75rem";
	  }

alreadyhandball.addEventListener("click", () => {
  let form_handball = document.querySelector("#form-handball");

  if (non.checked === true && form_handball) {
    // Supprimer le formulaire si la case "non" est cochée et le formulaire existe
    form_handball.remove();
  } else if (non.checked === false && !form_handball) {
    // Si "non" est décoché et que le formulaire n'existe pas, on le recrée
    let newForm = document.createElement("div");
    newForm.id = "form-handball";
    newForm.className = "flex flex-col gap-2";
    newForm.innerHTML = `
            <div>
              <label
                for="level"
                class="flex flex-col gap-1 text-sm font-medium text-orange-500"
                >Niveau de pratique
                <select
                  id="level"
                  name="level"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="" disabled selected>
                    Choisissez un niveau
                  </option>
                  <option value="Division">Division</option>
                  <option value="excellence">Excellence</option>
                  <option value="Aura">Aura</option>
                  <option value="France">France</option>
                </select>
              </label>
            </div>
            <div>
              <!-- Label principal -->
              <label
                for="handballPositions"
                class="block text-sm font-medium text-orange-500 mb-2"
              >
                Quels sont vos postes préférés au handball ? (choix multiple
                possible)
              </label>

              <!-- Formulaire pour choisir plusieurs postes -->
                <div class="mb-2">
                  <input
                    type="checkbox"
                    id="posteGardien"
                    name="postes"
                    value="gardien"
                    class="h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-400 accent-orange-500"
                  />
                  <label for="posteGardien" class="ml-2 text-orange-500"
                    >Gardien</label
                  >
                </div>

                <div class="mb-2">
                  <input
                    type="checkbox"
                    id="posteAilier"
                    name="postes"
                    value="ailier"
                    class="h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-400 accent-orange-500"
                  />
                  <label for="posteAilier" class="ml-2 text-orange-500"
                    >Ailier</label
                  >
                </div>

                <div class="mb-2">
                  <input
                    type="checkbox"
                    id="posteArrière"
                    name="postes"
                    value="arrière"
                    class="h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-400 accent-orange-500"
                  />
                  <label for="posteArrière" class="ml-2 text-orange-500"
                    >Arrière</label
                  >
                </div>

                <div class="mb-2">
                  <input
                    type="checkbox"
                    id="postePivot"
                    name="postes"
                    value="pivot"
                    class="h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-400 accent-orange-500"
                  />
                  <label for="postePivot" class="ml-2 text-orange-500"
                    >Pivot</label
                  >
                </div>

                <div class="mb-2">
                  <input
                    type="checkbox"
                    id="posteDemiCentre"
                    name="postes"
                    value="demi-centre"
                    class="h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-400 accent-orange-500"
                  />
                  <label for="posteDemiCentre" class="ml-2 text-orange-500"
                    >Demi-centre</label
                  >
                </div>
    `;

    // Insérer le formulaire après la case "non"
    alreadyhandball.parentNode.insertBefore(newForm, alreadyhandball.nextSibling);
  }
});
