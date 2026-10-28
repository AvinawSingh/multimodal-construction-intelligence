import React, { useState } from 'react';
import {
  IndianRupee,
  Building,
  TrendingUp,
  Percent,
  CheckSquare,
  Shield,
  HelpCircle,
  Home
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const AMENITY_OPTIONS = [
  'Covered Car Parking',
  '24/7 Gated Security & CCTV',
  '100% Power Backup',
  'Gymnasium & Fitness Center',
  'Swimming Pool',
  'Club House & Community Hall',
  'High-Speed Elevators',
  'Landscaped Garden & Play Zone'
];

export const RealEstateValuation = () => {
  const [formData, setFormData] = useState({
    city: 'Bengaluru',
    location: 'Indiranagar / Koramangala',
    property_area_sqft: 1450,
    property_type: 'Apartment',
    building_age_years: 3,
    condition: 'Good / Well Maintained',
    amenities: ['Covered Car Parking', '24/7 Gated Security & CCTV', '100% Power Backup'],
    parking_spaces: 1
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        city: formData.city,
        location: formData.location,
        property_area_sqft: parseFloat(formData.property_area_sqft) || 1000,
        property_type: formData.property_type,
        building_age_years: parseInt(formData.building_age_years, 10) || 0,
        condition: formData.condition,
        amenities: formData.amenities,
        parking_spaces: parseInt(formData.parking_spaces, 10) || 1
      };

      const res = await api.estimateValuation(payload);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to estimate property valuation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
          Defensible Real Estate Valuation & Yield Analysis
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
          Algorithmic market pricing, rental capitalization, age depreciation modeling, and 5-year capital appreciation projection.
        </p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      <div className="grid-2">
        {/* Form */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <IndianRupee size={18} color="#10b981" />
                <span>Property Attributes</span>
              </h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid-2" style={{ gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">City Market</label>
                  <select
                    name="city"
                    className="form-select"
                    value={formData.city}
                    onChange={handleInputChange}
                  >
                    <option value="Mumbai">Mumbai (₹17,500/sq.ft avg)</option>
                    <option value="Bengaluru">Bengaluru (₹9,200/sq.ft avg)</option>
                    <option value="Delhi NCR">Delhi NCR (₹11,500/sq.ft avg)</option>
                    <option value="Hyderabad">Hyderabad (₹8,200/sq.ft avg)</option>
                    <option value="Pune">Pune (₹7,800/sq.ft avg)</option>
                    <option value="Chennai">Chennai (₹7,500/sq.ft avg)</option>
                    <option value="Kolkata">Kolkata (₹6,200/sq.ft avg)</option>
                    <option value="Ahmedabad">Ahmedabad (₹5,800/sq.ft avg)</option>
                    <option value="Tier-2 Urban">Tier-2 Urban Centre (₹5,600/sq.ft)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Locality / Sector</label>
                  <input
                    type="text"
                    name="location"
                    className="form-input"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Bandra West, Whitefield, Cyber City..."
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Super Built-up Area (Sq.Ft)</label>
                  <input
                    type="number"
                    min="100"
                    step="10"
                    name="property_area_sqft"
                    className="form-input"
                    value={formData.property_area_sqft}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Property Typology</label>
                  <select
                    name="property_type"
                    className="form-select"
                    value={formData.property_type}
                    onChange={handleInputChange}
                  >
                    <option value="Apartment">Apartment / Flat</option>
                    <option value="Independent House">Independent House</option>
                    <option value="Villa">Gated Villa</option>
                    <option value="Commercial Office">Commercial Office Space</option>
                    <option value="Retail Shop">Retail Commercial Shop</option>
                  </select>
                </div>
              </div>

              <div className="grid-2" style={{ gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Building Age (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    name="building_age_years"
                    className="form-input"
                    value={formData.building_age_years}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Physical Condition</label>
                  <select
                    name="condition"
                    className="form-select"
                    value={formData.condition}
                    onChange={handleInputChange}
                  >
                    <option value="Brand New / Recently Built">Brand New / Recently Built</option>
                    <option value="Good / Well Maintained">Good / Well Maintained</option>
                    <option value="Under Construction">Under Construction</option>
                    <option value="Needs Renovation / Repair">Needs Renovation / Repair</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Car Parking Spaces</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  name="parking_spaces"
                  className="form-input"
                  value={formData.parking_spaces}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Society & Community Amenities</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {AMENITY_OPTIONS.map((amenity) => {
                    const isChecked = formData.amenities.includes(amenity);
                    return (
                      <label
                        key={amenity}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.80rem',
                          color: '#334155',
                          cursor: 'pointer',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          background: isChecked ? '#fff7ed' : '#f8fafc',
                          border: `1px solid ${isChecked ? '#fdba74' : '#e2e8f0'}`
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleAmenityToggle(amenity)}
                          style={{ accentColor: '#f97316' }}
                        />
                        <span>{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '12px' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    <span>Evaluating Benchmark Comps...</span>
                  </>
                ) : (
                  <>
                    <IndianRupee size={16} />
                    <span>Estimate Property Valuation</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div>
          {loading && (
            <div className="card">
              <LoadingSpinner label="Applying micro-market hedonic pricing, age depreciation curve, and rental yields..." />
            </div>
          )}

          {!loading && !result && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px', color: '#64748b' }}>
              <Home size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
              <h4 style={{ fontWeight: 600, color: '#334155', fontSize: '1.02rem', marginBottom: '6px' }}>
                Awaiting Property Specifications
              </h4>
              <p style={{ fontSize: '0.84rem', maxWidth: '360px', margin: '0 auto' }}>
                Provide property dimensions, city tier, and condition to view market value range and indicative monthly rentals.
              </p>
            </div>
          )}

          {!loading && result && (
            <div>
              {/* Valuation Card */}
              <div className="card" style={{ marginBottom: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Estimated Fair Market Value Range
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 10px' }}>
                  ₹{(result.estimated_market_value_min_inr / 10000000).toFixed(2)} Cr – ₹{(result.estimated_market_value_max_inr / 10000000).toFixed(2)} Cr
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#475569', background: '#f1f5f9', padding: '8px 14px', borderRadius: '8px' }}>
                  <span><strong>Midpoint Valuation:</strong> ₹{(result.estimated_market_value_avg_inr / 100000).toFixed(2)} Lakh</span>
                  <span><strong>Rate:</strong> ₹{result.price_per_sqft_inr.toLocaleString()}/sq.ft</span>
                </div>
              </div>

              {/* Rental Yield & ROI */}
              <div className="grid-2" style={{ gap: '14px', marginBottom: '16px' }}>
                <div className="stat-card">
                  <div>
                    <div className="stat-label">Indicative Monthly Rent</div>
                    <div className="stat-val" style={{ color: '#10b981', fontSize: '1.35rem' }}>
                      ₹{result.indicative_monthly_rent_inr.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      Gross Yield: {result.gross_rental_yield_percent}% p.a.
                    </div>
                  </div>
                  <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                    <Percent size={20} />
                  </div>
                </div>

                <div className="stat-card">
                  <div>
                    <div className="stat-label">5-Year Growth Scenario</div>
                    <div className="stat-val" style={{ color: '#3b82f6', fontSize: '1.35rem' }}>
                      +{result.roi_5yr_appreciation_percent}%
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      Compound capital appreciation
                    </div>
                  </div>
                  <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                    <TrendingUp size={20} />
                  </div>
                </div>
              </div>

              {/* Valuation Drivers */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <h4 className="card-title" style={{ marginBottom: '12px' }}>
                  <span>Hedonic Pricing Drivers</span>
                </h4>
                <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {result.valuation_drivers?.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              {/* Market Assumptions & Legal Disclaimer */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <h4 className="card-title" style={{ marginBottom: '10px' }}>
                  <span>Underwriting Assumptions</span>
                </h4>
                <ul style={{ paddingLeft: '18px', fontSize: '0.78rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {result.market_assumptions?.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              <div style={{ fontSize: '0.74rem', color: '#94a3b8', padding: '6px', lineHeight: 1.5 }}>
                {result.disclaimer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealEstateValuation;
