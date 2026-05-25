import React from 'react';
import '../styles/MentorsGallery.css';

// Import images
import aryanImg from '../images/aryan.png';
import chairmanImg from '../images/chairman.png';
import mehtaImg from '../images/mehta.png';
import reddyImg from '../images/reddy.png';
import vermaImg from '../images/verma.png';
import khannaImg from '../images/khanna.png';

const MentorsGallery = ({ onSelect, filterType = null, title = "Meet the UPSC Interview Board", subtitle = "Your board members will collectively evaluate your performance and personality" }) => {
  const mentors = [
    {
      id: 'chairman',
      name: 'The Chairman',
      role: 'Board Head',
      description: 'Senior retired bureaucrat focusing on administrative aptitude, ethics, and leadership.',
      avatar_id: '2ed7477f-3961-4ce1-b331-5e4530c55a57',
      image: chairmanImg,
      specialty: 'Ethics & Governance',
      type: 'panel'
    },
    {
      id: 'mehta',
      name: 'Dr. Mehta',
      role: 'Economics Expert',
      description: 'Specialist in Indian Economy and global trade dynamics. Known for her sharp fiscal analysis.',
      avatar_id: '2bc759ab-a7e5-4b91-941d-9e42450d6546',
      image: mehtaImg,
      specialty: 'Economy & Trade',
      type: 'panel'
    },
    {
      id: 'reddy',
      name: 'Prof. Reddy',
      role: 'History & Culture',
      description: 'Expert in Indian heritage, social issues, and constitutional history.',
      avatar_id: '1c7a7291-ee28-4800-8f34-acfbfc2d07c0',
      image: reddyImg,
      specialty: 'History & Society',
      type: 'panel'
    },
    {
      id: 'verma',
      name: 'Ms. Verma',
      role: 'Science & Tech',
      description: 'Focuses on digitalization, AI ethics, environment, and climate change.',
      avatar_id: 'b5bebaf9-ae80-4e43-b97f-4506136ed926',
      image: vermaImg,
      specialty: 'S&T, Environment',
      type: 'panel'
    },
    {
      id: 'khanna',
      name: 'Col. Khanna',
      role: 'Security & IR',
      description: 'Expert in internal security, border management, and international relations.',
      avatar_id: '6a2c8805-d15d-4b57-b98d-699c05a4d624',
      image: khannaImg,
      specialty: 'Security & IR',
      type: 'panel'
    }
  ];

  return (
    <div className="mentors-gallery-container">
      <div className="gallery-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="mentors-grid">
        {mentors.map((mentor) => (
          <div 
            key={mentor.id} 
            className="mentor-card"
            onClick={() => onSelect && onSelect(mentor)}
          >
            <div className="mentor-image-wrapper">
              <img src={mentor.image} alt={mentor.name} className="mentor-img" />
              <div className="mentor-overlay">
                <span className="specialty-tag">{mentor.specialty}</span>
              </div>
            </div>
            <div className="mentor-info">
              <div className="mentor-role-badge">{mentor.role}</div>
              <h3>{mentor.name}</h3>
              <p>{mentor.description}</p>
              <button className="connect-btn">
                Select for Session
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorsGallery;
