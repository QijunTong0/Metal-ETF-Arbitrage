import { useState, useMemo } from 'react';
import './App.css';

function App() {
  // Input states
  const [futuresPrice, setFuturesPrice] = useState<number | ''>('');
  const [forwardRate, setForwardRate] = useState<number | ''>('');
  const [gramsPerUnit, setGramsPerUnit] = useState<number | ''>('');
  const [etfPrice, setEtfPrice] = useState<number | ''>('');

  // Calculation
  const result = useMemo(() => {
    if (
      futuresPrice === '' ||
      forwardRate === '' ||
      gramsPerUnit === '' ||
      etfPrice === ''
    ) {
      return null;
    }

    // Assumptions:
    // - フォワードレート (Forward Rate) は、最も取引高が高い限月までの期間に対する実質レートとして入力されると仮定します。
    //   (例: 年率であれば日割り計算が不要、期間レートであればそのまま使用)
    // - 計算式: 理論先物価格 = 先物価格 / (1 + (フォワードレート / 100))
    const rateDecimal = forwardRate / 100;
    
    // 理論上の原資産価格（先物価格の単位あたり）
    // 先物価格を現在価値に割り引く
    const theoreticalUnderlyingPrice = futuresPrice / (1 + rateDecimal);

    // 理論上のETF価値
    const theoreticalEtfValue = theoreticalUnderlyingPrice * gramsPerUnit;

    // 乖離率: (市場価格 - 理論価格) / 理論価格
    const divergence = ((etfPrice - theoreticalEtfValue) / theoreticalEtfValue) * 100;

    return {
      theoreticalEtfValue,
      divergence
    };
  }, [futuresPrice, forwardRate, gramsPerUnit, etfPrice]);

  return (
    <>
      <h1>貴金属ETF裁定取引</h1>
      
      <div className="description-section">
        <h2>裁定取引のロジック</h2>
        <p>
          対象とする貴金属ETFでは、貴金属の本質金額は<strong>大阪証券取引所（OSE）の先物価格</strong>と、
          その限月までのその金属の<strong>フォワードレート</strong>で決まります。<br />
          これらを用いて算出した理論価格と、現在のETFの市場価格を比較することで<strong>乖離率</strong>を算出することができます。<br />
          ※最も取引高が高い限月の先物価格が自動的に選定されるため、「限月までの日数」の入力は不要です。
          また、基準金額に対応するグラム数は銘柄ごとに変動するため、入力が必要です。
        </p>
      </div>

      <div className="card calculator-section">
        <h3>乖離率計算機</h3>
        
        <div className="input-group">
          <label>
            OSE先物価格 (円):
            <input
              type="number"
              value={futuresPrice}
              onChange={(e) => setFuturesPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="例: 9800"
            />
          </label>
        </div>

        <div className="input-group">
          <label>
            フォワードレート (％):
            <input
              type="number"
              value={forwardRate}
              onChange={(e) => setForwardRate(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="例: 0.1"
              step="0.01"
            />
          </label>
        </div>

        <div className="input-group">
          <label>
            ETF一口あたりのグラム数 (g):
            <input
              type="number"
              value={gramsPerUnit}
              onChange={(e) => setGramsPerUnit(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="例: 1.0"
              step="0.0001"
            />
          </label>
        </div>

        <div className="input-group">
          <label>
            現在のETF市場価格 (円):
            <input
              type="number"
              value={etfPrice}
              onChange={(e) => setEtfPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="例: 9750"
            />
          </label>
        </div>

        {result && (
          <div className="result-display">
            <hr />
            <p>
              <strong>理論ETF価値:</strong> {result.theoreticalEtfValue.toFixed(2)} 円
            </p>
            <p>
              <strong>乖離率:</strong>{' '}
              <span style={{ color: result.divergence > 0 ? 'red' : 'blue', fontWeight: 'bold' }}>
                {result.divergence > 0 ? '+' : ''}{result.divergence.toFixed(3)} %
              </span>
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default App
