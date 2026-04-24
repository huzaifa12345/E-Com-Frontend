import { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { X } from 'lucide-react';
import '../assets/css/WhatsAppFloatingButton.css';

const WhatsAppFloatingButton = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('+923364500091'); // Default number

  useEffect(() => {
    // Fetch WhatsApp number from website settings
    const fetchWhatsAppNumber = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/website-settings`);
        const data = await response.json();
        if (data.success && data.data) {
          // Look for WhatsApp number in settings
          const allSettings = Object.values(data.data).flat();
          const whatsappSetting = allSettings.find(setting => 
            setting.key === 'whatsapp_number' || 
            setting.key === 'contact_whatsapp' ||
            setting.key === 'whatsapp'
          );
          if (whatsappSetting && whatsappSetting.value) {
            setPhoneNumber(whatsappSetting.value);
          }
        }
      } catch (error) {
        console.error('Error fetching WhatsApp number:', error);
      }
    };

    fetchWhatsAppNumber();
  }, []);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hello! I would like to inquire about your products.');
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isVisible) return null;

  return (
    <div className="whatsapp-floating">
      <button
        className="whatsapp-btn"
        onClick={handleWhatsAppClick}
      >
        <FaWhatsapp size={68} />
      </button>
    </div>
  );
};

export default WhatsAppFloatingButton;
