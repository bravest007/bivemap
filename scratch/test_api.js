async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/ingest/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "React is awesome", modelId: "normal" })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response Body:", text);
  } catch(e) {
    console.error("Fetch Error:", e);
  }
}
test();
