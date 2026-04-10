import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Package } from 'lucide-react';
import { themeApi } from '../../services/themeApi';
import websiteSettingsApi from '../../services/websiteSettingsApi';
import toast from 'react-hot-toast';

const PROVIDED_SIZE_GUIDES = {
  casual_shirt: '[["1-2",13,16],["2-3",13.5,17],["3-4",14,18],["4-5",15,20],["5-6",15.5,21],["7-8",16,22],["9-10",17,24],["11-12",18,26],["13-14",19,28]]',
  tshirt: '[["1-2",12,14.5],["2-3",12.5,16],["3-4",13,17],["4-5",14,18],["5",14.5,19],["6",15,20],["7-8",16,21.5],["9-10",17,22],["11-12",18,24],["13-14",19,26]]',
  pants: '[["1 yr","-",16],["2 yr","-",18],["3 yr","-",20],["4 yr","-",22],["5 yr","-",24],["6 yr","-",26],["7 yr","-",28],["8 yr","-",30],["9 yr","-",32],["10 yr","-",34],["11-12","-",36],["13-14","-",38]]'
};

const SizeManagement = () => {
  const [sizes, setSizes] = useState([]);
  const [newSize, setNewSize] = useState({ size: '', description: '' });
  const [editingSize, setEditingSize] = useState(null);
  const [sizeGuideSettings, setSizeGuideSettings] = useState({
    casual_shirt: { id: null, value: '' },
    tshirt: { id: null, value: '' },
    pants: { id: null, value: '' }
  });
  const [savingGuide, setSavingGuide] = useState({
    casual_shirt: false,
    tshirt: false,
    pants: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSizes();
    fetchSizeGuides();
  }, []);

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const data = await themeApi.getSizes();
      setSizes(data);
    } catch (error) {
      toast.error('Failed to fetch sizes');
    } finally {
      setLoading(false);
    }
  };

  const fetchSizeGuides = async () => {
    try {
      const keys = [
        { apiKey: 'size_guide_casual_shirt', stateKey: 'casual_shirt' },
        { apiKey: 'size_guide_tshirt', stateKey: 'tshirt' },
        { apiKey: 'size_guide_pants', stateKey: 'pants' }
      ];

      const responses = await Promise.all(
        keys.map(async ({ apiKey, stateKey }) => {
          try {
            const response = await websiteSettingsApi.getSettingByKey(apiKey);
            return {
              stateKey,
              id: response?.data?.id || null,
              value: response?.data?.value || ''
            };
          } catch (error) {
            return { stateKey, id: null, value: '' };
          }
        })
      );

      const nextState = {
        casual_shirt: { id: null, value: '' },
        tshirt: { id: null, value: '' },
        pants: { id: null, value: '' }
      };
      responses.forEach(({ stateKey, id, value }) => {
        nextState[stateKey] = { id, value };
      });
      setSizeGuideSettings(nextState);
    } catch (error) {
      toast.error('Failed to fetch size guides');
    }
  };

  const handleSizeGuideChange = (guideKey, value) => {
    setSizeGuideSettings((prev) => ({
      ...prev,
      [guideKey]: { ...prev[guideKey], value }
    }));
  };

  const saveSizeGuide = async (guideKey) => {
    try {
      setSavingGuide((prev) => ({ ...prev, [guideKey]: true }));
      let guide = sizeGuideSettings[guideKey];

      // Auto-initialize website settings if size guide keys are missing
      if (!guide?.id) {
        await websiteSettingsApi.initializeSettings();
        await fetchSizeGuides();

        const mapping = {
          casual_shirt: 'size_guide_casual_shirt',
          tshirt: 'size_guide_tshirt',
          pants: 'size_guide_pants'
        };

        const refreshed = await websiteSettingsApi.getSettingByKey(mapping[guideKey]);
        guide = {
          id: refreshed?.data?.id || null,
          value: sizeGuideSettings[guideKey]?.value || ''
        };

        if (!guide.id) {
          toast.error('Failed to prepare size guide setting. Please try again.');
          return;
        }
      }

      await websiteSettingsApi.updateWebsiteSetting(guide.id, sizeGuideSettings[guideKey].value || '[]');
      toast.success('Size guide saved successfully!');
    } catch (error) {
      toast.error('Failed to save size guide');
    } finally {
      setSavingGuide((prev) => ({ ...prev, [guideKey]: false }));
    }
  };

  const replaceWithProvidedGuides = async () => {
    try {
      const nextGuides = {
        casual_shirt: { ...sizeGuideSettings.casual_shirt, value: PROVIDED_SIZE_GUIDES.casual_shirt },
        tshirt: { ...sizeGuideSettings.tshirt, value: PROVIDED_SIZE_GUIDES.tshirt },
        pants: { ...sizeGuideSettings.pants, value: PROVIDED_SIZE_GUIDES.pants }
      };
      setSizeGuideSettings(nextGuides);

      const mapping = {
        casual_shirt: 'size_guide_casual_shirt',
        tshirt: 'size_guide_tshirt',
        pants: 'size_guide_pants'
      };

      await websiteSettingsApi.initializeSettings();

      for (const guideKey of Object.keys(mapping)) {
        const current = nextGuides[guideKey];
        let settingId = current?.id;

        if (!settingId) {
          const response = await websiteSettingsApi.getSettingByKey(mapping[guideKey]);
          settingId = response?.data?.id;
        }

        if (!settingId) {
          throw new Error(`Setting missing for ${guideKey}`);
        }

        await websiteSettingsApi.updateWebsiteSetting(settingId, nextGuides[guideKey].value);
      }

      await fetchSizeGuides();
      toast.success('Old guides replaced with your provided size guides.');
    } catch (error) {
      toast.error('Failed to replace size guides');
    }
  };

  const addSize = async () => {
    if (!newSize.size.trim()) {
      toast.error('Please enter a size name');
      return;
    }

    try {
      await themeApi.createSize({
        size: newSize.size,
        description: newSize.description
      });
      toast.success('Size added successfully!');
      setNewSize({ size: '', description: '' });
      fetchSizes();
    } catch (error) {
      toast.error('Failed to add size');
    }
  };

  const updateSize = async () => {
    if (!editingSize || !editingSize.size.trim()) {
      toast.error('Please enter a size name');
      return;
    }

    try {
      await themeApi.updateSize(editingSize.id, {
        size: editingSize.size,
        description: editingSize.description
      });
      toast.success('Size updated successfully!');
      setEditingSize(null);
      fetchSizes();
    } catch (error) {
      toast.error('Failed to update size');
    }
  };

  const deleteSize = async (id) => {
    if (window.confirm('Are you sure you want to delete this size?')) {
      try {
        await themeApi.deleteSize(id);
        toast.success('Size deleted successfully!');
        fetchSizes();
      } catch (error) {
        toast.error('Failed to delete size');
      }
    }
  };

  const startEdit = (size) => {
    setEditingSize({ ...size });
  };

  const cancelEdit = () => {
    setEditingSize(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="size-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <Package size={20} className="me-2" style={{ color: '#f26522' }} />
          Size Management
        </h4>
      </div>

      {/* Separate Size Guide Management */}
      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Size Guide Management (Separate)</h6>
            <button
              className="btn btn-sm btn-warning"
              onClick={replaceWithProvidedGuides}
            >
              Replace with Provided Guides
            </button>
          </div>
        </div>
        <div className="card-body">
          <p className="text-muted mb-3">
            Add JSON format guides separately for Casual Shirt, T-Shirt, and Pants.
          </p>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-bold">Casual Shirt Guide</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder='e.g., [["2-3Y",24,16],["3-4Y",26,17]]'
                value={sizeGuideSettings.casual_shirt.value}
                onChange={(e) => handleSizeGuideChange('casual_shirt', e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
              <button
                className="btn btn-sm mt-2"
                style={{ backgroundColor: '#f26522', color: 'white' }}
                onClick={() => saveSizeGuide('casual_shirt')}
                disabled={savingGuide.casual_shirt}
              >
                {savingGuide.casual_shirt ? 'Saving...' : 'Save Casual Shirt Guide'}
              </button>
            </div>

            <div className="col-12">
              <label className="form-label fw-bold">T-Shirt Guide</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder='e.g., [["2-3Y",23,15],["3-4Y",25,16]]'
                value={sizeGuideSettings.tshirt.value}
                onChange={(e) => handleSizeGuideChange('tshirt', e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
              <button
                className="btn btn-sm mt-2"
                style={{ backgroundColor: '#f26522', color: 'white' }}
                onClick={() => saveSizeGuide('tshirt')}
                disabled={savingGuide.tshirt}
              >
                {savingGuide.tshirt ? 'Saving...' : 'Save T-Shirt Guide'}
              </button>
            </div>

            <div className="col-12">
              <label className="form-label fw-bold">Pants Guide</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder='e.g., [["2-3Y",16,20],["3-4Y",18,22]]'
                value={sizeGuideSettings.pants.value}
                onChange={(e) => handleSizeGuideChange('pants', e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
              <button
                className="btn btn-sm mt-2"
                style={{ backgroundColor: '#f26522', color: 'white' }}
                onClick={() => saveSizeGuide('pants')}
                disabled={savingGuide.pants}
              >
                {savingGuide.pants ? 'Saving...' : 'Save Pants Guide'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Size */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white" style={{ backgroundColor: '#f26522' }}>
          <h6 className="mb-0">Add New Size</h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Size Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., 2-3 years, 9-12 months"
                value={newSize.size}
                onChange={(e) => setNewSize({ ...newSize, size: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Description (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Suitable for kids aged 2-3 years"
                value={newSize.description}
                onChange={(e) => setNewSize({ ...newSize, description: e.target.value })}
              />
            </div>
            <div className="col-12 mt-3">
              <button
                className="btn btn-primary"
                onClick={addSize}
                style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
              >
                <Plus size={16} className="me-2" />
                Add Size
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sizes List */}
      <div className="card">
        <div className="card-header bg-dark text-white">
          <h6 className="mb-0">Available Sizes ({sizes.length})</h6>
        </div>
        <div className="card-body">
          {sizes.length === 0 ? (
            <div className="text-center py-4">
              <Package size={48} className="text-muted mb-3" />
              <p className="text-muted">No sizes found. Add your first size above.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Size Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) => (
                    <tr key={size.id}>
                      <td>{size.id}</td>
                      <td>
                        {editingSize?.id === size.id ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editingSize.size}
                            onChange={(e) => setEditingSize({ ...editingSize, size: e.target.value })}
                          />
                        ) : (
                          <strong>{typeof size.size === 'string' ? size.size : JSON.stringify(size.size)}</strong>
                        )}
                      </td>
                      <td>
                        {editingSize?.id === size.id ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editingSize.description || ''}
                            onChange={(e) => setEditingSize({ ...editingSize, description: e.target.value })}
                          />
                        ) : (
                          <span className="text-muted">{size.description || 'No description'}</span>
                        )}
                      </td>
                      <td>
                        {editingSize?.id === size.id ? (
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={updateSize}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={cancelEdit}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => startEdit(size)}
                              style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteSize(size.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SizeManagement;
