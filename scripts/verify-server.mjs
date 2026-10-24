import http from "http";

function fetchRoute(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3005${path}`, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    }).on("error", (err) => reject(err));
  });
}

async function runVerification() {
  console.log("🚀 Starting Programmatic End-to-End Route Verification on http://localhost:3005...\n");

  const results = [];

  // 1. Home Page (/)
  try {
    const home = await fetchRoute("/");
    const hasTitle = home.body.includes("सिंधी भजन लिरिक्स");
    const hasCategories = home.body.includes("गुरु भक्ति") && home.body.includes("प्रार्थना");
    const hasDemoBanner = home.body.includes("Demo content — replace with verified Sindhi bhajan lyrics");
    results.push({
      test: "Home Page (/)",
      status: home.status === 200 && hasTitle && hasCategories && hasDemoBanner ? "PASS" : "FAIL",
      details: `Status ${home.status}, title:${hasTitle}, categories:${hasCategories}, banner:${hasDemoBanner}`,
    });
  } catch (err) {
    results.push({ test: "Home Page (/)", status: "FAIL", details: err.message });
  }

  // 2. Bhajan Library (/bhajans)
  try {
    const library = await fetchRoute("/bhajans");
    const hasHeading = library.body.includes("Devotional Bhajan Library");
    const hasFilter = library.body.includes("bhajan-search-input") || library.body.includes("Multi-Filters");
    results.push({
      test: "Bhajan Library (/bhajans)",
      status: library.status === 200 && hasHeading ? "PASS" : "FAIL",
      details: `Status ${library.status}, heading:${hasHeading}, filters:${hasFilter}`,
    });
  } catch (err) {
    results.push({ test: "Bhajan Library (/bhajans)", status: "FAIL", details: err.message });
  }

  // 3. Category Detail Page (/categories/guru-bhakti)
  try {
    const category = await fetchRoute("/categories/guru-bhakti");
    const hasCatTitle = category.body.includes("गुरु भक्ति") && category.body.includes("Guru Bhakti");
    const hasBhajans = category.body.includes("satguru-charan-kamal-dhyaan") || category.body.includes("सतगुरु चरण कमल ध्यान");
    results.push({
      test: "Category Page (/categories/guru-bhakti)",
      status: category.status === 200 && hasCatTitle && hasBhajans ? "PASS" : "FAIL",
      details: `Status ${category.status}, title:${hasCatTitle}, bhajans:${hasBhajans}`,
    });
  } catch (err) {
    results.push({ test: "Category Page (/categories/guru-bhakti)", status: "FAIL", details: err.message });
  }

  // 4. Bhajan Lyric Detail Page (/bhajans/satguru-charan-kamal-dhyaan)
  try {
    const bhajan = await fetchRoute("/bhajans/satguru-charan-kamal-dhyaan");
    const hasBhajanTitle = bhajan.body.includes("सतगुरु चरण कमल ध्यान");
    const hasLyricsInHtml = bhajan.body.includes("सतगुरु के पावन चरणों में मन लगाओ रे");
    const hasRomanLyricsInHtml = bhajan.body.includes("Satguru ke paavan charnon mein man lagao re");
    const hasDemoNotice = bhajan.body.includes("Editorial &amp; Provenance Status") || bhajan.body.includes("replace with verified Sindhi bhajan lyrics");
    results.push({
      test: "Bhajan Detail HTML Lyrics SSR (/bhajans/satguru-charan-kamal-dhyaan)",
      status: bhajan.status === 200 && hasBhajanTitle && hasLyricsInHtml && hasRomanLyricsInHtml ? "PASS" : "FAIL",
      details: `Status ${bhajan.status}, title:${hasBhajanTitle}, devanagari SSR:${hasLyricsInHtml}, roman SSR:${hasRomanLyricsInHtml}, notice:${hasDemoNotice}`,
    });
  } catch (err) {
    results.push({ test: "Bhajan Detail SSR", status: "FAIL", details: err.message });
  }

  // 5. Custom 404 Page (/bhajans/invalid-slug)
  try {
    const notFoundRes = await fetchRoute("/bhajans/invalid-nonexistent-slug");
    const is404 = notFoundRes.status === 404;
    const has404Text = notFoundRes.body.includes("Bhajan or Page Not Found") || notFoundRes.body.includes("404");
    results.push({
      test: "Custom 404 Page (/bhajans/invalid-nonexistent-slug)",
      status: is404 && has404Text ? "PASS" : "FAIL",
      details: `Status ${notFoundRes.status}, text:${has404Text}`,
    });
  } catch (err) {
    results.push({ test: "Custom 404 Page", status: "FAIL", details: err.message });
  }

  // 6. Robots.txt (/robots.txt)
  try {
    const robots = await fetchRoute("/robots.txt");
    const hasGooglebot = robots.body.includes("Googlebot");
    const hasOai = robots.body.includes("OAI-SearchBot");
    const hasSitemap = robots.body.includes("sitemap.xml");
    results.push({
      test: "Robots.txt (/robots.txt)",
      status: robots.status === 200 && hasGooglebot && hasOai && hasSitemap ? "PASS" : "FAIL",
      details: `Status ${robots.status}, Googlebot:${hasGooglebot}, OAI-SearchBot:${hasOai}, Sitemap:${hasSitemap}`,
    });
  } catch (err) {
    results.push({ test: "Robots.txt", status: "FAIL", details: err.message });
  }

  // 7. Sitemap.xml (/sitemap.xml)
  try {
    const sitemap = await fetchRoute("/sitemap.xml");
    const hasXml = sitemap.body.includes("<?xml") || sitemap.body.includes("<urlset");
    results.push({
      test: "Sitemap.xml (/sitemap.xml)",
      status: sitemap.status === 200 && hasXml ? "PASS" : "FAIL",
      details: `Status ${sitemap.status}, XML urlset:${hasXml}`,
    });
  } catch (err) {
    results.push({ test: "Sitemap.xml", status: "FAIL", details: err.message });
  }

  console.table(results);

  const allPass = results.every((r) => r.status === "PASS");
  if (allPass) {
    console.log("\n🎉 ALL 7 E2E SERVER VERIFICATION TESTS PASSED!");
  } else {
    console.error("\n❌ SOME TESTS FAILED.");
    process.exit(1);
  }
}

runVerification();
