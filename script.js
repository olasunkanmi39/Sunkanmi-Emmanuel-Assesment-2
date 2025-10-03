const apiBase = "https://restcountries.com/v3.1";

    async function loadRegion() {
      const region = document.getElementById("regionSelect").value;
      const status = document.getElementById("status");
      const container = document.getElementById("countriesContainer");
      const details = document.getElementById("countryDetails");

      status.textContent = "Loading...";
      status.className = "loading";
      container.innerHTML = "";
      details.style.display = "none";

      try {
        const response = await fetch(`${apiBase}/region/${region}`);
        if (!response.ok) throw new Error("Region not found");
        const data = await response.json();

        status.textContent = `Found ${data.length} countries in ${region}`;
        status.className = "success";
        
        container.innerHTML = data.map(c => `
          <div class="country-card" onclick="showDetails('${c.name.common}')">
            <img src="${c.flags.png}" alt="Flag of ${c.name.common}" />
            <div class="country-card-content">
              <h3>${c.name.common}</h3>
              <p><b>Region:</b> ${c.region}</p>
              <p><b>Population:</b> ${c.population.toLocaleString()}</p>
            </div>
          </div>
        `).join("");
      } catch (error) {
        status.textContent = error.message;
        status.className = "error";
      }
    }

    async function showDetails(countryName) {
      const details = document.getElementById("countryDetails");
      const status = document.getElementById("status");
      
      status.textContent = "Loading details...";
      status.className = "loading";
      details.style.display = "none";

      try {
        // Fetch by name with fullText=true to get exact match
        const response = await fetch(`${apiBase}/name/${countryName}?fullText=true`);
        if (!response.ok) throw new Error("Country not found");
        const data = await response.json();
        const c = data[0];

        // Fetch additional data using the other APIs
        const [currencyData, languageData, capitalData] = await Promise.all([
          c.currencies ? fetch(`${apiBase}/currency/${Object.keys(c.currencies)[0]}`).then(res => res.ok ? res.json() : []) : Promise.resolve([]),
          c.languages ? fetch(`${apiBase}/lang/${Object.values(c.languages)[0]}`).then(res => res.ok ? res.json() : []) : Promise.resolve([]),
          c.capital ? fetch(`${apiBase}/capital/${c.capital[0]}`).then(res => res.ok ? res.json() : []) : Promise.resolve([])
        ]);

        status.textContent = "";
        details.style.display = "block";
        
        details.innerHTML = `
          <div class="details-header">
            <h2>${c.name.common}</h2>
            <img src="${c.flags.png}" width="40" alt="Flag of ${c.name.common}">
          </div>
          <div class="details-grid">
            <div class="detail-section">
              <h3>Basic Information</h3>
              <p><b>Capital:</b> ${c.capital ? c.capital[0] : "N/A"}</p>
              <p><b>Region:</b> ${c.region}</p>
              <p><b>Subregion:</b> ${c.subregion || "N/A"}</p>
              <p><b>Population:</b> ${c.population.toLocaleString()}</p>
              <p><b>Area:</b> ${c.area ? c.area.toLocaleString() + " km²" : "N/A"}</p>
            </div>
            
            <div class="detail-section">
              <h3>Languages</h3>
              <ul>
                ${c.languages ? Object.values(c.languages).map(lang => `<li>${lang}</li>`).join("") : "<li>N/A</li>"}
              </ul>
              ${languageData.length > 0 ? 
                `<p><b>Other countries speaking ${Object.values(c.languages)[0]}:</b> ${Math.min(languageData.length, 5)} countries</p>` : 
                ""}
            </div>
            
            <div class="detail-section">
              <h3>Currencies</h3>
              <ul>
                ${c.currencies ? Object.values(c.currencies).map(curr => 
                  `<li>${curr.name} (${curr.symbol || "N/A"})</li>`
                ).join("") : "<li>N/A</li>"}
              </ul>
              ${currencyData.length > 0 ? 
                `<p><b>Other countries using ${Object.keys(c.currencies)[0]}:</b> ${Math.min(currencyData.length, 5)} countries</p>` : 
                ""}
            </div>
            
            <div class="detail-section">
              <h3>Timezones</h3>
              <ul>
                ${c.timezones.map(tz => `<li>${tz}</li>`).join("")}
              </ul>
            </div>
            
            <div class="detail-section">
              <h3>Location</h3>
              <p><b>Coordinates:</b> ${c.latlng ? c.latlng.join(", ") : "N/A"}</p>
              <a href="${c.maps.googleMaps}" target="_blank" class="map-link">🌐 View on Google Maps</a>
            </div>
            
            ${capitalData.length > 0 ? `
            <div class="detail-section">
              <h3>About the Capital</h3>
              <p><b>Other countries with capital "${c.capital[0]}":</b> ${capitalData.length}</p>
            </div>
            ` : ""}
          </div>
        `;
      } catch (error) {
        status.textContent = error.message;
        status.className = "error";
      }
    }

    async function searchByDemonym() {
      const demonym = document.getElementById("demonymInput").value.trim();
      const status = document.getElementById("status");
      const container = document.getElementById("countriesContainer");
      const details = document.getElementById("countryDetails");

      if (!demonym) {
        status.textContent = "Please enter a demonym.";
        status.className = "error";
        return;
      }

      status.textContent = "Loading...";
      status.className = "loading";
      container.innerHTML = "";
      details.style.display = "none";

      try {
        const response = await fetch(`${apiBase}/demonym/${demonym}`);
        if (!response.ok) throw new Error("No countries found for this demonym");
        const data = await response.json();

        status.textContent = `Found ${data.length} countries with demonym "${demonym}"`;
        status.className = "success";
        
        container.innerHTML = data.map(c => `
          <div class="country-card" onclick="showDetails('${c.name.common}')">
            <img src="${c.flags.png}" alt="Flag of ${c.name.common}" />
            <div class="country-card-content">
              <h3>${c.name.common}</h3>
              <p><b>Demonym:</b> ${c.demonyms?.eng?.m || "N/A"} / ${c.demonyms?.eng?.f || "N/A"}</p>
              <p><b>Region:</b> ${c.region}</p>
              <p><b>Population:</b> ${c.population.toLocaleString()}</p>
            </div>
          </div>
        `).join("");
      } catch (error) {
        status.textContent = error.message;
        status.className = "error";
      }
    }

    async function fetchWithFields() {
      const service = document.getElementById("serviceInput").value.trim();
      const fields = document.getElementById("fieldsInput").value.trim();
      const status = document.getElementById("status");
      const container = document.getElementById("countriesContainer");
      const details = document.getElementById("countryDetails");

      if (!service || !fields) {
        status.textContent = "Please enter both service and fields.";
        status.className = "error";
        return;
      }

      status.textContent = "Loading...";
      status.className = "loading";
      container.innerHTML = "";
      details.style.display = "none";

      try {
        const url = `${apiBase}/${service}?fields=${fields}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Invalid request or no data found");
        const data = await response.json();

        status.textContent = `Found ${data.length} results`;
        status.className = "success";
        
        container.innerHTML = data.map(c => `
          <div class="country-card" onclick="showDetails('${c.name?.common || "Unknown"}')">
            ${c.flags ? `<img src="${c.flags.png}" alt="Flag of ${c.name?.common || ""}">` : ""}
            <div class="country-card-content">
              <h3>${c.name?.common || "N/A"}</h3>
              ${c.capital ? `<p><b>Capital:</b> ${c.capital[0]}</p>` : ""}
              ${c.population ? `<p><b>Population:</b> ${c.population.toLocaleString()}</p>` : ""}
              ${c.region ? `<p><b>Region:</b> ${c.region}</p>` : ""}
            </div>
          </div>
        `).join("");
      } catch (error) {
        status.textContent = error.message;
        status.className = "error";
      }
    }