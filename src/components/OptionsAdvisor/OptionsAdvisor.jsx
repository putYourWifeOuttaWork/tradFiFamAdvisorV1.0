import React, { useState } from 'react';
import {
  PlusCircle,
  AlertCircle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  Info
} from 'lucide-react';

const OptionsAdvisor = () => {
  const [positions, setPositions] = useState([{
    id: 1,
    stock: '',
    type: 'short_put',
    currentPrice: '',
    strikePrice: '',
    expirationDate: '',
  }]);

  const magnificentSeven = [
    { symbol: 'AAPL', name: 'Apple', price: '173.50' },
    { symbol: 'MSFT', name: 'Microsoft', price: '425.22' },
    { symbol: 'GOOGL', name: 'Google', price: '147.60' },
    { symbol: 'AMZN', name: 'Amazon', price: '178.25' },
    { symbol: 'META', name: 'Meta', price: '509.58' },
    { symbol: 'NVDA', name: 'NVIDIA', price: '878.35' },
    { symbol: 'TSLA', name: 'Tesla', price: '175.75' }
  ];

  const addPosition = () => {
    setPositions([...positions, {
      id: positions.length + 1,
      stock: '',
      type: 'short_put',
      currentPrice: '',
      strikePrice: '',
      expirationDate: '',
    }]);
  };

  const updatePosition = (index, field, value) => {
    const newPositions = [...positions];
    if (field === 'stock') {
      const stock = magnificentSeven.find(s => s.symbol === value);
      newPositions[index].currentPrice = stock ? stock.price : '';
    }
    newPositions[index][field] = value;
    setPositions(newPositions);
  };

  const calculateDaysToExpiration = (expirationDate) => {
    if (!expirationDate) return null;
    const expiry = new Date(expirationDate);
    const today = new Date();
    const diff = expiry - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateEstimatedPremium = (strikePrice) => {
    const premium = parseFloat(strikePrice) * 0.07 * 100;
    return Math.round(premium);
  };

  const analyzePosition = (position) => {
    const daysToExpiration = calculateDaysToExpiration(position.expirationDate);
    const currentPrice = parseFloat(position.currentPrice);
    const strikePrice = parseFloat(position.strikePrice);
    const estimatedPremium = calculateEstimatedPremium(strikePrice);

    if (!daysToExpiration || !currentPrice || !strikePrice) {
      return {
        status: 'incomplete',
        message: 'Please fill in all fields',
        premium: 0,
        taxReserve: 0,
        safetyReserve: { hare: 0, tortoise: 0 }
      };
    }

    const percentageMove = position.type === 'short_put'
      ? ((strikePrice - currentPrice) / strikePrice) * 100
      : ((currentPrice - strikePrice) / strikePrice) * 100;

    const taxReserve = Math.round(estimatedPremium * 0.25);
    const safetyReserve = {
      hare: Math.round(estimatedPremium * 0.125),
      tortoise: Math.round(estimatedPremium * 0.05)
    };

    if (daysToExpiration <= 15 && percentageMove >= 12) {
      return {
        status: 'roll',
        message: `The TradFi Family Would: ROLL this position. With ${daysToExpiration} days left and ${percentageMove.toFixed(1)}% ITM, roll to same strike (${strikePrice}) ${daysToExpiration + 30} days out.`,
        premium: estimatedPremium,
        taxReserve,
        safetyReserve
      };
    }

    if (daysToExpiration <= 15 && percentageMove > 0 && percentageMove < 12) {
      return {
        status: 'assign',
        message: `The TradFi Family Would: PREPARE FOR ASSIGNMENT. Within 3 days of assignment, sell ${position.type === 'short_put' ? 'calls' : 'puts'} at 45-50 Delta, targeting 30-40 DTE.`,
        premium: estimatedPremium,
        taxReserve,
        safetyReserve
      };
    }

    return {
      status: 'hold',
      message: 'The TradFi Family Would: HOLD this position. No action needed at this time.',
      premium: estimatedPremium,
      taxReserve,
      safetyReserve
    };
  };

  return (
    <div className="options-advisor-container">
      <div className="options-advisor-content">
        <div className="options-advisor-header">
          <h1>Magnificent Seven Options Advisor</h1>
          <p>Manage your short options positions with confidence</p>
        </div>

        {positions.map((position, index) => (
          <div key={position.id} className="position-card">
            <div className="position-header">
              <TrendingUp className="position-icon" />
              <h2>Position {index + 1}</h2>
            </div>

            <div className="position-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Stock</label>
                  <select
                    value={position.stock}
                    onChange={(e) => updatePosition(index, 'stock', e.target.value)}
                  >
                    <option value="">Select Stock</option>
                    {magnificentSeven.map(stock => (
                      <option key={stock.symbol} value={stock.symbol}>
                        {stock.name} ({stock.symbol}) - ${stock.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Position Type</label>
                  <select
                    value={position.type}
                    onChange={(e) => updatePosition(index, 'type', e.target.value)}
                  >
                    <option value="short_put">Short Put</option>
                    <option value="short_call">Short Call</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Current Price</label>
                  <input
                    type="number"
                    value={position.currentPrice}
                    onChange={(e) => updatePosition(index, 'currentPrice', e.target.value)}
                    placeholder="Enter current price"
                  />
                </div>

                <div className="form-group">
                  <label>Strike Price</label>
                  <input
                    type="number"
                    value={position.strikePrice}
                    onChange={(e) => updatePosition(index, 'strikePrice', e.target.value)}
                    placeholder="Enter strike price"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Expiration Date</label>
                  <input
                    type="date"
                    value={position.expirationDate}
                    onChange={(e) => updatePosition(index, 'expirationDate', e.target.value)}
                  />
                </div>
              </div>

              {position.stock && position.currentPrice && position.strikePrice && position.expirationDate && (
                <div className="analysis-section">
                  {(() => {
                    const analysis = analyzePosition(position);
                    return (
                      <div className={`analysis-card ${analysis.status}`}>
                        <div className="analysis-header">
                          {analysis.status === 'roll' && <AlertCircle />}
                          {analysis.status === 'assign' && <Info />}
                          {analysis.status === 'hold' && <CheckCircle />}
                          <h3>TradFi Family Analysis</h3>
                        </div>
                        
                        <p className="analysis-message">{analysis.message}</p>
                        
                        <div className="analysis-details">
                          <div className="detail-card">
                            <DollarSign />
                            <h4>Contract Premium</h4>
                            <p>${analysis.premium}</p>
                          </div>
                          <div className="detail-card">
                            <DollarSign />
                            <h4>Tax Reserve</h4>
                            <p>${analysis.taxReserve} (25%)</p>
                          </div>
                          <div className="detail-card">
                            <Calendar />
                            <h4>Safety Reserve</h4>
                            <p>
                              Hare: ${analysis.safetyReserve.hare} (12.5%)<br />
                              Tortoise: ${analysis.safetyReserve.tortoise} (5%)
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        ))}

        <button onClick={addPosition} className="add-position-btn">
          <PlusCircle />
          Add Another Position
        </button>
      </div>
    </div>
  );
};

export default OptionsAdvisor;