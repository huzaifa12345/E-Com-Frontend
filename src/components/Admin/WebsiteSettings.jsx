import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Save, RefreshCw, Trash2 } from 'lucide-react';
import websiteSettingsApi from '../../services/websiteSettingsApi';
import toast from 'react-hot-toast';
import { useLogo } from '../../context/LogoContext';

const WebsiteSettings = () => {
  const { updateLogo, fetchWebsiteLogo } = useLogo();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [previewImages, setPreviewImages] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
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
  };

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
                className="btn btn-success"
                onClick={fetchSettings}
                disabled={loading}
              >
                <RefreshCw size={16} className="me-2" />
                Refresh
              </button>
              <button 
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteSettings;
