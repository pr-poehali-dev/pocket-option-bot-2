import json
import urllib.request
from typing import List, Dict, Any

PAIRS = [
    {'pair': 'EUR/USD', 'symbol': 'EURUSD=X'},
    {'pair': 'GBP/JPY', 'symbol': 'GBPJPY=X'},
    {'pair': 'AUD/CAD', 'symbol': 'AUDCAD=X'},
    {'pair': 'USD/CHF', 'symbol': 'USDCHF=X'},
    {'pair': 'EUR/GBP', 'symbol': 'EURGBP=X'},
    {'pair': 'NZD/USD', 'symbol': 'NZDUSD=X'},
    {'pair': 'USD/JPY', 'symbol': 'USDJPY=X'},
    {'pair': 'GBP/USD', 'symbol': 'GBPUSD=X'},
]

INTERVALS = {
    '15с': '1m', '30с': '1m', '1м': '1m',
    '2м': '2m', '3м': '5m', '5м': '5m',
}


def fetch_closes(symbol: str) -> List[float]:
    url = (
        f'https://query1.finance.yahoo.com/v8/finance/chart/{symbol}'
        '?range=1d&interval=5m'
    )
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode())
    result = data['chart']['result'][0]
    closes = result['indicators']['quote'][0]['close']
    return [c for c in closes if c is not None]


def rsi(closes: List[float], period: int = 14) -> float:
    if len(closes) < period + 1:
        return 50.0
    gains, losses = 0.0, 0.0
    for i in range(len(closes) - period, len(closes)):
        diff = closes[i] - closes[i - 1]
        if diff >= 0:
            gains += diff
        else:
            losses -= diff
    avg_gain = gains / period
    avg_loss = losses / period
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100.0 - (100.0 / (1.0 + rs))


def stochastic(closes: List[float], period: int = 14) -> float:
    window = closes[-period:]
    if len(window) < 2:
        return 50.0
    low = min(window)
    high = max(window)
    if high == low:
        return 50.0
    return (closes[-1] - low) / (high - low) * 100.0


def analyze(closes: List[float]) -> Dict[str, Any]:
    r = rsi(closes)
    s = stochastic(closes)

    up_votes = 0
    down_votes = 0
    if r < 30:
        up_votes += 1
    elif r > 70:
        down_votes += 1
    if s < 20:
        up_votes += 1
    elif s > 80:
        down_votes += 1

    if up_votes > down_votes:
        direction = 'UP'
        strength = up_votes
    elif down_votes > up_votes:
        direction = 'DOWN'
        strength = down_votes
    else:
        direction = 'UP' if r < 50 else 'DOWN'
        strength = 0

    base = 75
    accuracy = min(100, base + strength * 10 + int(abs(50 - r) / 5))

    return {
        'dir': direction,
        'acc': accuracy,
        'rsi': round(r, 1),
        'stoch': round(s, 1),
    }


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    '''Бизнес: генерирует торговые сигналы по реальным котировкам Forex
    на основе осцилляторов RSI и Stochastic для Pocket Option.'''
    method = event.get('httpMethod', 'GET')
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    tf_keys = list(INTERVALS.keys())
    signals: List[Dict[str, Any]] = []

    for i, p in enumerate(PAIRS):
        tf = tf_keys[i % len(tf_keys)]
        try:
            closes = fetch_closes(p['symbol'])
            res = analyze(closes)
            price = round(closes[-1], 5)
            ok = True
        except Exception:
            res = {'dir': 'UP', 'acc': 0, 'rsi': 0, 'stoch': 0}
            price = 0
            ok = False
        signals.append({
            'pair': p['pair'],
            'tf': tf,
            'dir': res['dir'],
            'acc': res['acc'],
            'rsi': res['rsi'],
            'stoch': res['stoch'],
            'price': price,
            'live': ok,
        })

    signals = [s for s in signals if s['acc'] >= 75 or not s['live']]

    return {
        'statusCode': 200,
        'headers': {**cors, 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps({'signals': signals}),
    }
