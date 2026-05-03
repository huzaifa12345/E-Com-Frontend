import { useState, useEffect, useCallback } from 'react';
import { Upload, Image as ImageIcon, Save, RefreshCw, Trash2 } from 'lucide-react';
import websiteSettingsApi from '../../services/websiteSettingsApi';
import { themeApi } from '../../services/themeApi';
import toast from 'react-hot-toast';
import { useLogo } from '../../context/LogoContext';

function getThemeHomeCategoryInfo(categoriesData) {
  if (!categoriesData || !Array.isArray(categoriesData)) {
    return { boys: 0, girls: 0, boysNames: [], girlsNames: [] };
  }
  const level2 = categoriesData.filter((cat) => cat.is_active && cat.level === 2);
  const level3 = categoriesData
    .filter((cat) => cat.is_active && cat.level === 3)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id);
  let boys = 0;
  let girls = 0;
  const boysNames = [];
  const girlsNames = [];
  level2.forEach((parent) => {
    const gn = (parent.name || '').toLowerCase();
    if (gn !== 'boys' && gn !== 'girls') return;
    const children = level3.filter((c) => c.parent_id === parent.id);
    if (gn === 'boys') {
      boys = children.length;
      boysNames.push(...children.map((c) => c.name || `Category ${c.id}`));
    }
    if (gn === 'girls') {
      girls = children.length;
      girlsNames.push(...children.map((c) => c.name || `Category ${c.id}`));
    }
  });
  return { boys, girls, boysNames, girlsNames };
}

const CATEGORY_CARD_IMAGE_KEY = /^(boys|girls)_category_(\d+)_image$/;

