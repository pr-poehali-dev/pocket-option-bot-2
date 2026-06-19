CREATE TABLE t_p31554508_pocket_option_bot_2.signals_history (
  id SERIAL PRIMARY KEY,
  pair VARCHAR(10) NOT NULL,
  direction VARCHAR(4) NOT NULL,
  timeframe VARCHAR(5) NOT NULL,
  accuracy INT NOT NULL,
  rsi NUMERIC(5,1),
  stoch NUMERIC(5,1),
  price NUMERIC(12,5),
  result VARCHAR(4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p31554508_pocket_option_bot_2.winrate_cache (
  id SERIAL PRIMARY KEY,
  total INT DEFAULT 0,
  wins INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO t_p31554508_pocket_option_bot_2.winrate_cache (total, wins) VALUES (0, 0);
