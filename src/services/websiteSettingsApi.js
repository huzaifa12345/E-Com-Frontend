// Website Settings API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const websiteSettingsApi = {
  // Get all website settings
  getWebsiteSettings: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/website-settings`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching website settings:', error);
      throw error;
    }
  },

  // Get specific setting by key
  getSettingByKey: async (key) => {
    try {
      const response = await fetch(`${API_BASE_URL}/website-settings/${key}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching setting:', error);
      throw error;
    }
  },

  // Update website setting
  updateWebsiteSetting: async (id, value, imageFile = null) => {
    try {
      const formData = new FormData();
      formData.append('value', value);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/website-settings/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating website setting:', error);
      throw error;
    }
  },

  // Initialize default settings
  initializeSettings: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/website-settings/initialize`, {
        method: 'POST',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error initializing settings:', error);
      throw error;
    }
  },

  /** Admin: create missing boys_category_N / girls_category_N rows to match current L3 category counts */
  ensureCategoryCardSlots: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/website-settings/ensure-category-cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    let data = {};
    try {
      data = await response.json();
    } catch {
      /* non-JSON body */
    }
    if (!response.ok) {
      const err = new Error(data.error || 'Failed to sync category card slots');
      err.status = response.status;
      throw err;
    }
    return data;
  },
};

export default websiteSettingsApi;