const WebsiteSettings = () => {
  const { updateLogo, fetchWebsiteLogo } = useLogo();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [previewImages, setPreviewImages] = useState({});
  const [categorySlotCounts, setCategorySlotCounts] = useState({ boys: 0, girls: 0 });
  const [categorySlotNames, setCategorySlotNames] = useState({ boys: [], girls: [] });

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);

      let info = { boys: 0, girls: 0, boysNames: [], girlsNames: [] };
      try {
        const raw = await themeApi.getCategories();
        info = getThemeHomeCategoryInfo(raw);
      } catch {
        /* categories public; admin usually has token */
      }
      setCategorySlotCounts({ boys: info.boys, girls: info.girls });
      setCategorySlotNames({ boys: info.boysNames, girls: info.girlsNames });

      try {
        await websiteSettingsApi.ensureCategoryCardSlots();
      } catch (err) {
        if (err.status === 401 || err.status === 403) {
          toast.error('Admin login required to sync theme home card slots.');
        } else {
          console.warn('ensureCategoryCardSlots:', err);
          toast.error(err.message || 'Could not sync category card slots');
        }
      }

      const response = await websiteSettingsApi.getWebsiteSettings();
      if (response.success) {
        setSettings(response.data);
        
        // Initialize preview images
        const previews = {};
        Object.values(response.data).flat().forEach(setting => {
          if (setting.type === 'image' && setting.value) {
            previews[setting.id] = setting.value;
          }
        });
        setPreviewImages(previews);
      } else {
        // If no settings exist, try to initialize them
        const initResponse = await websiteSettingsApi.initializeSettings();
        if (initResponse.success) {
          // Fetch settings again after initialization
          fetchSettings();
        }
      }
    } catch (error) {
      toast.error('Failed to fetch website settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleImageUpload = (settingId, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => ({
          ...prev,
          [settingId]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateSetting = async (settingId, value, imageFile = null) => {
    try {
      setSaving(prev => ({ ...prev, [settingId]: true }));
      
      const response = await websiteSettingsApi.updateWebsiteSetting(settingId, value, imageFile);
      
      // Check if update was successful (either response.success or no error)
      if (response.success || response.data || response.message) {
        toast.success('Setting updated successfully!');
        
        // If this is a logo setting, update the global logo
        if (typeof settingId === 'string' && (settingId.includes('logo') || settingId.includes('website_logo'))) {
          const logoValue = response.data?.value || response.value || value;
          updateLogo(logoValue);
          console.log('WebsiteSettings: Updated global logo to:', logoValue);
        }
        
        // Update local state
        setSettings(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(category => {
            updated[category] = updated[category].map(setting => 
              setting.id === settingId ? { ...setting, value: response.data?.value || response.value || value } : setting
            );
          });
          return updated;
        });
      } else {
        // Only show error if response indicates failure
        toast.error('Failed to update setting');
      }
    } catch (error) {
      // Only show error toast if there's an actual error
      console.error('Update setting error:', error);
      toast.error('Failed to update setting');
    } finally {
      setSaving(prev => ({ ...prev, [settingId]: false }));
    }
  };

  const handleTextChange = (settingId, value) => {
    // Update local state immediately for better UX
    setSettings(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(category => {
        updated[category] = updated[category].map(setting => 
          setting.id === settingId ? { ...setting, value } : setting
        );
      });
      return updated;
    });
  };

  const renderSettingInput = (setting) => {
    if (setting.type === 'image') {
      return (
        <div className="d-flex align-items-center gap-3">
          <div className="position-relative">
            {previewImages[setting.id] ? (
              <img 
                src={previewImages[setting.id]} 
                alt={setting.description}
                className="img-thumbnail"
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
            ) : (
              <div className="border rounded d-flex align-items-center justify-content-center" 
                   style={{ width: '100px', height: '100px' }}>
                <ImageIcon size={24} className="text-muted" />
              </div>
            )}
          </div>
          <div className="flex-grow-1">
            <input
              type="file"
              className="form-control"
              accept="image/*"
              setting-id={setting.id}
              onChange={(e) => handleImageUpload(setting.id, e.target.files[0])}
              disabled={saving[setting.id]}
            />
            <small className="text-muted">Upload new image</small>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              const fileInput = document.querySelector(`input[setting-id="${setting.id}"]`);
              const file = fileInput?.files[0];
              const currentValue = document.querySelector(`input[setting-id="${setting.id}"]`)?.value || setting.value;
              
              if (file) {
                handleUpdateSetting(setting.id, currentValue, file);
              } else {
                handleUpdateSetting(setting.id, currentValue);
              }
            }}
            disabled={saving[setting.id]}
          >
            {saving[setting.id] ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="d-flex align-items-center gap-3">
        <input
          type="text"
          className="form-control"
          value={setting.value || ''}
          onChange={(e) => handleTextChange(setting.id, e.target.value)}
          disabled={saving[setting.id]}
          placeholder={`Enter ${setting.description.toLowerCase()}`}
        />
        <button
          className="btn btn-primary"
          onClick={() => handleUpdateSetting(setting.id, setting.value)}
          disabled={saving[setting.id]}
        >
          {saving[setting.id] ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
        </button>
      </div>
    );
  };

  const renderCategoryCardSlots = (categorySettings) => {
    const byKey = Object.fromEntries(categorySettings.map((s) => [s.key, s]));
    const other = categorySettings.filter((s) => !CATEGORY_CARD_IMAGE_KEY.test(s.key));

    const slotBlock = (genderLabel, prefix, count, names) => (
      <div className="mb-4" key={prefix}>
        <h6 className="fw-bold mb-3 border-bottom pb-2">
          {genderLabel} — {count} theme home card{count !== 1 ? 's' : ''}
        </h6>
        <div className="row">
          {count === 0 ? (
            <p className="text-muted small">No level-3 categories under {genderLabel}. Add them in Category Management, then Refresh.</p>
          ) : (
            Array.from({ length: count }, (_, idx) => {
              const n = idx + 1;
              const key = `${prefix}_category_${n}_image`;
              const setting = byKey[key];
              const catName = names[idx] || null;
              if (!setting) {
                return (
                  <div key={key} className="col-md-6 mb-3">
                    <div className="alert alert-warning mb-0 py-2 small">
                      Missing <code>{key}</code>. Press <strong>Refresh</strong> to sync slots.
                    </div>
                  </div>
                );
              }
              return (
                <div key={setting.id} className="col-md-6 mb-3">
                  <div className="border rounded p-3">
                    <label className="form-label fw-bold">
                      {setting.description}
                      {catName && <span className="text-info ms-2">({catName})</span>}
                    </label>
                    <small className="text-muted d-block mb-2">
                      Key: {setting.key} | Slot {n} of {count}
                    </small>
                    {renderSettingInput(setting)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );

    return (
      <>
        <p className="text-muted small mb-4">
          Image slots match <strong>Boys</strong> / <strong>Girls</strong> subcategories (same order as Theme Home).
          Currently <strong>{categorySlotCounts.boys}</strong> boys and <strong>{categorySlotCounts.girls}</strong> girls.
          After adding a category, click <strong>Refresh</strong> to create the new upload row.
        </p>
        {slotBlock('Boys', 'boys', categorySlotCounts.boys, categorySlotNames.boys)}
        {slotBlock('Girls', 'girls', categorySlotCounts.girls, categorySlotNames.girls)}
        {other.length > 0 && (
          <div className="mb-3">
            <h6 className="fw-bold mb-2">Other (category_cards)</h6>
            <div className="row">
              {other.map((setting) => (
                <div key={setting.id} className="col-md-6 mb-3">
                  <div className="border rounded p-3">
                    <label className="form-label fw-bold">{setting.description}</label>
                    <small className="text-muted d-block mb-2">
                      Key: {setting.key} | Type: {setting.type}
                    </small>
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center" 
               style={{ backgroundColor: '#262626', color: 'white' }}>
            <h5 className="mb-0 text-white">Website Settings</h5>
            <div className="d-flex gap-2">
              <button 
                type="button"
                className="btn btn-success"
                onClick={fetchSettings}
                disabled={loading}
              >
                <RefreshCw size={16} className="me-2" />
                Refresh
              </button>
              <button 
                type="button"
                className="btn btn-warning"
                onClick={async () => {
                  try {
                    const initResponse = await websiteSettingsApi.initializeSettings();
                    if (initResponse.success) {
                      toast.success('Settings initialized successfully!');
                      fetchSettings();
                    } else {
                      toast.error('Failed to initialize settings');
                    }
                  } catch (error) {
                    toast.error('Error initializing settings');
                  }
                }}
                disabled={loading}
              >
                <Upload size={16} className="me-2" />
                Initialize Settings
              </button>
            </div>
          </div>
          <div className="card-body">
            {Object.entries(settings).map(([category, categorySettings]) => (
              <div key={category} className="mb-4">
                <h6 className="text-uppercase text-muted mb-3">
                  {category.charAt(0).toUpperCase() + category.slice(1)} Settings
                </h6>
                {category === 'category_cards' ? (
                  renderCategoryCardSlots(categorySettings)
                ) : (
                  <div className="row">
                    {categorySettings.map((setting) => (
                      <div key={setting.id} className="col-md-6 mb-3">
                        <div className="border rounded p-3">
                          <label className="form-label fw-bold">
                            {setting.description}
                          </label>
                          <small className="text-muted d-block mb-2">
                            Key: {setting.key} | Type: {setting.type}
                          </small>
                          {renderSettingInput(setting)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteSettings;
