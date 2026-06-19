import json
import os
import psycopg2
from datetime import datetime

SCHEMA = 't_p31554508_pocket_option_bot_2'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    '''Бизнес: сохраняет результат сигнала в историю и возвращает историю
    с реальным винрейтом для дашборда Pocket Option.'''

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')

    # POST — сохранить результат сигнала
    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        pair = body.get('pair', '')
        direction = body.get('dir', '')
        timeframe = body.get('tf', '')
        accuracy = int(body.get('acc', 0))
        rsi = body.get('rsi')
        stoch = body.get('stoch')
        price = body.get('price')
        result = body.get('result', '')  # WIN или LOSS

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f'INSERT INTO {SCHEMA}.signals_history '
            '(pair, direction, timeframe, accuracy, rsi, stoch, price, result) '
            'VALUES (%s,%s,%s,%s,%s,%s,%s,%s)',
            (pair, direction, timeframe, accuracy, rsi, stoch, price, result)
        )
        if result in ('WIN', 'LOSS'):
            cur.execute(
                f'UPDATE {SCHEMA}.winrate_cache SET total = total + 1, '
                'wins = wins + %s, updated_at = NOW()',
                (1 if result == 'WIN' else 0,)
            )
        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
        }

    # GET — вернуть историю + винрейт
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        f'SELECT pair, direction, timeframe, accuracy, rsi, stoch, price, result, created_at '
        f'FROM {SCHEMA}.signals_history '
        'ORDER BY created_at DESC LIMIT 50'
    )
    rows = cur.fetchall()
    history = [
        {
            'pair': r[0],
            'dir': r[1],
            'tf': r[2],
            'acc': r[3],
            'rsi': float(r[4]) if r[4] else None,
            'stoch': float(r[5]) if r[5] else None,
            'price': float(r[6]) if r[6] else None,
            'result': r[7],
            'time': r[8].strftime('%H:%M:%S') if r[8] else '',
        }
        for r in rows
    ]

    cur.execute(f'SELECT total, wins FROM {SCHEMA}.winrate_cache LIMIT 1')
    wrow = cur.fetchone()
    total = wrow[0] if wrow else 0
    wins = wrow[1] if wrow else 0
    winrate = round(wins / total * 100, 1) if total > 0 else 0

    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps({'history': history, 'winrate': winrate, 'total': total, 'wins': wins}),
    }
