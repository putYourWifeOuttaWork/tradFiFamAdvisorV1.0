import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  AlertCircle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  Info,
  FileSpreadsheet,
  Rabbit,
  Turtle
} from 'lucide-react';
import { fetchRealTimePrice } from './services/finnhub';

function App() {
  const [positions, setPositions] = useState([{
    id: 1,
    stock: '',
    type: 'short_put',
    currentPrice: '',
    strikePrice: '',
    expirationDate: '',
    strategy: 'tortoise'
  }]);

  const [magnificentSeven, setMagnificentSeven] = useState([
    { symbol: 'AAPL', name: 'Apple', price: '0' },
    { symbol: 'MSFT', name: 'Microsoft', price: '0' },
    { symbol: 'GOOGL', name: 'Google', price: '0' },
    { symbol: 'AMZN', name: 'Amazon', price: '0' },
    { symbol: 'META', name: 'Meta', price: '0' },
    { symbol: 'NVDA', name: 'NVIDIA', price: '0' },
    { symbol: 'TSLA', name: 'Tesla', price: '0' }
  ]);

  useEffect(() => {
    const fetchPrices = async () => {
      const updatedStocks = await Promise.all(
        magnificentSeven.map(async (stock) => {
          const price = await fetchRealTimePrice(stock.symbol);
          return {
            ...stock,
            price: price.toFixed(2)
          };
        })
      );
      setMagnificentSeven(updatedStocks);
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const addPosition = () => {
    setPositions([...positions, {
      id: positions.length + 1,
      stock: '',
      type: 'short_put',
      currentPrice: '',
      strikePrice: '',
      expirationDate: '',
      strategy: 'tortoise'
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
        safetyReserve: position.strategy === 'hare' ? estimatedPremium * 0.125 : estimatedPremium * 0.05,
        recommendedAction: {
          type: position.type,
          strikePrice: strikePrice,
          expirationDate: position.expirationDate,
          daysToAdd: 0
        }
      };
    }

    const percentageMove = position.type === 'short_put'
      ? ((strikePrice - currentPrice) / strikePrice) * 100
      : ((currentPrice - strikePrice) / strikePrice) * 100;

    const taxReserve = Math.round(estimatedPremium * 0.25);
    const safetyReserve = position.strategy === 'hare' ? 
      Math.round(estimatedPremium * 0.125) : 
      Math.round(estimatedPremium * 0.05);

    if (daysToExpiration <= 15 && percentageMove >= 12) {
      return {
        status: 'roll',
        message: `The TradFi Family Would: ROLL this position. With ${daysToExpiration} days left and ${percentageMove.toFixed(1)}% ITM, roll to same strike (${strikePrice}) ${daysToExpiration + 30} days out.`,
        premium: estimatedPremium,
        taxReserve,
        safetyReserve,
        recommendedAction: {
          type: position.type,
          strikePrice: strikePrice,
          expirationDate: new Date(new Date(position.expirationDate).getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          daysToAdd: 30
        }
      };
    }

    if (daysToExpiration <= 15 && percentageMove > 0 && percentageMove < 12) {
      const newType = position.type === 'short_put' ? 'short_call' : 'short_put';
      return {
        status: 'assign',
        message: `The TradFi Family Would: PREPARE FOR ASSIGNMENT. Within 3 days of assignment, sell ${position.type === 'short_put' ? 'calls' : 'puts'} at 45-50 Delta, targeting 30-40 DTE.`,
        premium: estimatedPremium,
        taxReserve,
        safetyReserve,
        recommendedAction: {
          type: newType,
          strikePrice: Math.round(currentPrice * (position.type === 'short_put' ? 1.1 : 0.9)),
          expirationDate: new Date(new Date().getTime() + (35 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          daysToAdd: 35
        }
      };
    }

    return {
      status: 'hold',
      message: 'The TradFi Family Would: HOLD this position. No action needed at this time.',
      premium: estimatedPremium,
      taxReserve,
      safetyReserve,
      recommendedAction: {
        type: position.type,
        strikePrice: strikePrice,
        expirationDate: position.expirationDate,
        daysToAdd: 0
      }
    };
  };

  const exportToSpreadsheet = () => {
    const escapeCSV = (str) => {
      if (typeof str !== 'string') str = String(str);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      'Position #',
      'Stock',
      'Strategy',
      'Position Type (Current)',
      'Position Type (Recommended)',
      'Strike Price (Current)',
      'Strike Price (Recommended)',
      'Expiration Date (Current)',
      'Expiration Date (Recommended)',
      'Current Price',
      'Premium',
      'Tax Reserve',
      'Safety Reserve',
      'Status',
      'Recommendation'
    ];

    let csv = headers.map(escapeCSV).join(',') + '\n';
    
    positions.forEach((position, index) => {
      if (position.stock && position.currentPrice && position.strikePrice && position.expirationDate) {
        const analysis = analyzePosition(position);
        const stock = magnificentSeven.find(s => s.symbol === position.stock)?.name || position.stock;
        
        const row = [
          index + 1,
          stock,
          position.strategy === 'hare' ? 'Hare' : 'Tortoise',
          position.type === 'short_put' ? 'Short Put' : 'Short Call',
          analysis.recommendedAction.type === 'short_put' ? 'Short Put' : 'Short Call',
          position.strikePrice,
          analysis.recommendedAction.strikePrice,
          position.expirationDate,
          analysis.recommendedAction.expirationDate,
          position.currentPrice,
          analysis.premium,
          analysis.taxReserve,
          analysis.safetyReserve,
          analysis.status.toUpperCase(),
          analysis.message
        ];

        csv += row.map(escapeCSV).join(',') + '\n';
      }
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tradfi-family-positions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">What Would TradFiFam Do?r</h1>
          <p className="text-gray-600">Manage your current positions with full knowledge of what TradFiWife does based on simple rules.</p>
        </div>

        {positions.map((position, index) => (
          <div key={position.id} className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-500 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Position {index + 1}
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Strategy Aggression</label>
                  <div className="flex gap-4">
                    <button
                      className={`flex-1 p-3 rounded-lg border ${
                        position.strategy === 'tortoise'
                          ? 'bg-green-100 border-green-500 text-green-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      } flex items-center justify-center transition-colors duration-200`}
                      onClick={() => updatePosition(index, 'strategy', 'tortoise')}
                    >
                      <Turtle className="h-5 w-5 mr-2" />
                      Tortoise
                    </button>
                    <button
                      className={`flex-1 p-3 rounded-lg border ${
                        position.strategy === 'hare'
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      } flex items-center justify-center transition-colors duration-200`}
                      onClick={() => updatePosition(index, 'strategy', 'hare')}
                    >
                      <Rabbit className="h-5 w-5 mr-2" />
                      Hare
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position Type</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={position.type}
                    onChange={(e) => updatePosition(index, 'type', e.target.value)}
                  >
                    <option value="short_put">Short Put</option>
                    <option value="short_call">Short Call</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Price</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={position.currentPrice}
                    onChange={(e) => updatePosition(index, 'currentPrice', e.target.value)}
                    placeholder="Enter current price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Strike Price</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={position.strikePrice}
                    onChange={(e) => updatePosition(index, 'strikePrice', e.target.value)}
                    placeholder="Enter strike price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Date</label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={position.expirationDate}
                    onChange={(e) => updatePosition(index, 'expirationDate', e.target.value)}
                  />
                </div>
              </div>

              {position.stock && position.currentPrice && position.strikePrice && position.expirationDate && (
                <div className="mt-6">
                  {(() => {
                    const analysis = analyzePosition(position);
                    const statusColors = {
                      incomplete: 'bg-gray-50 border-gray-200',
                      roll: 'bg-yellow-50 border-yellow-200',
                      assign: 'bg-blue-50 border-blue-200',
                      hold: 'bg-green-50 border-green-200'
                    };

                    const statusIcons = {
                      roll: <AlertCircle className="h-6 w-6 text-yellow-500" />,
                      assign: <Info className="h-6 w-6 text-blue-500" />,
                      hold: <CheckCircle className="h-6 w-6 text-green-500" />
                    };

                    return (
                      <div className={`${statusColors[analysis.status]} border rounded-lg p-6`}>
                        <div className="flex items-start space-x-4">
                          {statusIcons[analysis.status]}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">TradFi Family Analysis</h3>
                            <p className="text-gray-700">{analysis.message}</p>
                            
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center mb-2">
                                  <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                                  <h4 className="font-medium text-gray-900">Contract Premium</h4>
                                </div>
                                <p className="text-gray-700">${analysis.premium}</p>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center mb-2">
                                  <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                                  <h4 className="font-medium text-gray-900">Tax Reserve</h4>
                                </div>
                                <p className="text-gray-700">${analysis.taxReserve} (25%)</p>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center mb-2">
                                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                                  <h4 className="font-medium text-gray-900">Safety Reserve</h4>
                                </div>
                                <p className="text-gray-700">
                                  ${analysis.safetyReserve} ({position.strategy === 'hare' ? '12.5%' : '5%'})
                                </p>
                              </div>
                            </div>
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

        <div className="flex gap-4">
          <button
            onClick={addPosition}
            className="flex-1 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center shadow-lg"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add Another Position
          </button>

          <button
            onClick={exportToSpreadsheet}
            className="flex-1 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center justify-center shadow-lg"
            disabled={!positions.some(p => p.stock && p.currentPrice && p.strikePrice && p.expirationDate)}
          >
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            Export to Spreadsheet
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
