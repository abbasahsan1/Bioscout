import React from 'react';
import './ObservationDetails.css';

const ObservationDetails = ({ observation }) => {
  // Find the section that displays AI identification results
  const renderIdentificationInfo = () => {
    if (!observation.aiIdentification || observation.aiIdentification.length === 0) {
      return (
        <div className="identification-unavailable">
          <p>AI identification is currently processing. Check back later for results.</p>
        </div>
      );
    }
    
    return (
      <div className="identification-results">
        {/* Display AI identification results */}
        {observation.aiIdentification.map((identification, index) => (
          <div key={index} className="identification-result">
            {/* ...existing code to display identification... */}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="observation-container">
      {/* ...other observation details... */}
      {renderIdentificationInfo()}
      {/* ...other observation details... */}
    </div>
  );
};

export default ObservationDetails;