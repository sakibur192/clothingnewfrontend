// ============================================================
// STOREFRONT BUILDER PAGE
// ============================================================
// Three tabs:
//   "Theme & Template" - pick one of 5 starter templates, then
//   fine-tune colors/logo/announcement bar/WhatsApp/support info.
//   "Homepage Sections" - reorder (up/down buttons, no drag-drop
//   library needed), edit, add, and remove sections, including
//   the richer types (slider, trust badges, promo grid, flash
//   sale, Instagram gallery).
//   "Custom Domain" - point a real domain at the storefront, with
//   live DNS verification.
// ============================================================

import { useEffect, useState } from "react";
import {
  getStorefrontTemplates,
  applyStorefrontTemplate,
  getStorefrontSettings,
  updateStorefrontSettings,
  getStorefrontPage,
  saveStorefrontPage,
  getDomainStatus,
  setStorefrontDomain,
  verifyStorefrontDomain,
  removeStorefrontDomain,
} from "../api/api";
import { useAuth } from "../context/AuthContext";

const SECTION_TYPES = [
  { value: "hero", label: "Hero Banner" },
  { value: "hero_slider", label: "Hero Slider" },
  { value: "banner", label: "Promo Banner" },
  { value: "trust_badges", label: "Trust Badges" },
  { value: "category_grid", label: "Category Grid" },
  { value: "product_grid", label: "Product Grid" },
  { value: "flash_sale", label: "Flash Sale (with countdown)" },
  { value: "promo_grid", label: "Promo Banner Grid" },
  { value: "instagram_gallery", label: "Instagram / Shop the Look" },
  { value: "testimonials", label: "Testimonials" },
  { value: "newsletter", label: "Newsletter Signup" },
];

const emptySlide = () => ({ heading: "New Slide", subheading: "", button_text: "Shop Now", button_link: "/products", background_color: "#14532d", text_color: "#ffffff" });
const emptyBadge = () => ({ icon: "✅", title: "Badge Title", subtitle: "Short description" });
const emptyBanner = () => ({ heading: "New Banner", subheading: "", background_color: "#14532d", text_color: "#ffffff", button_link: "/products" });

function defaultSettingsForType(type) {
  if (type === "hero" || type === "banner") {
    return { heading: "New Heading", subheading: "", button_text: "", button_link: "", background_color: "#14532d", text_color: "#ffffff" };
  }
  if (type === "hero_slider") return { autoplay_seconds: 5, slides: [emptySlide()] };
  if (type === "trust_badges") return { badges: [emptyBadge(), emptyBadge(), emptyBadge(), emptyBadge()] };
  if (type === "category_grid") return { heading: "Shop by Category", columns: 4 };
  if (type === "product_grid") return { heading: "Featured Products", collection: "newest", limit: 8 };
  if (type === "flash_sale") return { heading: "Flash Sale", end_time: "", collection: "bestsellers", limit: 8 };
  if (type === "promo_grid") return { banners: [emptyBanner(), emptyBanner()] };
  if (type === "instagram_gallery") return { heading: "Shop the Look", images: [] };
  if (type === "testimonials") return { heading: "What Our Customers Say" };
  if (type === "newsletter") return { heading: "Subscribe", subheading: "" };
  return {};
}

export default function StorefrontBuilder() {
  const { business } = useAuth();
  const [tab, setTab] = useState("theme");

  const [templates, setTemplates] = useState([]);
  const [settings, setSettings] = useState(null);
  const [sections, setSections] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  // domain tab state
  const [domainStatus, setDomainStatus] = useState(null);
  const [domainInput, setDomainInput] = useState("");
  const [domainBusy, setDomainBusy] = useState(false);
  const [domainMessage, setDomainMessage] = useState("");

  function loadAll() {
    getStorefrontTemplates().then((data) => setTemplates(data.templates));
    getStorefrontSettings().then((data) => setSettings(data.settings));
    getStorefrontPage("home")
      .then((data) => setSections(data.page.sections || []))
      .catch(() => setSections([]));
    getDomainStatus().then(setDomainStatus).catch(() => {});
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleApplyTemplate(key) {
    setError("");
    try {
      await applyStorefrontTemplate(key);
      loadAll();
      setSavedMessage("Template applied!");
      setTimeout(() => setSavedMessage(""), 2000);
    } catch (err) {
      setError(err.message);
    }
  }

  function updateSettingField(field, value) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveSettings() {
    setSaving(true);
    setError("");
    try {
      await updateStorefrontSettings(settings);
      setSavedMessage("Theme saved!");
      setTimeout(() => setSavedMessage(""), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function moveSection(index, direction) {
    setSections((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function updateSectionSetting(index, field, value) {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, settings: { ...s.settings, [field]: value } } : s))
    );
  }

  // ---- helpers for array-based settings (slides/badges/banners/images) ----
  function updateArrayItem(index, arrayField, itemIndex, key, value) {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        const arr = [...(s.settings[arrayField] || [])];
        arr[itemIndex] = { ...arr[itemIndex], [key]: value };
        return { ...s, settings: { ...s.settings, [arrayField]: arr } };
      })
    );
  }

  function addArrayItem(index, arrayField, template) {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        const arr = [...(s.settings[arrayField] || []), template()];
        return { ...s, settings: { ...s.settings, [arrayField]: arr } };
      })
    );
  }

  function removeArrayItem(index, arrayField, itemIndex) {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        const arr = (s.settings[arrayField] || []).filter((_, ii) => ii !== itemIndex);
        return { ...s, settings: { ...s.settings, [arrayField]: arr } };
      })
    );
  }

  function removeSection(index) {
    setSections((prev) => prev.filter((_, i) => i !== index));
  }

  function addSection(type) {
    setSections((prev) => [...prev, { type, settings: defaultSettingsForType(type) }]);
  }

  async function handleSaveSections() {
    setSaving(true);
    setError("");
    try {
      await saveStorefrontPage("home", { sections });
      setSavedMessage("Homepage saved!");
      setTimeout(() => setSavedMessage(""), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ---- domain tab handlers ----
  async function handleSetDomain(e) {
    e.preventDefault();
    if (!domainInput.trim()) return;
    setDomainBusy(true);
    setDomainMessage("");
    try {
      await setStorefrontDomain(domainInput.trim());
      const status = await getDomainStatus();
      setDomainStatus(status);
      setDomainMessage("Domain saved. Add the DNS record below, then click Verify.");
    } catch (err) {
      setDomainMessage(err.message);
    } finally {
      setDomainBusy(false);
    }
  }

  async function handleVerifyDomain() {
    setDomainBusy(true);
    setDomainMessage("Checking DNS...");
    try {
      const result = await verifyStorefrontDomain();
      setDomainMessage(result.message);
      const status = await getDomainStatus();
      setDomainStatus(status);
    } catch (err) {
      setDomainMessage(err.message);
    } finally {
      setDomainBusy(false);
    }
  }

  async function handleRemoveDomain() {
    if (!window.confirm("Remove this custom domain?")) return;
    setDomainBusy(true);
    try {
      await removeStorefrontDomain();
      setDomainStatus(await getDomainStatus());
      setDomainInput("");
    } catch (err) {
      setDomainMessage(err.message);
    } finally {
      setDomainBusy(false);
    }
  }

  const storeUrl = business?.subdomain ? `Your storefront subdomain: ${business.subdomain}` : "";

  return (
    <div>
      <div className="page-header">
        <h2>Storefront</h2>
      </div>

      <p className="muted" style={{ marginBottom: 16 }}>{storeUrl}</p>

      <div className="form-row" style={{ marginBottom: 16, maxWidth: 560 }}>
        <button className={tab === "theme" ? "btn" : "btn btn-secondary"} onClick={() => setTab("theme")} style={{ flex: 1 }}>
          Theme & Template
        </button>
        <button className={tab === "sections" ? "btn" : "btn btn-secondary"} onClick={() => setTab("sections")} style={{ flex: 1 }}>
          Homepage Sections
        </button>
        <button className={tab === "domain" ? "btn" : "btn btn-secondary"} onClick={() => setTab("domain")} style={{ flex: 1 }}>
          Custom Domain
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}
      {savedMessage && <p className="muted">{savedMessage}</p>}

      {tab === "theme" && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3>Choose a Template</h3>
            <p className="muted">
              Picking a template sets your homepage layout and brand colors. You can still customize everything afterward.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 12 }}>
              {templates.map((t) => (
                <div key={t.key} className="card" style={{ border: settings?.template_key === t.key ? `2px solid ${t.colors.primary_color}` : undefined }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    {Object.values(t.colors).slice(0, 4).map((c, i) => (
                      <div key={i} style={{ width: 20, height: 20, borderRadius: 4, background: c }} />
                    ))}
                  </div>
                  <strong>{t.name}</strong>
                  <p className="muted" style={{ fontSize: 12 }}>{t.description}</p>
                  <button className="btn btn-sm btn-block" onClick={() => handleApplyTemplate(t.key)}>
                    {settings?.template_key === t.key ? "Reapply" : "Use This Template"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {settings && (
            <div className="card">
              <h3>Customize Theme</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Store Name (shown on storefront)</label>
                  <input value={settings.store_name || ""} onChange={(e) => updateSettingField("store_name", e.target.value)} placeholder={business?.business_name} />
                </div>
                <div className="form-group">
                  <label>Logo URL</label>
                  <input value={settings.logo_url || ""} onChange={(e) => updateSettingField("logo_url", e.target.value)} placeholder="https://..." />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Primary Color</label>
                  <input type="color" value={settings.primary_color} onChange={(e) => updateSettingField("primary_color", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Accent Color</label>
                  <input type="color" value={settings.accent_color} onChange={(e) => updateSettingField("accent_color", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Background</label>
                  <input type="color" value={settings.background_color} onChange={(e) => updateSettingField("background_color", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Text Color</label>
                  <input type="color" value={settings.text_color} onChange={(e) => updateSettingField("text_color", e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>WhatsApp Number (floating chat button)</label>
                  <input value={settings.whatsapp_number || ""} onChange={(e) => updateSettingField("whatsapp_number", e.target.value)} placeholder="8801XXXXXXXXX" />
                </div>
                <div className="form-group">
                  <label>Support Phone (shown in header/footer)</label>
                  <input value={settings.support_phone || ""} onChange={(e) => updateSettingField("support_phone", e.target.value)} placeholder="+880 1XXX-XXXXXX" />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.announcement_enabled || false}
                    onChange={(e) => updateSettingField("announcement_enabled", e.target.checked)}
                    style={{ width: "auto", marginRight: 8 }}
                  />
                  Show announcement bar
                </label>
                {settings.announcement_enabled && (
                  <input
                    style={{ marginTop: 8 }}
                    value={settings.announcement_text || ""}
                    onChange={(e) => updateSettingField("announcement_text", e.target.value)}
                    placeholder="e.g. Free delivery inside Dhaka on orders above ৳1500"
                  />
                )}
              </div>

              <button className="btn" onClick={handleSaveSettings} disabled={saving}>
                {saving ? "Saving..." : "Save Theme"}
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "sections" && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="page-header" style={{ marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>Homepage Sections</h3>
              <button className="btn" onClick={handleSaveSections} disabled={saving}>
                {saving ? "Saving..." : "Save Homepage"}
              </button>
            </div>
            <p className="muted">Reorder with the arrows, edit content inline, or add a new section below.</p>
          </div>

          {sections.map((section, index) => (
            <div className="card" key={index} style={{ marginBottom: 12 }}>
              <div className="page-header" style={{ marginBottom: 10 }}>
                <strong>{SECTION_TYPES.find((t) => t.value === section.type)?.label || section.type}</strong>
                <div>
                  <button className="btn btn-secondary btn-sm" onClick={() => moveSection(index, -1)} disabled={index === 0}>↑</button>{" "}
                  <button className="btn btn-secondary btn-sm" onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1}>↓</button>{" "}
                  <button className="btn btn-danger btn-sm" onClick={() => removeSection(index)}>Remove</button>
                </div>
              </div>

              {/* simple flat fields, shared across hero/banner */}
              {"heading" in section.settings && (
                <div className="form-group">
                  <label>Heading</label>
                  <input value={section.settings.heading || ""} onChange={(e) => updateSectionSetting(index, "heading", e.target.value)} />
                </div>
              )}
              {"subheading" in section.settings && (
                <div className="form-group">
                  <label>Subheading</label>
                  <input value={section.settings.subheading || ""} onChange={(e) => updateSectionSetting(index, "subheading", e.target.value)} />
                </div>
              )}
              {"button_text" in section.settings && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Button Text</label>
                    <input value={section.settings.button_text || ""} onChange={(e) => updateSectionSetting(index, "button_text", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Button Link</label>
                    <input value={section.settings.button_link || ""} onChange={(e) => updateSectionSetting(index, "button_link", e.target.value)} placeholder="/products" />
                  </div>
                </div>
              )}
              {(section.type === "hero" || section.type === "banner") && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Background Color</label>
                    <input type="color" value={section.settings.background_color || "#14532d"} onChange={(e) => updateSectionSetting(index, "background_color", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Text Color</label>
                    <input type="color" value={section.settings.text_color || "#ffffff"} onChange={(e) => updateSectionSetting(index, "text_color", e.target.value)} />
                  </div>
                </div>
              )}
              {section.type === "category_grid" && (
                <div className="form-group" style={{ maxWidth: 160 }}>
                  <label>Columns</label>
                  <input type="number" min="2" max="6" value={section.settings.columns || 4} onChange={(e) => updateSectionSetting(index, "columns", Number(e.target.value))} />
                </div>
              )}
              {(section.type === "product_grid" || section.type === "flash_sale") && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Collection</label>
                    <select value={section.settings.collection || "newest"} onChange={(e) => updateSectionSetting(index, "collection", e.target.value)}>
                      <option value="newest">Newest</option>
                      <option value="bestsellers">Best Sellers</option>
                      <option value="all">All Products</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ maxWidth: 140 }}>
                    <label>How Many</label>
                    <input type="number" value={section.settings.limit || 8} onChange={(e) => updateSectionSetting(index, "limit", Number(e.target.value))} />
                  </div>
                </div>
              )}
              {section.type === "flash_sale" && (
                <div className="form-group">
                  <label>Sale Ends At</label>
                  <input
                    type="datetime-local"
                    value={section.settings.end_time ? section.settings.end_time.slice(0, 16) : ""}
                    onChange={(e) => updateSectionSetting(index, "end_time", new Date(e.target.value).toISOString())}
                  />
                </div>
              )}

              {/* HERO SLIDER - editable slide list */}
              {section.type === "hero_slider" && (
                <div>
                  {(section.settings.slides || []).map((slide, si) => (
                    <div key={si} className="variant-row" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto" }}>
                      <div className="form-group">
                        <label>Heading</label>
                        <input value={slide.heading || ""} onChange={(e) => updateArrayItem(index, "slides", si, "heading", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Subheading</label>
                        <input value={slide.subheading || ""} onChange={(e) => updateArrayItem(index, "slides", si, "subheading", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Button Text</label>
                        <input value={slide.button_text || ""} onChange={(e) => updateArrayItem(index, "slides", si, "button_text", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Background</label>
                        <input type="color" value={slide.background_color || "#14532d"} onChange={(e) => updateArrayItem(index, "slides", si, "background_color", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Image URL (optional)</label>
                        <input value={slide.image_url || ""} onChange={(e) => updateArrayItem(index, "slides", si, "image_url", e.target.value)} placeholder="https://..." />
                      </div>
                      <button className="btn btn-danger btn-sm" onClick={() => removeArrayItem(index, "slides", si)} disabled={(section.settings.slides || []).length <= 1}>
                        Remove
                      </button>
                    </div>
                  ))}
                  <button className="btn btn-secondary btn-sm" onClick={() => addArrayItem(index, "slides", emptySlide)}>+ Add Slide</button>
                </div>
              )}

              {/* TRUST BADGES - editable badge list */}
              {section.type === "trust_badges" && (
                <div>
                  {(section.settings.badges || []).map((badge, bi) => (
                    <div key={bi} className="variant-row" style={{ gridTemplateColumns: "80px 1fr 1fr auto" }}>
                      <div className="form-group">
                        <label>Icon</label>
                        <input value={badge.icon || ""} onChange={(e) => updateArrayItem(index, "badges", bi, "icon", e.target.value)} placeholder="🚚" />
                      </div>
                      <div className="form-group">
                        <label>Title</label>
                        <input value={badge.title || ""} onChange={(e) => updateArrayItem(index, "badges", bi, "title", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Subtitle</label>
                        <input value={badge.subtitle || ""} onChange={(e) => updateArrayItem(index, "badges", bi, "subtitle", e.target.value)} />
                      </div>
                      <button className="btn btn-danger btn-sm" onClick={() => removeArrayItem(index, "badges", bi)}>Remove</button>
                    </div>
                  ))}
                  <button className="btn btn-secondary btn-sm" onClick={() => addArrayItem(index, "badges", emptyBadge)}>+ Add Badge</button>
                </div>
              )}

              {/* PROMO GRID - editable banner list */}
              {section.type === "promo_grid" && (
                <div>
                  {(section.settings.banners || []).map((banner, bi) => (
                    <div key={bi} className="variant-row" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr auto" }}>
                      <div className="form-group">
                        <label>Heading</label>
                        <input value={banner.heading || ""} onChange={(e) => updateArrayItem(index, "banners", bi, "heading", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Subheading</label>
                        <input value={banner.subheading || ""} onChange={(e) => updateArrayItem(index, "banners", bi, "subheading", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Background</label>
                        <input type="color" value={banner.background_color || "#14532d"} onChange={(e) => updateArrayItem(index, "banners", bi, "background_color", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Image URL (optional)</label>
                        <input value={banner.image_url || ""} onChange={(e) => updateArrayItem(index, "banners", bi, "image_url", e.target.value)} placeholder="https://..." />
                      </div>
                      <button className="btn btn-danger btn-sm" onClick={() => removeArrayItem(index, "banners", bi)} disabled={(section.settings.banners || []).length <= 1}>
                        Remove
                      </button>
                    </div>
                  ))}
                  <button className="btn btn-secondary btn-sm" onClick={() => addArrayItem(index, "banners", emptyBanner)} disabled={(section.settings.banners || []).length >= 3}>
                    + Add Banner (max 3)
                  </button>
                </div>
              )}

              {/* INSTAGRAM GALLERY - editable image URL list */}
              {section.type === "instagram_gallery" && (
                <div>
                  {(section.settings.images || []).map((img, ii) => (
                    <div key={ii} className="form-row" style={{ marginBottom: 8 }}>
                      <input
                        value={typeof img === "string" ? img : img.image_url || ""}
                        onChange={(e) => {
                          const next = [...section.settings.images];
                          next[ii] = e.target.value;
                          updateSectionSetting(index, "images", next);
                        }}
                        placeholder="https://... image URL"
                      />
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => updateSectionSetting(index, "images", section.settings.images.filter((_, x) => x !== ii))}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => updateSectionSetting(index, "images", [...(section.settings.images || []), ""])}
                  >
                    + Add Image
                  </button>
                </div>
              )}
            </div>
          ))}

          <div className="card">
            <h3>Add a Section</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {SECTION_TYPES.map((t) => (
                <button key={t.value} className="btn btn-secondary btn-sm" onClick={() => addSection(t.value)}>
                  + {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "domain" && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3>Custom Domain</h3>
            <p className="muted">
              Point your own domain (e.g. www.yourbrand.com) at your storefront. Verification checks a real
              DNS record - this proves you own the domain before it's connected.
            </p>

            {domainStatus?.customDomain ? (
              <div>
                <p>
                  <strong>{domainStatus.customDomain}</strong>{" "}
                  {domainStatus.verified ? (
                    <span className="badge badge-delivered">Verified</span>
                  ) : (
                    <span className="badge badge-pending">Not Verified Yet</span>
                  )}
                </p>

                {!domainStatus.verified && domainStatus.dnsInstructions && (
                  <div className="card" style={{ background: "#faf9f6", marginBottom: 12 }}>
                    <p><strong>Add this DNS record at your domain registrar:</strong></p>
                    <table>
                      <tbody>
                        <tr><td>Type</td><td><code>{domainStatus.dnsInstructions.recordType}</code></td></tr>
                        <tr><td>Host</td><td><code>{domainStatus.dnsInstructions.host}</code></td></tr>
                        <tr><td>Value</td><td><code>{domainStatus.dnsInstructions.value}</code></td></tr>
                      </tbody>
                    </table>
                    <p className="muted" style={{ marginTop: 8 }}>{domainStatus.dnsInstructions.note}</p>
                  </div>
                )}

                {domainMessage && <p className="muted">{domainMessage}</p>}

                <button className="btn" onClick={handleVerifyDomain} disabled={domainBusy}>
                  {domainBusy ? "Checking..." : "Verify Domain"}
                </button>{" "}
                <button className="btn btn-danger" onClick={handleRemoveDomain} disabled={domainBusy}>
                  Remove Domain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSetDomain}>
                <div className="form-group">
                  <label>Your Domain</label>
                  <input value={domainInput} onChange={(e) => setDomainInput(e.target.value)} placeholder="www.yourbrand.com" />
                </div>
                {domainMessage && <p className="muted">{domainMessage}</p>}
                <button className="btn" type="submit" disabled={domainBusy}>
                  {domainBusy ? "Saving..." : "Save Domain"}
                </button>
              </form>
            )}
          </div>

          <div className="card">
            <h3>What this does — and doesn't — do</h3>
            <p className="muted">
              Verification proves you own the domain via a real DNS TXT record lookup — the same method used
              by major platforms. What it does <strong>not</strong> do is provision SSL or route live traffic
              for the domain to this server; that's a hosting/reverse-proxy step (e.g. Caddy, nginx, or a host
              like Vercel/Cloudflare) that happens outside this app once you deploy for real.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
